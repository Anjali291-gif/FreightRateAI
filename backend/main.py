"""
FreightAI – Intelligent Freight Forecasting & Vessel Chartering System
Main FastAPI Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from routes import (
    analytics_router,
    decision_router,
    forecast_router,
    health_router,
)

app = FastAPI(
    title="FreightAI API",
    description="Intelligent Freight Rate Forecasting & Vessel Chartering Decision Support System (SIH 2026)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration — localhost for dev, Vercel for production
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Vercel deployed domains (wildcard not supported by CORSMiddleware — explicit ones below)
    # Set CORS_ORIGIN env var to add your specific Vercel URL at runtime
]

# Allow any additional origin configured via environment variable (e.g. the Vercel URL)
_extra_origin = os.environ.get("CORS_ORIGIN", "").strip()
if _extra_origin:
    ALLOWED_ORIGINS.append(_extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow all *.vercel.app origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(health_router, prefix="/api", tags=["Health & Status"])
app.include_router(forecast_router, prefix="/api", tags=["Forecasting"])
app.include_router(decision_router, prefix="/api", tags=["Decision Support"])
app.include_router(analytics_router, prefix="/api", tags=["Analytics & Historical Data"])


@app.get("/", tags=["Root"])
def root_entry():
    return {
        "project": "FreightAI",
        "description": "Intelligent Freight Forecasting & Vessel Chartering System API",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
