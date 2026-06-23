"""
Fragrance test orchestrator.

Public API: process_fragrance_test()

This module is the ONLY entry point for the fragrance test flow. It is
responsible for:
  - Deciding whether to generate a question or produce a recommendation.
  - Delegating question generation to the LLM prompts.
  - Delegating recommendation to the recommendation service.
  - Providing fallback responses when the LLM is unavailable.
  - Building the response dict that matches the HTTP contract consumed
    by Spring Boot / React frontend (do NOT change field names).
"""

import json
from utils.logger import get_logger
from utils.retry import run_with_retry
from agents.fragrance.mock_data import MOCK_QUESTIONS, TOTAL_QUESTIONS, FALLBACK_RECOMMENDATION
from agents.fragrance.prompts import fragrance_question_generator
from agents.fragrance.recommendation_service import get_recommendation

log = get_logger(__name__)


async def _generate_question(history: list, step: int, total_steps: int) -> dict:
    """
    Call the LLM to generate question `step` and parse the JSON response.

    Returns a dict with keys ``question`` and ``options``.
    Falls back to a hardcoded question on parse failure.
    """
    history_summary = "\n".join(
        [
            f"Pregunta {i+1}: {item['question']}\nRespuesta: {item['answer']}"
            for i, item in enumerate(history)
        ]
    )

    response = fragrance_question_generator(history_summary, step, total_steps)
    content: str = response.text()

    # Strip markdown code fences if the LLM wrapped the JSON.
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()

    try:
        data = json.loads(content)
        return {
            "question": data.get("question", "¿Continuamos con el test?"),
            "options": data.get("options", ["Opción 1", "Opción 2", "Opción 3", "Opción 4"])[:4],
        }
    except json.JSONDecodeError as exc:
        log.warning("Could not parse LLM question JSON (step=%d): %s", step, exc)
        fallback_idx = min(step - 1, len(MOCK_QUESTIONS) - 1)
        return MOCK_QUESTIONS[fallback_idx]


async def process_fragrance_test(message: str, history: list, step: int) -> dict:
    """
    Process one step of the fragrance test.

    Steps 0 … TOTAL_QUESTIONS-1  → generate next question.
    Step  TOTAL_QUESTIONS         → produce recommendation.

    HTTP contract (fields consumed by React):
      response, question, options, history, step, finished, totalSteps

    Args:
        message: The user's answer to the previous question (may be empty on step 0).
        history: Accumulated [{question, answer}, …] pairs sent by the frontend.
        step:    0-based current step index.

    Returns:
        A dict matching the HTTP response contract.
    """
    # ── Question phase ────────────────────────────────────────────────────────
    if step < TOTAL_QUESTIONS:
        try:
            q_data = await run_with_retry(
                _generate_question, history, step + 1, TOTAL_QUESTIONS,
                retries=3, delay=5.0,
            )
        except BaseException as exc:
            log.error("LLM question generation failed (step=%d): %s", step, exc)
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

    # ── Recommendation phase ──────────────────────────────────────────────────
    if step == TOTAL_QUESTIONS:
        answers_summary = "\n".join(
            [
                f"- {item.get('question', 'Pregunta')}: {item.get('answer', '')}"
                for item in history
            ]
        )

        log.info("Generating recommendation for %d answers.", len(history))

        try:
            final_content = await get_recommendation(answers_summary)
        except BaseException as exc:
            log.error("LLM recommendation failed: %s", exc)
            final_content = FALLBACK_RECOMMENDATION

        return {
            "response": final_content,
            "history":  history,
            "step":     step + 1,
            "finished": True,
            "totalSteps": TOTAL_QUESTIONS,
        }

    # ── Guard: beyond expected range ──────────────────────────────────────────
    log.warning("process_fragrance_test called with out-of-range step=%d.", step)
    return {
        "response": "Test completado.",
        "history":  history,
        "step":     step,
        "finished": True,
        "totalSteps": TOTAL_QUESTIONS,
    }
