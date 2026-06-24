"""
Routes for creating interviews and generating role-specific questions.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.db_models import Interview, Question
from models.schemas import GenerateInterviewRequest, QuestionGenerationResponse, QuestionItem
from services.question_service import generate_questions_for_interview

router = APIRouter(prefix="/api/interviews", tags=["Interviews"])


@router.post("/generate", response_model=QuestionGenerationResponse)
async def generate_interview(payload: GenerateInterviewRequest, db: Session = Depends(get_db)):
    """
    Creates a new interview for the candidate and generates exactly 5
    role-specific interview questions using the local Qwen3 model.
    """
    interview = await generate_questions_for_interview(
        db=db,
        full_name=payload.full_name,
        email=payload.email,
        target_role=payload.target_role,
        experience=payload.experience,
        difficulty=payload.difficulty,
        resume_text=payload.resume_text,
    )

    questions = (
        db.query(Question)
        .filter(Question.interview_id == interview.id)
        .order_by(Question.order_index)
        .all()
    )

    return QuestionGenerationResponse(
        interview_id=interview.id,
        questions=[
            QuestionItem(id=q.order_index, question=q.question_text, category=q.category) for q in questions
        ],
    )


@router.get("/{interview_id}")
def get_interview(interview_id: UUID, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = (
        db.query(Question)
        .filter(Question.interview_id == interview_id)
        .order_by(Question.order_index)
        .all()
    )

    return {
        "interview_id": str(interview.id),
        "role": interview.role,
        "difficulty": interview.difficulty.value if interview.difficulty else None,
        "experience": interview.experience.value if interview.experience else None,
        "date": interview.date,
        "questions": [
            {"id": q.order_index, "question_id": str(q.id), "question": q.question_text, "category": q.category}
            for q in questions
        ],
    }
