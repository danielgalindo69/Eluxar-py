"""
MCP server parameters resolver.

Determines the correct Python interpreter and server path for launching
the MCP subprocess, both on local Windows dev environments and on
Linux/Render production.

Extracted from agents/tools.py.
"""

import os
from mcp import StdioServerParameters

# Resolved once at import time so every agent shares the same paths.
_UTILS_DIR = os.path.dirname(os.path.abspath(__file__))
_CLIENT_DIR = os.path.dirname(_UTILS_DIR)


def get_server_params() -> StdioServerParameters:
    """
    Build and return the StdioServerParameters for the MCP server.

    Resolution order for python interpreter:
      1. ``MCP_PYTHON_PATH`` env var (explicit override).
      2. Local Windows venv at ``../server/venv/Scripts/python.exe``
         (developer machine).
      3. System ``python`` (Linux / Render production).

    Resolution order for server path:
      1. ``MCP_SERVER_PATH`` env var (explicit override).
      2. ``../server/server.py`` relative to the client directory.
    """
    server_path = os.environ.get(
        "MCP_SERVER_PATH",
        os.path.abspath(os.path.join(_CLIENT_DIR, "../server/server.py")),
    )

    windows_venv = os.path.abspath(
        os.path.join(_CLIENT_DIR, "../server/venv/Scripts/python.exe")
    )
    if os.path.exists(windows_venv):
        python_cmd = windows_venv
    else:
        python_cmd = os.environ.get("MCP_PYTHON_PATH", "python")

    env = {
        **os.environ,
        "BACKEND_BASE": os.environ.get("BACKEND_BASE", "http://localhost:8080/api"),
    }

    return StdioServerParameters(command=python_cmd, args=[server_path], env=env)
