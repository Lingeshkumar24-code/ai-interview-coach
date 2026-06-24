"""
Routes for uploading and parsing a candidate's resume (PDF) to personalize
interview questions based on their projects, skills, and experience.
"""
from fastapi import APIRouter, File, HTTPException, UploadFile

from config import get_settings
from models.schemas import ResumeParseResponse
from services.resume_service import parse_resume

router = APIRouter(prefix="/api/resume", tags=["Resume"])

settings = get_settings()


@router.post("/upload", response_model=ResumeParseResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts a PDF resume, extracts text, and returns extracted skills,
    projects, and experience to be used for personalized question generation.
    """
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_resume_size_mb:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.1f} MB). Max allowed is {settings.max_resume_size_mb} MB.",
        )

    parsed = parse_resume(contents)

    if not parsed["raw_text"]:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from this PDF. It may be a scanned image without OCR text.",
        )

    return ResumeParseResponse(
        extracted_skills=parsed["extracted_skills"],
        extracted_projects=parsed["extracted_projects"],
        extracted_experience=parsed["extracted_experience"],
        raw_text_preview=parsed["raw_text_preview"],
    )
