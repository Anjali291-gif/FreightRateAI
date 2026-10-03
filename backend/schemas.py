"""
Pydantic Data Schemas for FreightAI API
Provides request and response validation, typing, and OpenAPI documentation schemas.
"""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


# Health Schema
class HealthResponse(BaseModel):
    status: str = Field(default="success", example="success")
    message: str = Field(default="FreightAI backend is running", example="FreightAI backend is running")


# Dataset & Model Summary Schema
class SummaryResponse(BaseModel):
    total_dataset_rows: int = Field(..., description="Total rows in the freight dataset", example=10000)
    average_freight_rate: float = Field(..., description="Average freight rate across all transactions in $/MT", example=60.25)
    average_cargo_demand: float = Field(..., description="Average cargo demand index", example=101.16)
    average_fuel_price: float = Field(..., description="Average VLSFO bunker fuel price in $/MT", example=655.65)
    selected_ml_model: str = Field(..., description="Currently deployed ML regression model", example="Gradient Boosting Regressor")
    mae: float = Field(..., description="Mean Absolute Error on test set ($/MT)", example=2.0276)
    rmse: float = Field(..., description="Root Mean Squared Error on test set ($/MT)", example=2.5457)
    r2_score: float = Field(..., description="R² Coefficient of Determination on test set", example=0.9938)
    additional_metadata: Optional[Dict[str, Any]] = None


# Freight Forecast Request & Response Schemas
class ForecastRequest(BaseModel):
    date: str = Field(..., description="Voyage or inquiry date in YYYY-MM-DD format", example="2026-10-03")
    vessel_type: str = Field(..., description="Vessel classification type", example="Capesize")
    vessel_size: float = Field(..., gt=0, description="Vessel deadweight tonnage (DWT)", example=185000)
    origin: str = Field(..., description="Departure / loading port", example="Port Hedland")
    destination: str = Field(..., description="Arrival / discharge port", example="Qingdao")
    commodity: str = Field(..., description="Cargo commodity being transported", example="Iron Ore")
    distance_nm: float = Field(..., gt=0, description="Voyage distance in nautical miles", example=3650.0)
    fuel_price: float = Field(..., gt=0, description="Current bunker fuel price in USD per metric ton", example=625.0)
    cargo_demand: float = Field(..., gt=0, description="Current cargo demand index (baseline 100)", example=105.0)
    weather_condition: str = Field(..., description="Expected route sea/weather condition", example="Calm")
    port_congestion: float = Field(..., ge=0, description="Expected port waiting time in days", example=2.0)


class ForecastResponse(BaseModel):
    predicted_freight_rate: float = Field(..., description="Predicted freight rate in USD per metric ton", example=21.82)
    currency: str = Field(default="USD", example="USD")
    unit: str = Field(default="per metric ton", example="per metric ton")
    model: str = Field(..., description="Name of the machine learning model used", example="Gradient Boosting Regressor")


# Chartering Decision Recommendation Schema
class CharteringDecisionResponse(BaseModel):
    predicted_freight_rate: float = Field(..., description="Predicted freight rate in USD/MT", example=21.82)
    demand_level: Literal["Low", "Medium", "High"] = Field(..., description="Categorized market cargo demand level")
    fuel_cost_level: Literal["Low", "Medium", "High"] = Field(..., description="Categorized bunker fuel cost exposure")
    congestion_level: Literal["Low", "Medium", "High"] = Field(..., description="Categorized destination/port congestion tier")
    recommendation: str = Field(..., description="Strategic vessel chartering recommendation")
    explanation: str = Field(..., description="Detailed analytical justification and market factors breakdown")


# Historical Record Schema
class HistoricalRecord(BaseModel):
    date: str
    vessel_type: str
    vessel_size: float
    origin: str
    destination: str
    commodity: str
    distance_nm: float
    fuel_price: float
    cargo_demand: float
    freight_rate: float
    weather_condition: str
    port_congestion: float


# Vessel Stat Schema
class VesselStat(BaseModel):
    vessel_type: str
    count: int
    avg_dwt: float
    min_dwt: float
    max_dwt: float
    avg_freight_rate: float
    min_freight_rate: float
    max_freight_rate: float
    common_commodities: List[str]


class VesselsResponse(BaseModel):
    total_vessel_types: int
    vessels: List[VesselStat]


# Demand Trend Schema
class DemandTrendPoint(BaseModel):
    period: str
    avg_demand: float
    min_demand: float
    max_demand: float
    record_count: int


class DemandResponse(BaseModel):
    total_periods: int
    baseline_index: float
    trend: List[DemandTrendPoint]
