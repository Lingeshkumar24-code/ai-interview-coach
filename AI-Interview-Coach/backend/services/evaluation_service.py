"""
Business logic for evaluating a candidate's answer and persisting the evaluation.
"""
import json
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from models.db_models import Answer, Evaluation, Question
from prompts.evaluation_prompts import build_evaluation_prompt
from services.llm_service import LLMServiceError, generate_json


def _clamp(value, lo=0, hi=10):
    try:
        value = float(value)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(hi, value))


def _fallback_evaluation(skipped: bool) -> dict:
    if skipped:
        return {
            "technical_score": 0,
            "depth_score": 0,
            "clarity_score": 0,
            "problem_solving_score": 0,
            "overall_score": 0,
            "strengths": [],
            "weaknesses": ["Question was skipped — no answer provided."],
            "improvements": ["Attempt every question to receive meaningful feedback."],
            "ideal_answer": "N/A — no answer was submitted for this question.",
        }
    return {
        "technical_score": 5,
        "depth_score": 5,
        "clarity_score": 5,
        "problem_solving_score": 5,
        "overall_score": 50,
        "strengths": ["Attempted the question."],
        "weaknesses": ["Automated evaluation service was unavailable; this is a placeholder score."],
        "improvements": ["Try resubmitting once the AI evaluation service is back online."],
        "ideal_answer": "Unavailable — the AI evaluator could not be reached.",
    }


async def evaluate_answer(
    db: Session,
    question_id: UUID,
    role: str,
    answer_text: str,
    skipped: bool = False,
) -> Evaluation:
    """
    Persists the candidate's answer, calls the LLM to evaluate it, and persists
    the resulting evaluation. Returns the created Evaluation object.
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if question is None:
        raise ValueError("Question not found")

    answer = Answer(
        question_id=question.id,
        user_answer=answer_text or "",
        skipped=1 if skipped else 0,
    )
    db.add(answer)
    db.flush()

    if skipped or not answer_text or not answer_text.strip():
        result = _fallback_evaluation(skipped=True)
    else:
        prompt = build_evaluation_prompt(role, question.question_text, answer_text)
        try:
            result = await generate_json(prompt, temperature=0.3)
        except LLMServiceError:
            result = _fallback_evaluation(skipped=False)

    technical = _clamp(result.get("technical_score", 0))
    depth = _clamp(result.get("depth_score", 0))
    clarity = _clamp(result.get("clarity_score", 0))
    problem_solving = _clamp(result.get("problem_solving_score", 0))

    overall = result.get("overall_score")
    try:
        overall = float(overall)
    except (TypeError, ValueError):
        overall = (technical + depth + clarity + problem_solving) * 2.5
    overall = max(0, min(100, overall))

    def _as_list(value):
        if isinstance(value, list):
            return [str(v) for v in value]
        if isinstance(value, str) and value.strip():
            return [value.strip()]
        return []

    evaluation = Evaluation(
        answer_id=answer.id,
        technical_score=technical,
        depth_score=depth,
        clarity_score=clarity,
        problem_solving_score=problem_solving,
        overall_score=overall,
        strengths=json.dumps(_as_list(result.get("strengths"))),
        weaknesses=json.dumps(_as_list(result.get("weaknesses"))),
        improvements=json.dumps(_as_list(result.get("improvements"))),
        ideal_answer=str(result.get("ideal_answer", "")),
        feedback=json.dumps(result),
    )
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)
    return evaluation
