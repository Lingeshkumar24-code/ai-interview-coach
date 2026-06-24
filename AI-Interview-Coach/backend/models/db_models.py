"""
SQLAlchemy ORM models for: Users, Interviews, Questions, Answers, Evaluations.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.db import Base


class DifficultyEnum(str, enum.Enum):
    easy = "Easy"
    medium = "Medium"
    hard = "Hard"


class ExperienceEnum(str, enum.Enum):
    fresher = "Fresher"
    one_to_three = "1-3 Years"
    three_to_five = "3-5 Years"
    five_plus = "5+ Years"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(255), nullable=False)
    difficulty = Column(Enum(DifficultyEnum), nullable=False)
    experience = Column(Enum(ExperienceEnum), nullable=True)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    overall_score = Column(Float, nullable=True)
    technical_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    problem_solving_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    readiness_label = Column(String(64), nullable=True)
    resume_based = Column(Integer, default=0)  # 0 = False, 1 = True (portable across DBs)

    user = relationship("User", back_populates="interviews")
    questions = relationship("Question", back_populates="interview", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, nullable=False, default=1)
    category = Column(String(100), nullable=True)
    question_text = Column(Text, nullable=False)

    interview = relationship("Interview", back_populates="questions")
    answer = relationship("Answer", back_populates="question", uselist=False, cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    user_answer = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    skipped = Column(Integer, default=0)

    question = relationship("Question", back_populates="answer")
    evaluation = relationship("Evaluation", back_populates="answer", uselist=False, cascade="all, delete-orphan")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id = Column(UUID(as_uuid=True), ForeignKey("answers.id", ondelete="CASCADE"), nullable=False)
    technical_score = Column(Float, nullable=False, default=0)
    depth_score = Column(Float, nullable=False, default=0)
    clarity_score = Column(Float, nullable=False, default=0)
    problem_solving_score = Column(Float, nullable=False, default=0)
    overall_score = Column(Float, nullable=False, default=0)
    strengths = Column(Text, nullable=True)       # JSON-encoded list
    weaknesses = Column(Text, nullable=True)      # JSON-encoded list
    improvements = Column(Text, nullable=True)    # JSON-encoded list
    ideal_answer = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)        # raw / combined feedback text
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    answer = relationship("Answer", back_populates="evaluation")
