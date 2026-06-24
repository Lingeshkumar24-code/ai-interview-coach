"""
Business logic for compiling the final interview report after all questions
have been answered.
"""
import json
from uuid import UUID

from sqlalchemy.orm import Session

from models.db_models import Answer, Evaluation, Interview, Question


def _readiness_label(score: float) -> str:
    if score >= 90:
        return "Excellent"
    if score >= 75:
        return "Ready"
    if score >= 60:
        return "Needs Improvement"
    return "Beginner"


def build_final_report(db: Session, interview_id: UUID) -> dict:
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if interview is None:
        raise ValueError("Interview not found")

    questions = (
        db.query(Question)
        .filter(Question.interview_id == interview_id)
        .order_by(Question.order_index)
        .all()
    )

    per_question = []
    technical_scores, clarity_scores, problem_scores, depth_scores, overall_scores = [], [], [], [], []

    for q in questions:
        answer = db.query(Answer).filter(Answer.question_id == q.id).first()
        evaluation = None
        if answer:
            evaluation = db.query(Evaluation).filter(Evaluation.answer_id == answer.id).first()

        if evaluation:
            technical_scores.append(evaluation.technical_score)
            clarity_scores.append(evaluation.clarity_score)
            problem_scores.append(evaluation.problem_solving_score)
            depth_scores.append(evaluation.depth_score)
            overall_scores.append(evaluation.overall_score)

            per_question.append(
                {
                    "question_id": str(q.id),
                    "order_index": q.order_index,
                    "category": q.category,
                    "question": q.question_text,
                    "answer": answer.user_answer if answer else "",
                    "skipped": bool(answer.skipped) if answer else True,
                    "technical_score": evaluation.technical_score,
                    "depth_score": evaluation.depth_score,
                    "clarity_score": evaluation.clarity_score,
                    "problem_solving_score": evaluation.problem_solving_score,
                    "overall_score": evaluation.overall_score,
                    "strengths": json.loads(evaluation.strengths or "[]"),
                    "weaknesses": json.loads(evaluation.weaknesses or "[]"),
                    "improvements": json.loads(evaluation.improvements or "[]"),
                    "ideal_answer": evaluation.ideal_answer,
                }
            )
        else:
            per_question.append(
                {
                    "question_id": str(q.id),
                    "order_index": q.order_index,
                    "category": q.category,
                    "question": q.question_text,
                    "answer": "",
                    "skipped": True,
                    "technical_score": 0,
                    "depth_score": 0,
                    "clarity_score": 0,
                    "problem_solving_score": 0,
                    "overall_score": 0,
                    "strengths": [],
                    "weaknesses": ["Not answered"],
                    "improvements": [],
                    "ideal_answer": "",
                }
            )

    def _avg(values):
        return round(sum(values) / len(values), 2) if values else 0.0

    overall_score = _avg(overall_scores)
    technical_score = _avg(technical_scores) * 10  # scale /10 -> /100
    communication_score = _avg(clarity_scores) * 10
    problem_solving_score = _avg(problem_scores) * 10
    confidence_score = _avg(depth_scores) * 10

    readiness = _readiness_label(overall_score)

    # Persist aggregate scores back onto the Interview row
    interview.overall_score = overall_score
    interview.technical_score = technical_score
    interview.communication_score = communication_score
    interview.problem_solving_score = problem_solving_score
    interview.confidence_score = confidence_score
    interview.readiness_label = readiness
    db.commit()

    return {
        "interview_id": str(interview.id),
        "role": interview.role,
        "overall_score": overall_score,
        "readiness_label": readiness,
        "technical_score": round(technical_score, 2),
        "communication_score": round(communication_score, 2),
        "problem_solving_score": round(problem_solving_score, 2),
        "confidence_score": round(confidence_score, 2),
        "per_question": per_question,
    }
