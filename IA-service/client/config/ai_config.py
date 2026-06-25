import os

# ── Selección de modelo ───────────────────────────────────────────────────────────
CHAT_MODEL: str = os.environ.get("CHAT_MODEL", "groq-chat/llama-3.3-70b-versatile")
TEST_MODEL: str = os.environ.get("TEST_MODEL", "groq-test/llama-3.3-70b-versatile")

# ── Validación de secretos requerida ───────────────────────────────────────────────
GROQ_API_KEY_CHAT: str | None = os.environ.get("GROQ_API_KEY_CHAT")
GROQ_API_KEY_TEST: str | None = os.environ.get("GROQ_API_KEY_TEST")

if not GROQ_API_KEY_CHAT or not GROQ_API_KEY_TEST:
    raise RuntimeError(
        "GROQ_API_KEY_CHAT o GROQ_API_KEY_TEST no están configurados. "
        "Establécelos como variables de entorno antes de iniciar el servicio."
    )

CLIPDROP_API_KEY: str | None = os.environ.get("CLIPDROP_API_KEY")

if not CLIPDROP_API_KEY:
    raise RuntimeError(
        "CLIPDROP_API_KEY is not set. "
        "Establécelo como una variable de entorno antes de iniciar el servicio."
    )
