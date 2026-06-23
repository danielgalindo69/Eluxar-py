import json
from mirascope import llm
from mcp import ClientSession
from mcp.client.stdio import stdio_client

from config.ai_config import AI_MODEL
from agents.tools import get_all_perfumes, get_perfume_by_id, search_perfumes_by_family
from utils.logger import get_logger
from utils.mcp_client import get_server_params
from utils.retry import run_with_retry

log = get_logger(__name__)


@llm.call(AI_MODEL, tools=[get_all_perfumes, get_perfume_by_id, search_perfumes_by_family])
def perfume_advisor(query: str, history: list):
    """Llamada principal al LLM para el asesor de chat."""
    return f"""
    SYSTEM: Eres ELUXAR, un asesor experto en perfumería de lujo. Tu misión es brindar una experiencia 
    de asesoría premium y visualmente atractiva.
    
    INSTRUCCIONES DE FORMATO:
    1. NO uses emojis en ninguna parte de tu respuesta.
    2. Usa una estructura de bloques limpia con espacios (doble salto de línea entre secciones).
    3. Cuando recomiendes perfumes, usa este formato:
       **[NOMBRE DEL PERFUME]** — [MARCA]
       Familia: [FAMILIA]
       Aroma: [BREVE DESCRIPCIÓN]
       Precio: **$[PRECIO] COP**
    4. Usa separadores visuales como "────────────────────────" si vas a separar secciones.
    5. Usa negritas (**) para resaltar nombres de productos y precios.
    
    CONTEXTO:
    Tienes acceso al catálogo de Eluxar vía herramientas integradas.
    
    REGLAS DE ORO:
    - Nunca uses emojis.
    - Sé cálido y sofisticado.
    - Responde en el mismo idioma del cliente.
    
    MESSAGES: {history}
    USER: {query}
    """


async def _do_chat(query: str, history: list) -> tuple[str, list]:
    """Implementación interna — intento único."""
    current_query = query
    server_params = get_server_params()

    # 1. Crear conexión con el servidor MCP.
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:

            # 2. Inicializar la sesión MCP.
            await session.initialize()

            while True:
                # 3. Ejecutar la consulta en el LLM.
                response = perfume_advisor(current_query, history)

                if response.tool_calls:
                    # 4. Manejar las llamadas a herramientas MCP.
                    for tool_call in response.tool_calls:
                        args_dict = (
                            tool_call.args
                            if isinstance(tool_call.args, dict)
                            else json.loads(tool_call.args)
                        )
                        log.info("MCP tool call: %s args=%s", tool_call.name, args_dict)

                        mcp_res = await session.call_tool(tool_call.name, arguments=args_dict)

                        if mcp_res.isError:
                            # Si hay un error MCP, registrarlo y continuar.
                            result_data = f"MCP Error: {mcp_res.content}"
                            log.warning("MCP tool %s returned error.", tool_call.name)
                        else:
                            # Si la herramienta se ejecutó correctamente, extraer el resultado.
                            extracted = " ".join(
                                [c.text for c in mcp_res.content if hasattr(c, "text")]
                            )
                            try:
                                result_data = json.loads(extracted)
                            except json.JSONDecodeError as parse_err:
                                log.warning(
                                    "No se pudo analizar el resultado de MCP como JSON: %s. Usando texto plano.",
                                    parse_err,
                                )
                                result_data = extracted

                        history.append(
                            {
                                "role": "model",
                                "parts": [{"text": f"Llamando a {tool_call.name} con {tool_call.args}"}],
                            }
                        )
                        history.append(
                            {
                                "role": "user",
                                "parts": [
                                    {
                                        "text": (
                                            f"System/ToolResult: Resultado de la herramienta MCP "
                                            f"{tool_call.name}: {result_data}. Continúa."
                                        )
                                    }
                                ],
                            }
                        )

                    current_query = (
                        "Con los datos reales del catálogo Eluxar obtenidos, responde al cliente de forma "
                        "experta, mencionando nombres, precios y características de los productos recomendados."
                    )
                    continue
                else:
                    final_content = response.text()
                    history.append({"role": "user", "parts": [{"text": query}]})
                    history.append({"role": "model", "parts": [{"text": final_content}]})
                    return final_content, history


async def process_chat(query: str, history: list) -> tuple[str, list]:
    """Función principal para procesar consultas de chat, reintentando hasta 3 veces en caso de errores recuperables del LLM."""
    return await run_with_retry(_do_chat, query, history, retries=3, delay=5.0)
