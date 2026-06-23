"""
test_agent.py — Compatibility shim.

The fragrance test logic has been split into focused modules under
``agents/fragrance/``:

  prompts.py               — LLM @llm.call definitions
  mock_data.py             — Fallback questions & recommendation text
  recommendation_service.py — MCP + LLM recommendation call
  orchestrator.py          — Public entry point: process_fragrance_test()

This file re-exports ``process_fragrance_test`` so that any import path
that previously pointed here continues to work without changes.
"""

from agents.fragrance.orchestrator import process_fragrance_test  # noqa: F401

__all__ = ["process_fragrance_test"]
