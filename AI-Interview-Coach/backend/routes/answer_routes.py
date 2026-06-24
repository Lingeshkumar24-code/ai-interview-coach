"""
Routes for submitting candidate answers and receiving AI evaluation.
"""
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.db_models import Interview
from models.schemas import AnswerSubmit, EvaluationOut
from services.evaluation_service import evaluate_answer

router = APIRouter(prefix="/api/answers", tags=["Answers"])


@router.post("/submit", response_model=EvaluationOut)
async def submit_answer(payload: AnswerSubmit, db: Session = Depends(get_db)):
    """
    Saves the candidate's answer and returns an AI-generated evaluation:
    scores, strengths, weaknesses, improvements, and an ideal answer.
    """
    interview = db.query(Interview).filter(Interview.id == payload.interview_id).first()
    if interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")

    try:
        evaluation = await evaluate_answer(
            db=db,
            question_id=payload.question_id,
            role=interview.role,
            answer_text=payload.answer_text,
            skipped=payload.skipped,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    return EvaluationOut(
        technical_score=evaluation.technical_score,
        depth_score=evaluation.depth_score,
        clarity_score=evaluation.clarity_score,
        problem_solving_score=evaluation.problem_solving_score,
        overall_score=evaluation.overall_score,
        strengths=json.loads(evaluation.strengths or "[]"),
        weaknesses=json.loads(evaluation.weaknesses or "[]"),
        improvements=json.loads(evaluation.improvements or "[]"),
        ideal_answer=evaluation.ideal_answer or "",
    )
