"""
Pydantic schemas used for request validation and response serialization.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Candidate / Interview setup
# ---------------------------------------------------------------------------

class CandidateCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    target_role: str
    experience: str
    difficulty: str


class CandidateOut(BaseModel):
    id: UUID
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Questions
# ---------------------------------------------------------------------------

class QuestionItem(BaseModel):
    id: int
    question: str
    category: Optional[str] = None


class QuestionGenerationResponse(BaseModel):
    interview_id: UUID
    questions: List[QuestionItem]


class GenerateInterviewRequest(BaseModel):
    full_name: str
    email: EmailStr
    target_role: str
    experience: str
    difficulty: str
    resume_text: Optional[str] = None


# ---------------------------------------------------------------------------
# Answers / Evaluation
# ---------------------------------------------------------------------------

class AnswerSubmit(BaseModel):
    interview_id: UUID
    question_id: UUID
    answer_text: str = Field(default="", max_length=10000)
    skipped: bool = False


class EvaluationOut(BaseModel):
    technical_score: float
    depth_score: float
    clarity_score: float
    problem_solving_score: float
    overall_score: float
    strengths: List[str]
    weaknesses: List[str]
    improvements: List[str]
    ideal_answer: str


# ---------------------------------------------------------------------------
# Final Report
# ---------------------------------------------------------------------------

class FinalReportOut(BaseModel):
    interview_id: UUID
    role: str
    overall_score: float
    readiness_label: str
    technical_score: float
    communication_score: float
    problem_solving_score: float
    confidence_score: float
    per_question: List[dict]


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

class PastInterviewOut(BaseModel):
    id: UUID
    date: datetime
    role: str
    difficulty: str
    overall_score: Optional[float]

    class Config:
        from_attributes = True


class AnalyticsOut(BaseModel):
    past_interviews: List[PastInterviewOut]
    trend: List[dict]
    skill_distribution: dict


# ---------------------------------------------------------------------------
# Resume upload
# ---------------------------------------------------------------------------

class ResumeParseResponse(BaseModel):
    extracted_skills: List[str]
    extracted_projects: List[str]
    extracted_experience: str
    raw_text_preview: str
