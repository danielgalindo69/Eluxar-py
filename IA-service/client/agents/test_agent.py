import json
from mirascope import llm
from mcp import ClientSession
from mcp.client.stdio import stdio_client

from .tools import (
    get_perfumes_for_test, safe_print, get_server_params, run_with_retry
)

# ── Fragrance Test ────────────────────────────────────────────────────────────

@llm.call("groq/llama-3.3-70b-versatile")
def fragrance_question_generator(history_summary: str, current_step: int, total_steps: int):
    return f"""
    SYSTEM: Eres ELUXAR, un experto en perfumería de lujo. Estás guiando a un usuario a través de un test 
    olfativo de {total_steps} preguntas para descubrir su fragancia ideal.
    
    Tu tarea es generar la pregunta número {current_step} del test.
    DEBES generar una pregunta de opción múltiple con EXACTAMENTE 4 opciones.
    
    El test debe cubrir progresivamente diferentes dimensiones para perfilar al usuario (por ejemplo: 
    para quién es la fragancia, ocasión de uso principal, familia olfativa que más le atrae, intensidad preferida, 
    clima en el que la usará, personalidad, y presupuesto aproximado).
    Analiza el historial previo para NO repetir temas y hacer una pregunta lógica a continuación.
    Si es la primera pregunta (step 1), puedes empezar por el género o la ocasión de uso.
    
    HISTORIAL DEL TEST HASTA AHORA:
    {history_summary if history_summary else "Ninguno, esta es la primera pregunta."}
    
    INSTRUCCIONES IMPORTANTES DE FORMATO:
    1. Responde ÚNICAMENTE con un JSON válido usando la estructura exacta mostrada abajo. NO agregues código markdown ni explicaciones adicionales.
    2. La propiedad "question" debe ser un string con la pregunta.
    3. La propiedad "options" debe ser una lista de strings con exactamente 4 opciones.
    4. Añade un emoji representativo al inicio de cada opción (ej: "👨 Hombre").
    
    EJEMPLO DE RESPUESTA ESPERADA:
    {{
        "question": "¿Para quién buscas la fragancia?",
        "options": [" Para mí (Hombre)", " Para mí (Mujer)", " Es un regalo (Hombre)", " Es un regalo (Mujer)"]
    }}
    """

@llm.call(
    "groq/llama-3.3-70b-versatile",
    tools=[get_perfumes_for_test]
)
def fragrance_test_agent(answers_summary: str, history: list):
    return f"""
    SYSTEM: Eres ELUXAR, un experto en perfumería de lujo. Tu tarea es analizar las respuestas 
    de un test olfativo y recomendar EL MEJOR perfume del catálogo para el usuario.
    
    INSTRUCCIONES CLAVE:
    1. Usa la herramienta get_perfumes_for_test() para obtener el catálogo actual de perfumes.
    2. Analiza las respuestas del usuario y encuentra el perfume que mejor encaje.
    3. Si encuentras un perfume, recomiéndalo (solo 1). Preséntalo al usuario de forma amigable, 
       cercana y sencilla, explicando por qué encaja con lo que respondió, SIN usar términos técnicos de perfumería.
    4. Si la herramienta retorna vacío o no hay ningún perfume que encaje, dile al usuario de forma muy 
       amable que por ahora no hay una coincidencia exacta en el catálogo, pero que pronto habrá opciones.
    
    FORMATO DE RESPUESTA:
    - Incluye nombre, marca, tipo (EDT/EDP), precio y familia olfativa
    - Explica POR QUÉ es ideal basándote en sus respuestas (lenguaje simple)
    - Usa negritas (**) para resaltar información clave
    - Usa separadores visuales: "────────────────────────"
    - Responde en español y NO uses emojis si no hay coincidencia.
    
    RESPUESTAS DEL TEST OLFATIVO:
    {answers_summary}
    
    MESSAGES: {history}
    USER: Basándote en mis respuestas del test olfativo, recomiéndame el perfume perfecto del catálogo Eluxar.
    """


async def _generate_question(history: list, step: int, total_steps: int) -> dict:
    """Generates the next question using the LLM and parses the JSON."""
    history_summary = "\n".join([
        f"Pregunta {i+1}: {item['question']}\nRespuesta: {item['answer']}"
        for i, item in enumerate(history)
    ])
    
    response = fragrance_question_generator(history_summary, step, total_steps)
    content = response.text()
    
    # Extract JSON if wrapped in markdown
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()
        
    try:
        data = json.loads(content)
        return {
            "question": data.get("question", "¿Continuamos con el test?"),
            "options": data.get("options", ["Opción 1", "Opción 2", "Opción 3", "Opción 4"])[:4]
        }
    except json.JSONDecodeError as e:
        safe_print(f"[FragranceTest] Error parseando JSON: {e}\nContent: {content}")
        return {
            "question": "¿Qué nota principal buscas en un perfume?",
            "options": [" Floral", " Amaderada", " Cítrica", " Dulce"]
        }


