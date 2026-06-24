"""
Application configuration, loaded from environment variables / .env file.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://interview_user:interview_pass@localhost:5432/ai_interview_coach"

    # Ollama / LLM
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:8b"
    ollama_timeout: int = 120

    # App
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Uploads
    max_resume_size_mb: int = 10
    upload_dir: str = "./uploads"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
