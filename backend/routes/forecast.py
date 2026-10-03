import logging
from fastapi import APIRouter, HTTPException, status
from ml.predict import get_predictor
from schemas import ForecastRequest, ForecastResponse

logger = logging.getLogger("freightai.forecast")
router = APIRouter()


@router.post(
    "/forecast",
    response_model=ForecastResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Freight Rate",
    description="Forecasts freight rate ($/MT) for a given maritime voyage specification using the trained ML model.",
)
def forecast_freight_rate(payload: ForecastRequest) -> ForecastResponse:
    try:
        predictor = get_predictor()
        # Convert Pydantic model to dictionary
        input_dict = payload.model_dump()
        predicted_rate = predictor.predict(input_dict)

        return ForecastResponse(
            predicted_freight_rate=round(float(predicted_rate), 2),
            currency="USD",
            unit="per metric ton",
            model=predictor.selected_model_name,
        )
    except FileNotFoundError as fnf_err:
        logger.error(f"Model file missing: {fnf_err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Forecasting model artifacts are not initialized or missing on disk.",
        )
    except Exception as exc:
        logger.error(f"Inference error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Freight rate prediction failed: {str(exc)}",
        )
