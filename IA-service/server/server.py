import os
import json
import requests
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv()
BACKEND_BASE = os.environ.get("BACKEND_BASE", "http://localhost:8080/api")

# ── Inicialización del Servidor MCP ───────────────────────────────────────────
# MCP (Model Context Protocol) permite que el LLM ejecute estas funciones
# de forma segura en un proceso aislado.
mcp = FastMCP("EluxarPerfumeServer")

# (Se han eliminado los "Datos Quemados" / MOCK_PERFUMES para depender exclusivamente del Backend real)

@mcp.tool()
def get_all_perfumes() -> str:
    """Obtiene el catálogo completo de perfumes desde el Backend."""
    try:
        # 1. Hacer petición HTTP GET al backend Java.
        resp = requests.get(f"{BACKEND_BASE}/productos", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        # 2. Extraer la lista de la respuesta JSON (puede venir en 'data' o directo).
        perfumes = data.get("data", []) if isinstance(data, dict) else data

        # 3. Retornar los perfumes en formato JSON (si está vacío, retornará una lista vacía `[]`).
        return json.dumps(perfumes, ensure_ascii=False)
    except Exception as exc:
        print(f"[MCP] Error al conectar con backend en get_all_perfumes: {exc}")
        # Si falla el backend, retornamos un arreglo vacío para no romper el LLM.
        return json.dumps([], ensure_ascii=False)


@mcp.tool()
def get_perfume_by_id(id: str) -> str:
    """Obtiene los detalles de un perfume por su ID desde el Backend."""
    try:
        # 1. Consultamos la API del backend para buscar el producto por ID.
        resp = requests.get(f"{BACKEND_BASE}/productos/{id}", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        # 2. Retornar el detalle del producto.
        return json.dumps(data.get("data", data), ensure_ascii=False)
    except Exception as exc:
        print(f"[MCP] Error en get_perfume_by_id({id}): {exc}")
        # Retornamos un mensaje de error controlado para que el LLM sepa qué ocurrió.
        return json.dumps({"error": f"No se encontró el perfume con ID {id}"})


@mcp.tool()
def search_perfumes_by_family(family: str) -> str:
    """Busca perfumes por familia olfativa mediante el Backend."""
    try:
        # 1. Realizar una búsqueda en el backend pasando la familia olfativa como parámetro 'q'.
        resp = requests.get(f"{BACKEND_BASE}/productos/buscar", params={"q": family}, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        # 2. Retornar la lista de resultados.
        return json.dumps(data.get("data", []), ensure_ascii=False)
    except Exception as exc:
        print(f"[MCP] Error en search_perfumes_by_family({family!r}): {exc}")
        return json.dumps([])


@mcp.tool()
def get_perfumes_for_test() -> str:
    """Obtiene el catálogo completo de perfumes para la fase de test olfativo."""
    try:
        # 1. Hacer petición HTTP GET al backend Java.
        resp = requests.get(f"{BACKEND_BASE}/productos", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        # 2. Extraer la lista de la respuesta JSON.
        perfumes = data.get("data", []) if isinstance(data, dict) else data

        return json.dumps(perfumes, ensure_ascii=False)
    except Exception as exc:
        print(f"[MCP] Error backend para test olfativo ({exc}).")
        return json.dumps([], ensure_ascii=False)


if __name__ == "__main__":
    mcp.run(transport="stdio")
