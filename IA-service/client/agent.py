import json
import asyncio
import os
import sys
from dotenv import load_dotenv

from mirascope import llm
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(current_dir, ".env"), override=True)
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")

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

# ── Chat Agent ────────────────────────────────────────────────────────────────

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

def _get_server_params() -> StdioServerParameters:
    """Resolves MCP server path dynamically. Works on Windows (local venv) and Linux (Render)."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    server_path = os.environ.get(
        "MCP_SERVER_PATH",
        os.path.abspath(os.path.join(current_dir, "../server/server.py"))
    )
    # On Windows dev: use the local venv python. On Linux/Render: use system python.
    windows_venv = os.path.abspath(os.path.join(current_dir, "../server/venv/Scripts/python.exe"))
    if os.path.exists(windows_venv):
        python_cmd = windows_venv
    else:
        python_cmd = os.environ.get("MCP_PYTHON_PATH", "python")
    return StdioServerParameters(command=python_cmd, args=[server_path])

async def process_chat(query: str, history: list) -> tuple[str, list]:
    current_query = query + " \n\n (Analiza si necesitas consultar el catálogo. SIEMPRE usa las herramientas para obtener datos reales del catálogo Eluxar antes de responder.)"

    server_params = _get_server_params()
    
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


# ── Fragrance Test ────────────────────────────────────────────────────────────

FRAGRANCE_TEST_QUESTIONS = [
    {
        "id": 1,
        "question": "¿Para quién buscas la fragancia?",
        "options": [
            "👨 Hombre",
            "👩 Mujer",
            "⚡ Unisex / Sin preferencia"
        ]
    },
    {
        "id": 2,
        "question": "¿En qué ocasión la usarías principalmente?",
        "options": [
            "🏢 Oficina / Día a día",
            "🌙 Salidas nocturnas",
            "🎩 Eventos formales o especiales",
            "🏋️ Deporte / Aire libre",
            "💕 Citas románticas"
        ]
    },
    {
        "id": 3,
        "question": "¿Qué familia olfativa te atrae más?",
        "options": [
            "🌸 Floral — rosas, jazmín, lirio",
            "🪵 Amaderada — cedro, sándalo, vetiver",
            "🍊 Cítrica — limón, bergamota, naranja",
            "🕌 Oriental — ámbar, vainilla, incienso",
            "🍰 Dulce — praliné, chocolate, caramelo"
        ]
    },
    {
        "id": 4,
        "question": "¿Qué intensidad prefieres en una fragancia?",
        "options": [
            "💨 Ligera y sutil",
            "🌿 Moderada — se siente cerca",
            "🔥 Intensa — proyecta con fuerza",
            "💎 Muy intensa — deja estela"
        ]
    },
    {
        "id": 5,
        "question": "¿En qué clima la usarás con más frecuencia?",
        "options": [
            "☀️ Clima cálido / Verano",
            "❄️ Clima frío / Invierno",
            "🍂 Templado / Entretiempo",
            "🌍 Todas las estaciones"
        ]
    },
    {
        "id": 6,
        "question": "¿Qué personalidad describe mejor lo que buscas?",
        "options": [
            "🎭 Elegante y sofisticado",
            "🌊 Fresco y juvenil",
            "🖤 Misterioso y atrevido",
            "👔 Clásico y refinado",
            "✨ Llamativo y seductor"
        ]
    },
    {
        "id": 7,
        "question": "¿Cuál es tu presupuesto aproximado?",
        "options": [
            "💰 Menos de $60.000 COP",
            "💵 Entre $60.000 y $100.000 COP",
            "💎 Entre $100.000 y $150.000 COP",
            "👑 Entre $150.000 y $200.000 COP",
            "🏆 Más de $200.000 COP"
        ]
    }
]

@llm.call(
    "google/gemini-2.5-flash",
    tools=[get_perfumes_for_test]
)
def fragrance_test_agent(answers_summary: str, history: list):
    return f"""
    SYSTEM: Eres ELUXAR, un experto en perfumería de lujo. Tu tarea es analizar las respuestas 
    de un test olfativo y recomendar EL MEJOR perfume del catálogo para el usuario.
    
    INSTRUCCIONES:
    1. PRIMERO: Usa la herramienta get_perfumes_for_test() para obtener el catálogo actual.
    2. SEGUNDO: Analiza las respuestas del usuario contra cada perfume del catálogo.
    3. TERCERO: Recomienda EL MEJOR perfume (solo 1) con una explicación detallada.
    
    FORMATO DE RESPUESTA:
    - Usa emojis para dar vida (✨, 🎯, 💎, 🧴, 🌟)
    - Incluye nombre, marca, tipo (EDT/EDP), precio y familia olfativa
    - Explica POR QUÉ este perfume es el ideal basándote en CADA respuesta del test
    - Usa negritas (**) para resaltar información clave
    - Usa separadores visuales: "────────────────────────"
    - Sé cálido, entusiasta y experto
    - Responde en español
    - No uses emojis en ninguna de tus respuestas.
    
    EJEMPLO DE ESTRUCTURA:
    🎯 **TU FRAGANCIA IDEAL**
    ────────────────────────
    
    ✨ **[NOMBRE]** — [MARCA]
    ◈ Tipo: [EDT/EDP]
    ◈ Familia: [FAMILIA OLFATIVA]
    ◈ Precio: **$[PRECIO] COP**
    
    ────────────────────────
    
    🌟 **¿Por qué es perfecta para ti?**
    [Explicación detallada punto por punto basada en cada respuesta]
    
    💡 **Tip de uso:** [Consejo práctico]
    
    RESPUESTAS DEL TEST OLFATIVO:
    {answers_summary}
    
    MESSAGES: {history}
    USER: Basándote en mis respuestas del test olfativo, recomiéndame el perfume perfecto del catálogo Eluxar.
    """


async def process_fragrance_test(message: str, history: list, step: int) -> dict:
    """
    Processes one step of the fragrance test.
    - Steps 0 to 6: Return the next static question with options.
    - Step 7 (final): Record last answer, call LLM agent with MCP for recommendation.
    """
    total_questions = len(FRAGRANCE_TEST_QUESTIONS)

    # Step 0: Start the test — return first question
    if step == 0:
        q = FRAGRANCE_TEST_QUESTIONS[0]
        return {
            "response": q["question"],
            "question": q["question"],
            "options": q["options"],
            "history": [],
            "step": 1,
            "finished": False,
            "totalSteps": total_questions
        }

    # Steps 1 to (total-1): Record previous answer, return next question
    if step < total_questions:
        # Record the answer from the previous question
        history.append({
            "question": FRAGRANCE_TEST_QUESTIONS[step - 1]["question"],
            "answer": message
        })

        q = FRAGRANCE_TEST_QUESTIONS[step]
        return {
            "response": q["question"],
            "question": q["question"],
            "options": q["options"],
            "history": history,
            "step": step + 1,
            "finished": False,
            "totalSteps": total_questions
        }

    # Final step: Record last answer, call LLM agent with MCP for recommendation
    if step == total_questions:
        history.append({
            "question": FRAGRANCE_TEST_QUESTIONS[step - 1]["question"],
            "answer": message
        })

        # Build a readable summary of all answers
        answers_summary = "\n".join([
            f"- {item['question']}: {item['answer']}"
            for item in history
        ])

        safe_print(f"\n[FragranceTest] Generando recomendación con {len(history)} respuestas...")
        safe_print(f"[FragranceTest] Resumen:\n{answers_summary}\n")

        # Call the LLM agent with MCP
        server_params = _get_server_params()

        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()

                current_query = answers_summary
                agent_history = []

                while True:
                    response = fragrance_test_agent(current_query, agent_history)

                    if response.tool_calls:
                        for tool_call in response.tool_calls:
                            args_dict = tool_call.args if isinstance(tool_call.args, dict) else json.loads(tool_call.args)
                            safe_print(f"[FragranceTest] Ejecutando MCP: {tool_call.name} con {args_dict}")

                            mcp_res = await session.call_tool(tool_call.name, arguments=args_dict)

                            if mcp_res.isError:
                                result_data = f"MCP Error: {mcp_res.content}"
                            else:
                                extracted = " ".join([c.text for c in mcp_res.content if hasattr(c, 'text')])
                                try:
                                    result_data = json.loads(extracted)
                                except:
                                    result_data = extracted

                            agent_history.append({"role": "model", "parts": [{"text": f"Llamando a {tool_call.name}"}]})
                            agent_history.append({"role": "user", "parts": [{"text": f"System/ToolResult: {result_data}. Continúa con la recomendación."}]})

                        current_query = "Con los datos del catálogo obtenidos, analiza las respuestas del test y recomienda el perfume ideal."
                        continue
                    else:
                        final_content = response.text()
                        return {
                            "response": final_content,
                            "history": history,
                            "step": step + 1,
                            "finished": True,
                            "totalSteps": total_questions
                        }

    # Fallback for invalid step
    return {
        "response": "Test completado.",
        "history": history,
        "step": step,
        "finished": True,
        "totalSteps": total_questions
    }
