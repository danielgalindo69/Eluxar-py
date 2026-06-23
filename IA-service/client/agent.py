import os
from dotenv import load_dotenv

# 1. Cargar el archivo .env que se encuentra en esta misma carpeta (solo desarrollo;
# en producción como Render, las variables se inyectan directamente).
_current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_current_dir, ".env"), override=True)

# ── Exportaciones (Re-exports) ────────────────────────────────────────────────────────────────
# 2. Importar las funciones desde sus respectivos módulos para centralizarlas.
from agents.chat_agent import process_chat                          # noqa: E402
from agents.fragrance.orchestrator import process_fragrance_test   # noqa: E402
from agents.image_agent import process_image_edit                  # noqa: E402

__all__ = ["process_chat", "process_fragrance_test", "process_image_edit"]
