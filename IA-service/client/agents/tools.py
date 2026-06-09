import sys
import os
import asyncio
from mirascope import llm
from mcp import StdioServerParameters

# ── Path constants ────────────────────────────────────────────────────────────
_AGENTS_DIR = os.path.dirname(os.path.abspath(__file__))
_CLIENT_DIR = os.path.dirname(_AGENTS_DIR)


def safe_print(text: str):
    """Print safely on Windows avoiding charmap errors with emoji/special chars."""
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8'))


# ── Mirascope Stub Tools ──────────────────────────────────────────────────────
# These are stub definitions so Mirascope registers the tool names.
# The actual execution happens in the MCP server (server.py).

@llm.tool
def get_all_perfumes() -> str:
    """Obtiene el catálogo completo de perfumes disponibles en Eluxar."""
    pass

@llm.tool
def get_perfume_by_id(id: int) -> str:
    """Obtiene los detalles completos de un perfume específico por su ID.
    
    Args:
        id: El identificador numérico del perfume (e.g. 1, 2, 3).
    """
    pass

@llm.tool
def search_perfumes_by_family(family: str) -> str:
    """Busca perfumes por familia olfativa (e.g. 'Floral', 'Amaderada', 'Oriental', 'Cítrica').
    
    Args:
        family: El nombre de la familia olfativa a buscar.
    """
    pass

@llm.tool
def get_perfumes_for_test() -> str:
    """Obtiene el catálogo completo de perfumes para el test olfativo."""
    pass


# ── Shared Utilities ──────────────────────────────────────────────────────────

def get_server_params() -> StdioServerParameters:
    """Resolves MCP server path dynamically. Works on Windows (local venv) and Linux (Render)."""
    server_path = os.environ.get(
        "MCP_SERVER_PATH",
        os.path.abspath(os.path.join(_CLIENT_DIR, "../server/server.py"))
    )
    # On Windows dev: use the local venv python. On Linux/Render: use system python.
    windows_venv = os.path.abspath(os.path.join(_CLIENT_DIR, "../server/venv/Scripts/python.exe"))
    if os.path.exists(windows_venv):
        python_cmd = windows_venv
    else:
        python_cmd = os.environ.get("MCP_PYTHON_PATH", "python")

    # Propagate BACKEND_BASE so server.py calls the right backend regardless of environment
    env = {**os.environ, "BACKEND_BASE": os.environ.get("BACKEND_BASE", "http://localhost:8080/api")}

    return StdioServerParameters(command=python_cmd, args=[server_path], env=env)


def extract_exception(exc) -> Exception:
    """Unwrap ExceptionGroup (Python 3.11+) to get the root cause."""
    if isinstance(exc, BaseExceptionGroup):
        # Recursively extract the first real sub-exception
        return extract_exception(exc.exceptions[0])
    return exc


async def run_with_retry(fn, *args, retries: int = 3, delay: float = 5.0, **kwargs):
    """Run an async callable with automatic retry on 503/ServerError or 429/Quota limits."""
    last_exc = None
    for attempt in range(1, retries + 1):
        try:
            return await fn(*args, **kwargs)
        except Exception as e:
            root = extract_exception(e)
            err_str = str(root)
            last_exc = e
            
            is_recoverable = (
                "503" in err_str or "UNAVAILABLE" in err_str or "high demand" in err_str or
                "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower()
            )
            
            if is_recoverable and attempt < retries:
                # Si el LLM nos pide esperar (ej. 429 quota), extraemos el tiempo
                wait_time = delay
                if "Please retry in" in err_str:
                    try:
                        import re
                        match = re.search(r"Please retry in ([\d\.]+)s", err_str)
                        if match:
                            wait_time = float(match.group(1))
                    except:
                        pass
                
                if wait_time > 10.0:
                    safe_print(f"[Tools] Quota retry delay {wait_time}s is too long. Aborting retries.")
                    raise last_exc

                safe_print(f"[Tools] Retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
                continue
            
            raise last_exc
