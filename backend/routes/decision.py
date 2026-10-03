from fastapi import APIRouter, HTTPException, status
from ml.predict import get_predictor
from schemas import CharteringDecisionResponse, ForecastRequest
from services import decision_service

router = APIRouter()


@router.post(
    "/chartering-decision",
    response_model=CharteringDecisionResponse,
    status_code=status.HTTP_200_OK,
    summary="Chartering Strategic Recommendation",
    description="Evaluates voyage variables using transparent maritime commercial heuristics and provides chartering decision guidance.",
)
def evaluate_chartering_decision(payload: ForecastRequest) -> CharteringDecisionResponse:
    try:
        predictor = get_predictor()
        input_dict = payload.model_dump()
        predicted_rate = predictor.predict(input_dict)

        decision = decision_service.evaluate_chartering_strategy(
            predicted_freight_rate=predicted_rate,
            cargo_demand=payload.cargo_demand,
            fuel_price=payload.fuel_price,
            port_congestion=payload.port_congestion,
            vessel_type=payload.vessel_type,
        )

        return CharteringDecisionResponse(**decision)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chartering decision evaluation failed: {str(exc)}",
        )
