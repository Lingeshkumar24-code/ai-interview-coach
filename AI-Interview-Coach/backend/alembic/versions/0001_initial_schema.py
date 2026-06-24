"""initial schema — users, interviews, questions, answers, evaluations

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-24

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

difficulty_enum = postgresql.ENUM("Easy", "Medium", "Hard", name="difficultyenum")
experience_enum = postgresql.ENUM(
    "Fresher", "1-3 Years", "3-5 Years", "5+ Years", name="experienceenum"
)


def upgrade() -> None:
    bind = op.get_bind()
    difficulty_enum.create(bind, checkfirst=True)
    experience_enum.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, index=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "interviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.String(255), nullable=False),
        sa.Column("difficulty", difficulty_enum, nullable=False),
        sa.Column("experience", experience_enum, nullable=True),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("overall_score", sa.Float(), nullable=True),
        sa.Column("technical_score", sa.Float(), nullable=True),
        sa.Column("communication_score", sa.Float(), nullable=True),
        sa.Column("problem_solving_score", sa.Float(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("readiness_label", sa.String(64), nullable=True),
        sa.Column("resume_based", sa.Integer(), nullable=True, server_default="0"),
    )

    op.create_table(
        "questions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "interview_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("interviews.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("question_text", sa.Text(), nullable=False),
    )

    op.create_table(
        "answers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "question_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("questions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("user_answer", sa.Text(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(), nullable=False),
        sa.Column("skipped", sa.Integer(), nullable=True, server_default="0"),
    )

    op.create_table(
        "evaluations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "answer_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("answers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("technical_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("depth_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("clarity_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("problem_solving_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("overall_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("strengths", sa.Text(), nullable=True),
        sa.Column("weaknesses", sa.Text(), nullable=True),
        sa.Column("improvements", sa.Text(), nullable=True),
        sa.Column("ideal_answer", sa.Text(), nullable=True),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("evaluations")
    op.drop_table("answers")
    op.drop_table("questions")
    op.drop_table("interviews")
    op.drop_table("users")
    experience_enum.drop(op.get_bind(), checkfirst=True)
    difficulty_enum.drop(op.get_bind(), checkfirst=True)
