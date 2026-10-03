from .analytics import router as analytics_router
from .decision import router as decision_router
from .forecast import router as forecast_router
from .health import router as health_router

__all__ = [
    "health_router",
    "forecast_router",
    "analytics_router",
    "decision_router",
]
