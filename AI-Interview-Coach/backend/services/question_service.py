"""
Business logic for generating interview questions and persisting them.
"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from models.db_models import DifficultyEnum, ExperienceEnum, Interview, Question, User
from prompts.question_prompts import build_question_generation_prompt, get_categories_for_role
from services.llm_service import LLMServiceError, generate_json


def _map_experience(value: str) -> ExperienceEnum:
    mapping = {
        "Fresher": ExperienceEnum.fresher,
        "1-3 Years": ExperienceEnum.one_to_three,
        "1–3 Years": ExperienceEnum.one_to_three,
        "3-5 Years": ExperienceEnum.three_to_five,
        "3–5 Years": ExperienceEnum.three_to_five,
        "5+ Years": ExperienceEnum.five_plus,
    }
    return mapping.get(value, ExperienceEnum.fresher)


def _map_difficulty(value: str) -> DifficultyEnum:
    mapping = {
        "Easy": DifficultyEnum.easy,
        "Medium": DifficultyEnum.medium,
        "Hard": DifficultyEnum.hard,
    }
    return mapping.get(value, DifficultyEnum.medium)


FALLBACK_QUESTIONS = {
    "default": [
        "Walk me through how you would approach a problem you've never seen before in this role.",
        "Describe a technical concept central to this role and explain it as if to a junior teammate.",
        "Tell me about a project where you had to debug a difficult issue. What was your process?",
        "How do you decide between two valid technical approaches when solving a problem?",
        "Describe a time you had to learn a new tool or technology quickly for a project.",
    ]
}


async def generate_questions_for_interview(
    db: Session,
    full_name: str,
    email: str,
    target_role: str,
    experience: str,
    difficulty: str,
    resume_text: Optional[str] = None,
) -> Interview:
    """
    Creates (or reuses) a User, creates an Interview, calls the LLM to generate
    5 role-specific questions, and persists everything to PostgreSQL.
    """
    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(name=full_name, email=email)
        db.add(user)
        db.flush()

    interview = Interview(
        user_id=user.id,
        role=target_role,
        difficulty=_map_difficulty(difficulty),
        experience=_map_experience(experience),
        resume_based=1 if resume_text else 0,
    )
    db.add(interview)
    db.flush()

    categories = get_categories_for_role(target_role)
    prompt = build_question_generation_prompt(target_role, experience, difficulty, resume_text)

    try:
        result = await generate_json(prompt, temperature=0.5)
        raw_questions: List[dict] = result.get("questions", [])
        if not raw_questions or len(raw_questions) < 1:
            raise LLMServiceError("LLM returned no questions")
    except LLMServiceError:
        # Graceful fallback so the app remains usable even if Ollama is down
        raw_questions = [{"id": i + 1, "question": q} for i, q in enumerate(FALLBACK_QUESTIONS["default"])]

    # Ensure exactly 5 questions; pad/truncate defensively
    raw_questions = raw_questions[:5]
    while len(raw_questions) < 5:
        idx = len(raw_questions)
        raw_questions.append({"id": idx + 1, "question": FALLBACK_QUESTIONS["default"][idx % 5]})

    for i, q in enumerate(raw_questions):
        category = categories[i] if i < len(categories) else None
        question = Question(
            interview_id=interview.id,
            order_index=i + 1,
            category=category,
            question_text=q.get("question", "").strip() or FALLBACK_QUESTIONS["default"][i % 5],
        )
        db.add(question)

    db.commit()
    db.refresh(interview)
    return interview
