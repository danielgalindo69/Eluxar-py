import sys
import io
import os
import asyncio
import time
import uuid
import functools

from dotenv import load_dotenv

# ── Encoding fix (Windows dev — must happen before any output) ────────────────
os.environ["PYTHONIOENCODING"] = "utf-8"
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
except AttributeError:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ── Load .env (dev only; Render injects env vars in production) ───────────────
load_dotenv()

# ── Mirascope provider registration ───────────────────────────────────────────
from mirascope import llm  # noqa: E402

llm.register_provider(
    "openai",
    scope="groq/",
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY", ""),
)

from flask import Flask, request, jsonify, g  # noqa: E402
from flask_cors import CORS  # noqa: E402

from agent import process_chat, process_fragrance_test, process_image_edit  # noqa: E402
from utils.logger import get_logger  # noqa: E402

log = get_logger(__name__)

# ── Application ───────────────────────────────────────────────────────────────
app = Flask(__name__)

app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB

# ── CORS ──────────────────────────────────────────────────────────────────────
_raw_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# ── Internal API Key ──────────────────────────────────────────────────────────
_INTERNAL_API_KEY: str = os.environ.get("INTERNAL_API_KEY", "")


def require_internal_key(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        if _INTERNAL_API_KEY:
            provided = request.headers.get("X-Internal-Key", "")
            if provided != _INTERNAL_API_KEY:
                log.warning(
                    "[%s] Unauthorized request to %s",
                    getattr(g, "request_id", "?"),
                    request.path,
                )
                return jsonify({"error": "No autorizado"}), 401
        return fn(*args, **kwargs)
    return wrapper


# ── Correlation ID + Request timing ──────────────────────────────────────────
@app.before_request
def _before():
    g.request_id = str(uuid.uuid4())[:8]
    g.start_time = time.monotonic()
    log.info("[%s] → %s %s", g.request_id, request.method, request.path)


@app.after_request
def _after(response):
    duration_ms = int((time.monotonic() - g.start_time) * 1000)
    log.info(
        "[%s] ← %s %s %dms",
        g.request_id,
        response.status_code,
        request.path,
        duration_ms,
    )
    return response


# ── Error handlers ────────────────────────────────────────────────────────────
@app.errorhandler(413)
def _payload_too_large(e):
    log.warning("[%s] Payload too large: %s", getattr(g, "request_id", "?"), e)
    return jsonify({"error": "Payload demasiado grande. Máximo 20 MB por solicitud."}), 413


# ── Helpers ───────────────────────────────────────────────────────────────────
LLM_TIMEOUT_SECONDS = int(os.environ.get("LLM_TIMEOUT_SECONDS", "45"))


def _extract_real_exception(exc: BaseException) -> BaseException:
    """Unwrap ExceptionGroup (Python 3.11+) to the root cause."""
    if isinstance(exc, BaseExceptionGroup):
        return _extract_real_exception(exc.exceptions[0])
    return exc


def _parse_json_body() -> tuple[dict | None, object]:
    """
    Safely parse the request JSON body.

    Returns (data, error_response) where error_response is None on success,
    or a Flask response object with HTTP 400 on failure.
    """
    data = request.get_json(silent=True)
    if data is None:
        err = jsonify({"error": "El body debe ser JSON válido (Content-Type: application/json)."})
        err.status_code = 400
        return None, err
    return data, None


# ── Chat endpoint ─────────────────────────────────────────────────────────────
@app.route("/chat", methods=["POST"])
@require_internal_key
def chat_endpoint():
    data, err = _parse_json_body()
    if err:
        return err

    message: str = data.get("message", "")
    history: list = data.get("history", [])

    if not message:
        return jsonify({"error": "El campo 'message' es requerido."}), 400

    log.info("[%s] /chat message=%r history_len=%d", g.request_id, message[:60], len(history))

    try:
        response_text, updated_history = asyncio.run(
            asyncio.wait_for(process_chat(message, history), timeout=LLM_TIMEOUT_SECONDS)
        )
        return jsonify({"response": response_text, "history": updated_history})

    except asyncio.TimeoutError:
        log.error("[%s] /chat timed out after %ds.", g.request_id, LLM_TIMEOUT_SECONDS)
        return jsonify({"error": "El asistente tardó demasiado. Por favor intenta de nuevo."}), 504

    except Exception as exc:
        real = _extract_real_exception(exc)
        log.error("[%s] /chat error: %s", g.request_id, real, exc_info=True)
        return jsonify({"error": str(real)}), 500


# ── Fragrance Test endpoint ───────────────────────────────────────────────────
@app.route("/fragrance-test", methods=["POST"])
@require_internal_key
def fragrance_test_endpoint():
    data, err = _parse_json_body()
    if err:
        return err

    message: str = data.get("message", "")
    history: list = data.get("history", [])
    step: int = data.get("step", 0)

    log.info(
        "[%s] /fragrance-test step=%d history_len=%d message=%r",
        g.request_id, step, len(history), message[:60],
    )

    try:
        result = asyncio.run(
            asyncio.wait_for(
                process_fragrance_test(message, history, step),
                timeout=LLM_TIMEOUT_SECONDS,
            )
        )
        return jsonify(result)

    except asyncio.TimeoutError:
        log.error("[%s] /fragrance-test timed out after %ds.", g.request_id, LLM_TIMEOUT_SECONDS)
        return jsonify({"error": "El test tardó demasiado. Por favor intenta de nuevo."}), 504

    except Exception as exc:
        real = _extract_real_exception(exc)
        log.error("[%s] /fragrance-test error: %s", g.request_id, real, exc_info=True)
        return jsonify({"error": str(real)}), 500


# ── Image Editing endpoint ────────────────────────────────────────────────────
@app.route("/edit-image", methods=["POST"])
@require_internal_key
def edit_image_endpoint():
    data, err = _parse_json_body()
    if err:
        return err

    image_base64: str = data.get("image_base64", "")
    style: str = data.get("style", "")
    additional_prompt: str = data.get("additional_prompt", "")

    if not image_base64:
        return jsonify({"error": "El campo 'image_base64' es requerido."}), 400

    log.info("[%s] /edit-image style=%r prompt=%r", g.request_id, style[:40], additional_prompt[:40])

    try:
        result = process_image_edit(image_base64, style, additional_prompt)
        return jsonify(result)

    except ValueError as exc:
        log.warning("[%s] /edit-image validation error: %s", g.request_id, exc)
        return jsonify({"error": str(exc)}), 400

    except Exception as exc:
        log.error("[%s] /edit-image error: %s", g.request_id, exc, exc_info=True)
        return jsonify({"error": str(exc)}), 500


# ── Dev server ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
