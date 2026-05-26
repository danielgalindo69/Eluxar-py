import json
import os
from dotenv import load_dotenv

from mirascope import llm
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from .tools import get_all_perfumes, get_perfume_by_id, search_perfumes_by_family

load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")

@llm.call(
    "google/gemini-2.5-flash",
    tools=[get_all_perfumes, get_perfume_by_id, search_perfumes_by_family]
)
def perfume_advisor(query: str, history: list):
    return f"""
    SYSTEM: Eres ELUXAR, un asesor experto en perfumería de lujo. Tu misión es brindar una experiencia 
    de asesoría premium y visualmente atractiva.
    
    INSTRUCCIONES DE FORMATO (PARA UNA MEJOR ESTÉTICA):
    1. Usa EMOJIS para dar vida a la conversación (✨, 🌿, 💎, 🧴, 🍊, 🪵).
    2. Usa una estructura de bloques limpia con espacios (doble salto de línea).
    3. Cuando recomiendes perfumes, usa este formato:
       ✨ **[NOMBRE DEL PERFUME]** — [MARCA]
       ◈ Familia: [FAMILIA]
       ◈ Aroma: [BREVE DESCRIPCIÓN]
       ◈ Precio: **$[PRECIO] COP**
    4. Usa separadores visuales como "────────────────────────" si vas a separar secciones.
    5. Usa negritas (**) para resaltar nombres de productos y precios.
    
    CONTEXTO:
    Tienes acceso al catálogo de Eluxar (datos de prueba) vía MCP:
    - `get_all_perfumes`, `get_perfume_by_id`, `search_perfumes_by_family`.
    
    REGLAS DE ORO:
    - Sé cálido y sofisticado.
    - Responde en el mismo idioma del cliente.
    - SIEMPRE consulta el catálogo antes de recomendar.
    
    MESSAGES: {history}
    USER: {query}
    """

async def process_chat(query: str, history: list) -> tuple[str, list]:
    current_query = query + " \n\n (Analiza si necesitas consultar el catálogo. SIEMPRE usa las herramientas para obtener datos reales del catálogo Eluxar antes de responder.)"
    
    server_params = StdioServerParameters(
        command="../server/venv/Scripts/python.exe", 
        args=["../server/server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            while True:
                response = perfume_advisor(current_query, history)
                
                if response.tool_calls:
                    for tool_call in response.tool_calls:
                        args_dict = tool_call.args if isinstance(tool_call.args, dict) else json.loads(tool_call.args)
                        
                        print(f"[Client] Ejecutando herramienta MCP: {tool_call.name} con {args_dict}")
                        
                        # Ejecutamos la herramienta en el servidor MCP
                        mcp_res = await session.call_tool(tool_call.name, arguments=args_dict)
                        
                        # Obtenemos el resultado
                        if mcp_res.isError:
                            result_data = f"MCP Error: {mcp_res.content}"
                        else:
                            extracted = " ".join([c.text for c in mcp_res.content if hasattr(c, 'text')])
                            try:
                                result_data = json.loads(extracted)
                            except:
                                result_data = extracted
                        
                        history.append({"role": "model", "parts": [{"text": f"Llamando a {tool_call.name} con {tool_call.args}"}]})
                        history.append({"role": "user", "parts": [{"text": f"System/ToolResult: Resultado de la herramienta MCP {tool_call.name}: {result_data}. Continúa."}]})
                        
                    current_query = "Con los datos reales del catálogo Eluxar obtenidos, responde al cliente de forma experta, mencionando nombres, precios y características de los productos recomendados."
                    continue
                    
                else:
                    final_content = response.text()
                    history.append({"role": "user", "parts": [{"text": query}]})
                    history.append({"role": "model", "parts": [{"text": final_content}]})
                    return final_content, history
