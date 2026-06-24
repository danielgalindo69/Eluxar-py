import base64
import io
import os

import requests
from requests.exceptions import HTTPError, RequestException
from PIL import Image

from config.ai_config import CLIPDROP_API_KEY
from utils.logger import get_logger

log = get_logger(__name__)

# ── Headers de rate-limit que nos interesan capturar ───────────────────────────
_RATE_HEADERS = [
    "Retry-After",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
]


def _log_rate_limit_headers(resp: requests.Response, prefix: str = "") -> None:
    """Registra todos los headers de rate-limit que vengan en la respuesta."""
    for h in _RATE_HEADERS:
        val = resp.headers.get(h)
        if val:
            log.warning("%sRATE_HEADER %s=%s", prefix, h, val)

# ── Constants ─────────────────────────────────────────────────────────────────
CLIPDROP_URL = "https://clipdrop-api.co/replace-background/v1"
CLIPDROP_TIMEOUT_SECONDS = 30
MAX_DECODED_BYTES = 10 * 1024 * 1024  # 10 MB después de decodificación base64


def process_image_edit(image_base64: str, style: str, additional_prompt: str) -> dict:
    """
    Decode a base64 image and call Clipdrop to replace its background.

    Args:
        image_base64:      Raw base64 string (with or without data-URI prefix).
        style:             Style descriptor, e.g. "elegante, oscuro".
        additional_prompt: Extra prompt text, e.g. "fondo de mármol".

    Returns:
        dict with keys ``edited_image_base64`` and ``original_image_base64``.

    Raises:
        ValueError:  If the decoded image exceeds MAX_DECODED_BYTES.
        RuntimeError: If Clipdrop returns a non-200 status.
    """
    # 1. Quita el prefijo data-URI si está presente.
    if image_base64.startswith("data:image"):
        image_base64 = image_base64.split(",", 1)[1]

    # 2.Decodificar y comprobar el tamaño.
    image_data = base64.b64decode(image_base64)
    if len(image_data) > MAX_DECODED_BYTES:
        raise ValueError(
            f"La imagen decodificada excede el límite de "
            f"{MAX_DECODED_BYTES // 1024 // 1024} MB."
        )

    # 3. Abre con PIL y convierte a PNG para la API.
    original_img = Image.open(io.BytesIO(image_data)).convert("RGBA")
    image_buffer = io.BytesIO()
    original_img.save(image_buffer, format="PNG")
    image_buffer.seek(0)

    # 4. Construye el prompt.
    parts = [p.strip() for p in [style, additional_prompt] if p.strip()]
    prompt_final = ", ".join(parts + ["professional perfume photography", "high quality", "studio lighting"])

    log.info("Calling ClipDrop API. url=%s prompt=%r", CLIPDROP_URL, prompt_final[:80])

    # 5. Llama a la API de Clipdrop.
    headers = {"x-api-key": CLIPDROP_API_KEY}
    files = {"image_file": ("image.png", image_buffer, "image/png")}
    data = {"prompt": prompt_final}

    try:
        response = requests.post(
            CLIPDROP_URL,
            headers=headers,
            files=files,
            data=data,
            timeout=CLIPDROP_TIMEOUT_SECONDS,
        )
    except RequestException as exc:
        log.error(
            "ClipDrop REQUEST_EXCEPTION url=%s type=%s message=%s",
            CLIPDROP_URL, type(exc).__name__, exc,
        )
        raise

    log.info("ClipDrop response status=%d", response.status_code)
    log.info("ClipDrop response headers=%s", dict(response.headers))
    log.info("ClipDrop response body (first 500)=%s", response.text[:500])

    # Registrar siempre los headers de rate-limit si existen.
    _log_rate_limit_headers(response, prefix="ClipDrop ")

    if response.status_code == 429:
        log.error(
            "EXTERNAL_PROVIDER_RETURNED_429 provider=ClipDrop url=%s "
            "headers=%s body=%s",
            CLIPDROP_URL, dict(response.headers), response.text[:500],
        )
        raise RuntimeError(
            f"ClipDrop devolvió 429 Too Many Requests: {response.text[:300]}"
        )

    if response.status_code != 200:
        log.error(
            "ClipDrop API error status=%d url=%s headers=%s body=%s",
            response.status_code, CLIPDROP_URL,
            dict(response.headers), response.text[:500],
        )
        raise RuntimeError(
            f"Error de Clipdrop API ({response.status_code}): {response.text}"
        )

    log.info("ClipDrop API success. response_bytes=%d", len(response.content))

    # 6. Codificar el resultado.
    edited_b64 = base64.b64encode(response.content).decode("utf-8")

    # 7. Codificar el original (JPEG para mayor eficiencia de tamaño).
    original_buffer = io.BytesIO()
    original_img.convert("RGB").save(original_buffer, format="JPEG")
    init_b64 = base64.b64encode(original_buffer.getvalue()).decode("utf-8")

    return {
        "edited_image_base64": edited_b64,
        "original_image_base64": init_b64,
    }
