from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "storage_provider": settings.STORAGE_PROVIDER,
    }


@router.get("/ready")
def readiness_check():
    return {
        "status": "ready",
        "database": "connected",
    }
