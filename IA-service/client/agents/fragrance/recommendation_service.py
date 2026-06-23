import json
from mcp import ClientSession
from mcp.client.stdio import stdio_client

from utils.logger import get_logger
from utils.mcp_client import get_server_params
from utils.retry import run_with_retry
from agents.fragrance.prompts import fragrance_test_agent

log = get_logger(__name__)


async def _do_fragrance_recommendation(answers_summary: str) -> str:
    """
    Intento único: abre la sesión MCP, llama al agente LLM y maneja el bucle de
    herramientas hasta retornar el texto de la recomendación final.
    """
    # 1. Obtener parámetros de conexión con el servidor.
    server_params = get_server_params()

    # 2. Iniciar comunicación estándar (stdio) con el proceso hijo de MCP.
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # 3. Inicializar sesión.
            await session.initialize()
            agent_history: list = []

            while True:
                # 4. Llamar al LLM pasándole el historial de acciones y las respuestas del test.
                response = fragrance_test_agent(answers_summary, agent_history)

                # 5. Comprobar si el LLM solicitó usar alguna herramienta (ej. consultar el catálogo).
                if response.tool_calls:
                    for tool_call in response.tool_calls:
                        args_dict = (
                            tool_call.args
                            if isinstance(tool_call.args, dict)
                            else json.loads(tool_call.args)
                        )
                        log.info("MCP tool call: %s args=%s", tool_call.name, args_dict)

                        # 6. Ejecutar la herramienta en el servidor MCP y esperar respuesta.
                        mcp_res = await session.call_tool(tool_call.name, arguments=args_dict)

                        if mcp_res.isError:
                            result_data = f"Error MCP: {mcp_res.content}"
                            log.warning("La herramienta MCP %s devolvió un error: %s", tool_call.name, mcp_res.content)
                        else:
                            # 7. Extraer los datos exitosos devueltos por la herramienta.
                            extracted = " ".join(
                                [c.text for c in mcp_res.content if hasattr(c, "text")]
                            )
                            try:
                                result_data = json.loads(extracted)
                            except json.JSONDecodeError as parse_err:
                                log.warning(
                                    "No se pudo analizar el resultado MCP como JSON: %s. Usando el texto plano.",
                                    parse_err,
                                )
                                result_data = extracted

                        # 8. Guardar la acción en el historial para que el LLM sepa qué hizo.
                        agent_history.append(
                            {"role": "model", "parts": [{"text": f"Llamando a {tool_call.name}"}]}
                        )
                        # 9. Guardar la respuesta recibida para que el LLM pueda analizarla.
                        agent_history.append(
                            {
                                "role": "user",
                                "parts": [
                                    {
                                        "text": (
                                            f"System/ToolResult: {result_data}. "
                                            "Con los datos del catálogo obtenidos, "
                                            "analiza las respuestas del test y recomienda el perfume ideal."
                                        )
                                    }
                                ],
                            }
                        )
                    # 10. Continuar el bucle para que el LLM genere la respuesta basándose en los nuevos datos.
                    continue
                else:
                    # 11. Si no hay llamadas a herramientas, retornar el texto final de la recomendación.
                    return response.text()


async def get_recommendation(answers_summary: str) -> str:
    """
    Punto de entrada público — reintenta hasta 3 veces en caso de errores recuperables del LLM.

    Args:
        answers_summary: Cadena formateada con las respuestas del usuario al test.

    Returns:
        Texto de recomendación generado por el LLM.
    """
    return await run_with_retry(
        _do_fragrance_recommendation, answers_summary, retries=3, delay=6.0
    )
