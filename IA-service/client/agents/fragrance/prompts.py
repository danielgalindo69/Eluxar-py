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

    SI EL TEMA ES 'presupuesto aproximado': genera las 4 opciones en PESOS COLOMBIANOS (COP), con rangos realistas para perfumes en el mercado colombiano, usando punto como separador de miles (ej: 'Menos de $80.000 COP', 'Entre $80.000 y $150.000 COP', 'Entre $150.000 y $250.000 COP', 'Más de $250.000 COP'). NUNCA generes precios en dólares.

    VARIACIÓN: Aunque el tema está fijo, varía el ángulo, enfoque o tipo de pregunta (directa, hipotética, comparativa, situacional) respecto a otras preguntas del mismo tema que hayas visto en el historial. El objetivo es que si el mismo tema apareciera en otra sesión, la redacción no sea casi idéntica. No te salgas del tema asignado.

    TONO: Habla siempre en SEGUNDA PERSONA ("tú", "te", "tu"). Pregunta directa: "¿qué prefieres?", "¿para quién buscas la fragancia?". Nunca en tercera persona ni fórmulas indirectas como "¿para qué tipo de persona crees que está diseñada?" o "la persona que usaría esto". El usuario responde sobre sus propias preferencias.

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
    5. TONO: Habla siempre en SEGUNDA PERSONA ("tú", "te", "tu"). "Te recomiendo", "tu perfume ideal sería", "basándome en lo que respondiste". Nunca en tercera persona como "el usuario prefiere" o "la persona que usaría esto busca".
    6. ESTRUCTURA: Si el perfume no calza perfectamente con las respuestas del test, varía cómo y dónde mencionas esa salvedad. No la aísles siempre en un párrafo final fijo con la fórmula "si el catálogo tuviera más variedad...". Puedes integrarla en la explicación principal o mencionarla brevemente de otra forma. Evita que la recomendación se sienta como una plantilla de 3 bloques siempre en el mismo orden.
    
    FORMATO: Sin emojis. Incluye nombre, marca, tipo, precio (en COP) y familia olfativa. Explica por qué encaja. Usa negritas para datos clave y "────" como separador. Responde en español.
    
    CATÁLOGO DISPONIBLE:
    {answers_summary}
    
    MESSAGES: {history}
    USER: Basándote en mis respuestas del test olfativo, recoméndame el perfume perfecto del catálogo Eluxar.
    """
