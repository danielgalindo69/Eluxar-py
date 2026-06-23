"""
IA provider configuration.

Centralises the selection of the LLM provider and model so that:
  - Changing the model in production is a single env-var change.
  - agent files do not contain any hardcoded model strings.

Environment variables
---------------------
AI_MODEL      Full Mirascope model string, e.g. ``groq/llama-3.3-70b-versatile``
              Default: ``groq/llama-3.3-70b-versatile``

GROQ_API_KEY  API key for Groq (required when using any groq/* model).
"""

import os

# ── Model selection ───────────────────────────────────────────────────────────
AI_MODEL: str = os.environ.get("AI_MODEL", "groq/llama-3.3-70b-versatile")

# ── Required secrets validation ───────────────────────────────────────────────
GROQ_API_KEY: str | None = os.environ.get("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not set. "
        "Set it as an environment variable before starting the service."
    )

CLIPDROP_API_KEY: str | None = os.environ.get("CLIPDROP_API_KEY")

if not CLIPDROP_API_KEY:
    raise RuntimeError(
        "CLIPDROP_API_KEY is not set. "
        "Set it as an environment variable before starting the service."
    )