async def _do_fragrance_recommendation(answers_summary: str) -> str:
    """Inner implementation — single attempt at calling MCP + LLM for the final recommendation."""
    server_params = get_server_params()

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            agent_history = []

            while True:
                response = fragrance_test_agent(answers_summary, agent_history)

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
                        agent_history.append({"role": "user", "parts": [{"text": f"System/ToolResult: {result_data}. Con los datos del catálogo obtenidos, analiza las respuestas del test y recomienda el perfume ideal."}]})

                    continue
                else:
                    return response.text()


async def process_fragrance_test(message: str, history: list, step: int) -> dict:
    """
    Processes one step of the fragrance test using AI to generate questions dynamically.
    - Steps 0 to 6: Call LLM to generate the next question.
    - Step 7 (final): Call LLM agent with MCP for recommendation.
    """
    total_questions = 7

    # Note: The frontend now sends the UPDATED history array, which already includes 
    # the last answered {question, answer} pair. We don't need to manually append it.
    
    # Generate the next question (steps 0 to 6)
    if step < total_questions:
        try:
            q_data = await run_with_retry(_generate_question, history, step + 1, total_questions, retries=3, delay=5.0)
        except BaseException as e:
            safe_print(f"[FragranceTest] LLM Error (Quota exhausted?): {e}. Usando pregunta de respaldo.")
            mock_questions = [
                {"question": "¿Cuál de estos aromas te atrae más?", "options": ["Floral", "Amaderado", "Cítrico", "Dulce"]},
                {"question": "¿Para qué ocasión buscas el perfume?", "options": ["Día a día", "Eventos formales", "Citas románticas", "Deporte/Fresco"]},
                {"question": "¿Qué intensidad prefieres?", "options": ["Suave y discreto", "Moderado", "Fuerte y llamativo", "Muy intenso"]},
                {"question": "¿En qué clima lo usarías más?", "options": ["Calor / Verano", "Frío / Invierno", "Templado", "Ambientes cerrados"]},
                {"question": "¿Qué nota prefieres que destaque?", "options": ["Vainilla / Caramelo", "Rosas / Jazmín", "Limón / Bergamota", "Cedro / Sándalo"]},
                {"question": "¿Cómo describirías tu estilo?", "options": ["Elegante", "Deportivo", "Seductor", "Extrovertido"]},
                {"question": "¿Qué presupuesto aproximado tienes?", "options": ["Económico", "Medio", "Premium", "Lujo"]}
            ]
            q_data = mock_questions[min(step, len(mock_questions) - 1)]
            
        return {
            "response": q_data["question"],
            "question": q_data["question"],
            "options": q_data["options"],
            "history": history,
            "step": step + 1,
            "finished": False,
            "totalSteps": total_questions
        }

    # Final step: Recommendation
    if step == total_questions:
        answers_summary = "\n".join([
            f"- {item.get('question', 'Pregunta')}: {item.get('answer', '')}"
            for item in history
        ])

        safe_print(f"\n[FragranceTest] Generando recomendación con {len(history)} respuestas...")
        safe_print(f"[FragranceTest] Resumen:\n{answers_summary}\n")

        try:
            final_content = await run_with_retry(
                _do_fragrance_recommendation, answers_summary, retries=3, delay=6.0
            )
        except BaseException as e:
            safe_print(f"[FragranceTest] LLM Error en recomendación final: {e}. Usando respuesta por defecto.")
            final_content = """
            🎯 **TU FRAGANCIA IDEAL**
            ────────────────────────
            
            ✨ **Perfume Sorpresa** — Eluxar
            ◈ Tipo: EDP
            ◈ Familia: Especial
            ◈ Precio: **Consultar catálogo** COP
            
            ────────────────────────
            
            🌟 **¿Por qué es perfecta para ti?**
            Basándonos en tus respuestas, este perfume tiene exactamente lo que buscas. Hemos tenido un problema temporal de conexión con el Asistente de IA, pero te invitamos a explorar nuestro catálogo para encontrar tus notas favoritas.
            
            💡 **Tip de uso:** Aplica en los puntos de pulso para mayor duración.
            """

        return {
            "response": final_content,
            "history": history,
            "step": step + 1,
            "finished": True,
            "totalSteps": total_questions
        }

    return {
        "response": "Test completado.",
        "history": history,
        "step": step,
        "finished": True,
        "totalSteps": total_questions
    }
