import os

# ── Selección de modelo ───────────────────────────────────────────────────────────
AI_MODEL: str = os.environ.get("AI_MODEL", "groq/llama-3.3-70b-versatile")

# ── Validación de secretos requerida ───────────────────────────────────────────────
GROQ_API_KEY: str | None = os.environ.get("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not set. "
        "Establécelo como una variable de entorno antes de iniciar el servicio."
    )

CLIPDROP_API_KEY: str | None = os.environ.get("CLIPDROP_API_KEY")

if not CLIPDROP_API_KEY:
    raise RuntimeError(
        "CLIPDROP_API_KEY is not set. "
        "Establécelo como una variable de entorno antes de iniciar el servicio."
    )
