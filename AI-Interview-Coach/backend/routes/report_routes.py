"""
Routes for generating the final interview report/dashboard.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.schemas import FinalReportOut
from services.report_service import build_final_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/{interview_id}", response_model=FinalReportOut)
def get_final_report(interview_id: UUID, db: Session = Depends(get_db)):
    """
    Compiles and returns the final report for a completed interview:
    overall score, readiness category, skill breakdown, and per-question detail.
    """
    try:
        report = build_final_report(db, interview_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    return report
