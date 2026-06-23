import os
from mcp import StdioServerParameters

# centralizar la configuración de la conexión con el servidor MCP
_UTILS_DIR = os.path.dirname(os.path.abspath(__file__))
_CLIENT_DIR = os.path.dirname(_UTILS_DIR)


def get_server_params() -> StdioServerParameters:
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
