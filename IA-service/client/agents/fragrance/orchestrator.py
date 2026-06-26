import json
import random
from utils.logger import get_logger
from utils.retry import run_with_retry
from agents.fragrance.mock_data import MOCK_QUESTIONS, TOTAL_QUESTIONS, FALLBACK_RECOMMENDATION
from agents.fragrance.prompts import fragrance_question_generator
from agents.fragrance.recommendation_service import get_recommendation

log = get_logger(__name__)

QUESTION_THEMES = [
    "género o destinatario de la fragancia",
    "ocasión de uso principal (diario, noche, evento especial)",
    "familia olfativa preferida (fresco, amaderado, floral, oriental)",
    "intensidad preferida (ligera, moderada, intensa)",
    "clima o temporada de uso",
    "personalidad o estilo de quien la usará",
    "presupuesto aproximado",
]


async def _generate_question(history: list, step: int, total_steps: int) -> dict:
    """
    Genera la siguiente pregunta usando el LLM basándose en temas no cubiertos.
    """
    history_summary = "\n".join(
        [
            f"Pregunta {i+1}: {item['question']}\nRespuesta: {item['answer']}"
            for i, item in enumerate(history)
        ]
    )

    used_themes = [item.get("theme") for item in history if item.get("theme")]
    available = [t for t in QUESTION_THEMES if t not in used_themes]
    theme = available[0] if available else QUESTION_THEMES[0]

    response = fragrance_question_generator(history_summary, step, total_steps, theme=theme)
    content: str = response.text()

    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()

    try:
        data = json.loads(content)
        return {
            "question": data.get("question", "¿Continuamos con el test?"),
            "options": data.get("options", ["Opción 1", "Opción 2", "Opción 3", "Opción 4"])[:4],
            "theme": theme
        }
    except json.JSONDecodeError as exc:
        log.warning("No se pudo analizar el JSON de la pregunta (step=%d): %s", step, exc)
        return {
            "question": "¿Continuamos con el test?",
            "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
            "theme": theme
        }


async def process_fragrance_test(message: str, history: list, step: int) -> dict:
    """
    Procesa un paso del test de fragancias.

    Pasos 0 … TOTAL_QUESTIONS-1  → genera la siguiente pregunta.
    Step  TOTAL_QUESTIONS         → produce recommendation.

    Contrato HTTP (campos consumidos por React):
      response, question, options, history, step, finished, totalSteps

    Args:
        message: La respuesta del usuario a la pregunta anterior (puede estar vacía en el paso 0).
        history: Pares acumulados [{question, answer}, …] enviados por el frontend.
        step:    Índice de paso actual basado en 0.

    Returns:
        Un diccionario que coincide con el contrato de respuesta HTTP.
    """
    # ── Fase de generación de preguntas ────────────────────────────────────────
    if step < TOTAL_QUESTIONS:
        try:
            q_data = await run_with_retry(
                _generate_question, history, step + 1, TOTAL_QUESTIONS,
                retries=3, delay=5.0,
            )
        except BaseException as exc:
            log.error("No se pudo generar la pregunta del LLM (step=%d): %s", step, exc)
            q_data = MOCK_QUESTIONS[min(step, len(MOCK_QUESTIONS) - 1)]

        return {
            "response": q_data["question"],
            "question": q_data["question"],
            "options":  q_data["options"],
            "history":  history,
            "step":     step + 1,
            "finished": False,
            "totalSteps": TOTAL_QUESTIONS,
        }

    # ── Fase de generación de recomendaciones ─────────────────────────────────
    if step == TOTAL_QUESTIONS:
        answers_summary = "\n".join(
            [
                f"- {item.get('question', 'Pregunta')}: {item.get('answer', '')}"
                for item in history
            ]
        )

        log.info("Generando recomendación para %d respuestas.", len(history))

        try:
            final_content, product_id = await get_recommendation(answers_summary)
        except BaseException as exc:
            log.error("La recomendación del LLM falló: %s", exc)
            final_content = FALLBACK_RECOMMENDATION
            product_id = None

        return {
            "response": final_content,
            "productId": product_id,
            "history":  history,
            "step":     step + 1,
            "finished": True,
            "totalSteps": TOTAL_QUESTIONS,
        }

    # ── Guard: paso fuera del rango esperado ──────────────────────────────────
    log.warning("Se llamó a process_fragrance_test con step fuera de rango=%d.", step)
    return {
        "response": "Test completado.",
        "history":  history,
        "step":     step,
        "finished": True,
        "totalSteps": TOTAL_QUESTIONS,
    }
