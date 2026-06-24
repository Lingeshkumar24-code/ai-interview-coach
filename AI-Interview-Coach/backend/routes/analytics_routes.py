"""
Routes for the analytics page: past interviews, performance trend, skill distribution.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.db import get_db
from models.db_models import Interview, User
from models.schemas import AnalyticsOut, PastInterviewOut

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsOut)
def get_analytics(email: str = Query(..., description="Candidate email"), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="No interview history found for this email")

    interviews = (
        db.query(Interview)
        .filter(Interview.user_id == user.id)
        .order_by(Interview.date.asc())
        .all()
    )

    past_interviews = [
        PastInterviewOut(
            id=i.id,
            date=i.date,
            role=i.role,
            difficulty=i.difficulty.value if i.difficulty else "Medium",
            overall_score=i.overall_score,
        )
        for i in interviews
    ]

    trend = [
        {"date": i.date.isoformat(), "role": i.role, "score": i.overall_score or 0}
        for i in interviews
        if i.overall_score is not None
    ]

    scored = [i for i in interviews if i.overall_score is not None]

    def _avg(attr):
        values = [getattr(i, attr) for i in scored if getattr(i, attr) is not None]
        return round(sum(values) / len(values), 2) if values else 0

    skill_distribution = {
        "technical": _avg("technical_score"),
        "communication": _avg("communication_score"),
        "problem_solving": _avg("problem_solving_score"),
        "confidence": _avg("confidence_score"),
    }

    return AnalyticsOut(
        past_interviews=past_interviews,
        trend=trend,
        skill_distribution=skill_distribution,
    )
