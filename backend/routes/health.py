from fastapi import APIRouter
from schemas import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="System Health Check",
    description="Returns backend service operational health status.",
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="success",
        message="FreightAI backend is running"
    )
