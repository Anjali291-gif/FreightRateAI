from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from schemas import (
    DemandResponse,
    HistoricalRecord,
    SummaryResponse,
    VesselsResponse,
)
from services import analytics_service

router = APIRouter()


@router.get(
    "/summary",
    response_model=SummaryResponse,
    summary="Dataset & Model Summary",
    description="Returns aggregate descriptive statistics of the maritime dataset and the selected ML model evaluation metrics.",
)
def get_dataset_summary() -> SummaryResponse:
    try:
        summary_info = analytics_service.get_summary()
        return SummaryResponse(**summary_info)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dataset summary: {str(exc)}",
        )


@router.get(
    "/historical",
    response_model=List[HistoricalRecord],
    summary="Historical Freight Data",
    description="Returns historical freight rate transactions with optional filtering by vessel type, commodity, origin, and destination.",
)
def get_historical_records(
    vessel_type: Optional[str] = Query(None, description="Filter by vessel type (e.g. Capesize, VLCC)"),
    commodity: Optional[str] = Query(None, description="Filter by commodity (e.g. Iron Ore, Crude Oil)"),
    origin: Optional[str] = Query(None, description="Filter by origin port"),
    destination: Optional[str] = Query(None, description="Filter by destination port"),
    limit: int = Query(100, ge=1, le=1000, description="Max number of historical records to return"),
) -> List[HistoricalRecord]:
    try:
        records = analytics_service.get_historical_data(
            vessel_type=vessel_type,
            commodity=commodity,
            origin=origin,
            destination=destination,
            limit=limit,
        )
        return records
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch historical data: {str(exc)}",
        )


@router.get(
    "/vessels",
    response_model=VesselsResponse,
    summary="Vessel Type Statistics",
    description="Returns statistical distributions and performance metrics partitioned across vessel classes.",
)
def get_vessel_statistics() -> VesselsResponse:
    try:
        stats = analytics_service.get_vessel_statistics()
        return VesselsResponse(**stats)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch vessel statistics: {str(exc)}",
        )


@router.get(
    "/demand",
    response_model=DemandResponse,
    summary="Cargo Demand Trend",
    description="Returns chronological monthly cargo demand index trends suitable for frontend line/bar charts.",
)
def get_demand_trends() -> DemandResponse:
    try:
        trends = analytics_service.get_cargo_demand_trends()
        return DemandResponse(**trends)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch cargo demand trends: {str(exc)}",
        )
