import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Dynamically locate project root (bidsure-ai directory)
_CORE_DIR = os.path.abspath(os.path.dirname(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_CORE_DIR, "..", "..", ".."))
_DEFAULT_DB_PATH = os.path.join(_PROJECT_ROOT, "bidsure.db").replace("\\", "/")
_DEFAULT_STORAGE_DIR = os.path.abspath(os.path.join(_PROJECT_ROOT, "storage"))


class Settings(BaseSettings):
    APP_NAME: str = "BidSure AI"
    APP_TAGLINE: str = "AI-Powered Bid Compliance Verification & Decision Support Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Security & JWT
    JWT_SECRET: str = "bidsure_ai_super_secret_jwt_key_sih2026_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = f"sqlite:///{_DEFAULT_DB_PATH}"

    # AI & LLM Providers
    LLM_PROVIDER: str = "mock"  # "mock" or "openai"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # File Storage
    STORAGE_PROVIDER: str = "local"
    STORAGE_DIR: str = _DEFAULT_STORAGE_DIR

    # OCR
    OCR_PROVIDER: str = "pymupdf"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()