import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Ensures all models are imported and registered

# API Routers
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.tenders import router as tenders_router
from app.api.bidders import router as bidders_router
from app.api.documents import router as documents_router
from app.api.verification import router as verification_router
from app.api.reports import router as reports_router
from app.api.audit import router as audit_router
from app.api.health import router as health_router

# Create DB tables automatically on startup
Base.metadata.create_all(bind=engine)

# Ensure storage directory exists
os.makedirs(settings.STORAGE_DIR, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "BidSure AI: AI-Powered Bid Compliance Verification & Decision Support Platform "
        "for GeM Procurement"
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire up routers with /api/v1 prefix
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(dashboard_router, prefix=api_v1_prefix)
app.include_router(tenders_router, prefix=api_v1_prefix)
app.include_router(bidders_router, prefix=api_v1_prefix)
app.include_router(documents_router, prefix=api_v1_prefix)
app.include_router(verification_router, prefix=api_v1_prefix)
app.include_router(reports_router, prefix=api_v1_prefix)
app.include_router(audit_router, prefix=api_v1_prefix)

# Wire health endpoints directly and on v1
app.include_router(health_router, prefix=api_v1_prefix)
app.include_router(health_router)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "tagline": settings.APP_TAGLINE,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "api_prefix": api_v1_prefix,
    }