import logging
import sys
import os

_LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()

# Handler único global: flujo a stdout (Render captura stdout).
_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(
    logging.Formatter(
        fmt="%(asctime)s [%(levelname)-8s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
)

# Configuración del logger raíz — hágalo una sola vez.
_root = logging.getLogger("ia_service")
if not _root.handlers:
    _root.addHandler(_handler)
_root.setLevel(getattr(logging, _LOG_LEVEL, logging.INFO))


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"ia_service.{name}")
