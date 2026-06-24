"""
AI Interview Coach — FastAPI backend entrypoint.

Run locally with:
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database.db import Base, engine
from routes import analytics_routes, answer_routes, interview_routes, report_routes, resume_routes
from services.llm_service import check_ollama_health

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup if they don't already exist.
    # For production use, prefer Alembic migrations instead (see backend/alembic/).
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AI Interview Coach API",
    description="Backend powering an AI-driven interview practice platform, using only open-source LLMs (Qwen3 via Ollama).",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview_routes.router)
app.include_router(answer_routes.router)
app.include_router(report_routes.router)
app.include_router(analytics_routes.router)
app.include_router(resume_routes.router)


@app.get("/")
def root():
    return {"message": "AI Interview Coach API is running.", "docs": "/docs"}


@app.get("/health")
async def health():
    ollama_ok = await check_ollama_health()
    return {
        "status": "ok",
        "ollama_connected": ollama_ok,
        "model": settings.ollama_model,
    }
