"""
Definición de Prompts (Instrucciones) para el Agente LLM en el Test Olfativo.
"""
import json
from mirascope import llm
from config.ai_config import TEST_MODEL
from agents.tools import get_perfumes_for_test
from agents.fragrance.mock_data import TOTAL_QUESTIONS


@llm.call(TEST_MODEL, call_params={"temperature": 0.8})
def fragrance_question_generator(history_summary: str, current_step: int, total_steps: int, theme: str):
    """Genera la siguiente pregunta de opción múltiple para el test de fragancias."""
    return f"""
    SYSTEM: Eres ELUXAR, experto en perfumería. Estás guiando a un usuario en un test olfativo de {total_steps} preguntas.
    
    Tu tarea es generar la pregunta número {current_step}.
    TEMA OBLIGATORIO: {theme}
    INSTRUCCIONES: Genera una pregunta enfocada EXCLUSIVAMENTE en el tema anterior. Evita repetir el enfoque exacto de preguntas previas listadas en el historial.
    DEBES generar 4 opciones.

    HISTORIAL:
    {history_summary if history_summary else "Ninguno, esta es la primera pregunta."}
    
    FORMATO: Responde SOLO con JSON válido (sin markdown). Estructura: {{"question": str, "options": [4 strings]}}. Sin emojis.
    """


@llm.call(TEST_MODEL, tools=[get_perfumes_for_test])
def fragrance_test_agent(answers_summary: str, history: list):
    """Genera un resumen de las respuestas del test y recomienda el mejor perfume del catálogo."""
    return f"""
    SYSTEM: Eres ELUXAR. Analiza las respuestas del test y recomienda EL MEJOR perfume.
    
    INSTRUCCIONES CLAVE:
    1. IMPORTANTE: El ID del producto DEBE ir al inicio en este formato exacto: ###PRODUCT_ID:id### (usa el ID real del catálogo).
    2. Usa la herramienta get_perfumes_for_test().
    3. Analiza el catálogo provisto. IMPORTANTE: Usa el ID y el PRECIO literal que aparece en el catálogo. NUNCA inventes precios.
    4. El precio está en PESOS COLOMBIANOS (COP). Preséntalo como "$[precio] COP" (ej: $91.997 COP). NO conviertas moneda.
    
    FORMATO: Sin emojis. Incluye nombre, marca, tipo, precio (en COP) y familia olfativa. Explica por qué encaja. Usa negritas para datos clave y "────" como separador. Responde en español.
    
    CATÁLOGO DISPONIBLE:
    {answers_summary}
    
    MESSAGES: {history}
    USER: Basándote en mis respuestas del test olfativo, recoméndame el perfume perfecto del catálogo Eluxar.
    """
