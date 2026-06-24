"""
Resume parsing service: extracts text from an uploaded PDF resume and pulls out
candidate skills, projects, and experience hints to personalize interview questions.
"""
import io
import re
from typing import List

import pdfplumber
from PyPDF2 import PdfReader

SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "react", "node", "fastapi", "django",
    "flask", "sql", "postgresql", "mysql", "mongodb", "aws", "azure", "gcp", "docker",
    "kubernetes", "terraform", "git", "pandas", "numpy", "scikit-learn", "tensorflow",
    "pytorch", "spark", "airflow", "tableau", "power bi", "excel", "linux", "ci/cd",
    "machine learning", "deep learning", "nlp", "computer vision", "rest api", "graphql",
    "redis", "kafka", "microservices", "spring", "spring boot", "hibernate",
]


def _extract_text_pdfplumber(file_bytes: bytes) -> str:
    text_parts: List[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text_parts.append(page_text)
    return "\n".join(text_parts)


def _extract_text_pypdf2(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(text_parts)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Try pdfplumber first (better layout handling); fall back to PyPDF2 if it fails
    or returns empty text.
    """
    text = ""
    try:
        text = _extract_text_pdfplumber(file_bytes)
    except Exception:
        text = ""

    if not text.strip():
        try:
            text = _extract_text_pypdf2(file_bytes)
        except Exception:
            text = ""

    return text.strip()


def _find_section(text: str, headers: List[str]) -> str:
    lower = text.lower()
    for header in headers:
        idx = lower.find(header)
        if idx != -1:
            # Grab the next ~800 characters after the header as the section body
            return text[idx : idx + 800]
    return ""


def extract_skills(text: str) -> List[str]:
    lower = text.lower()
    found = [kw for kw in SKILL_KEYWORDS if kw in lower]
    # de-duplicate while preserving order
    seen = set()
    result = []
    for kw in found:
        if kw not in seen:
            seen.add(kw)
            result.append(kw.title() if " " not in kw else kw)
    return result[:20]


def extract_projects(text: str) -> List[str]:
    section = _find_section(text, ["projects", "project experience"])
    if not section:
        return []
    # Split on newlines / bullet markers, keep short non-empty lines
    lines = re.split(r"[\n•\-–]+", section)
    projects = [line.strip() for line in lines if 15 < len(line.strip()) < 200]
    return projects[:5]


def extract_experience_summary(text: str) -> str:
    section = _find_section(text, ["experience", "work experience", "employment history"])
    if not section:
        return ""
    return " ".join(section.split())[:500]


def parse_resume(file_bytes: bytes) -> dict:
    text = extract_text_from_pdf(file_bytes)
    return {
        "raw_text": text,
        "extracted_skills": extract_skills(text),
        "extracted_projects": extract_projects(text),
        "extracted_experience": extract_experience_summary(text),
        "raw_text_preview": text[:1000],
    }
