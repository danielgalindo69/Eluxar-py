"""
agent.py — Unified barrel file.

Re-exports all public agent entry points so that api.py has a single,
consistent import source regardless of which agent module each function
lives in.

Public API:
    process_chat           — Chat advisor (chat_agent.py)
    process_fragrance_test — Fragrance test (agents/fragrance/orchestrator.py)
    process_image_edit     — Image editing  (agents/image_agent.py)
"""

import os
from dotenv import load_dotenv

# Load the .env file that lives next to this file (dev only;
# in production Render injects env vars directly).
_current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_current_dir, ".env"), override=True)

# ── Re-exports ────────────────────────────────────────────────────────────────
from agents.chat_agent import process_chat                          # noqa: E402
from agents.fragrance.orchestrator import process_fragrance_test   # noqa: E402
from agents.image_agent import process_image_edit                  # noqa: E402

__all__ = ["process_chat", "process_fragrance_test", "process_image_edit"]
