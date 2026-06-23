"""
Structured logging utility.

Provides a factory function `get_logger` that returns a standard Python
Logger pre-configured with a consistent format and UTF-8 output.

Usage:
    from utils.logger import get_logger
    log = get_logger(__name__)
    log.info("Hello %s", name)
"""

import logging
import sys
import os

_LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()

# Single global handler: stream to stdout (Render captures stdout).
_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(
    logging.Formatter(
        fmt="%(asctime)s [%(levelname)-8s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
)

# Root logger configuration — do this once.
_root = logging.getLogger("ia_service")
if not _root.handlers:
    _root.addHandler(_handler)
_root.setLevel(getattr(logging, _LOG_LEVEL, logging.INFO))


def get_logger(name: str) -> logging.Logger:
    """
    Return a child logger of 'ia_service' with the given name.

    Args:
        name: Typically `__name__` of the calling module.

    Returns:
        A configured Logger instance.
    """
    return logging.getLogger(f"ia_service.{name}")
