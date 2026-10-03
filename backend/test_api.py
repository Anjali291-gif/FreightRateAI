"""
Comprehensive API Test Suite for FreightAI
Validates all FastAPI routes using TestClient across:
- /api/health
- /api/summary
- /api/forecast
- /api/historical
- /api/vessels
- /api/demand
- /api/chartering-decision
"""

import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SAMPLE_VOYAGE_PAYLOAD = {
    "date": "2026-10-03",
    "vessel_type": "Capesize",
    "vessel_size": 185000,
    "origin": "Port Hedland",
    "destination": "Qingdao",
    "commodity": "Iron Ore",
    "distance_nm": 3650,
    "fuel_price": 625,
    "cargo_demand": 105,
    "weather_condition": "Calm",
    "port_congestion": 2.0,
}


def test_health_endpoint():
    print("[TEST] 1. Testing GET /api/health...")
    response = client.get("/api/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "success", f"Unexpected status: {data}"
    assert data["message"] == "FreightAI backend is running", f"Unexpected message: {data}"
    print(f"       Status: {response.status_code} | Response: {data}")


def test_summary_endpoint():
    print("[TEST] 2. Testing GET /api/summary...")
    response = client.get("/api/summary")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    required_keys = [
        "total_dataset_rows",
        "average_freight_rate",
        "average_cargo_demand",
        "average_fuel_price",
        "selected_ml_model",
        "mae",
        "rmse",
        "r2_score",
    ]
    for key in required_keys:
        assert key in data, f"Missing required key in summary: {key}"
        assert data[key] is not None, f"Value for {key} is None"

    assert data["total_dataset_rows"] == 10000
    assert data["r2_score"] > 0.90
    print(f"       Status: {response.status_code} | Selected Model: {data['selected_ml_model']} (R2: {data['r2_score']})")


def test_forecast_endpoint():
    print("[TEST] 3. Testing POST /api/forecast...")
    response = client.post("/api/forecast", json=SAMPLE_VOYAGE_PAYLOAD)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    assert "predicted_freight_rate" in data, "Missing predicted_freight_rate"
    assert "currency" in data and data["currency"] == "USD", "Invalid currency"
    assert "unit" in data and data["unit"] == "per metric ton", "Invalid unit"
    assert "model" in data and len(data["model"]) > 0, "Missing model name"

    rate = data["predicted_freight_rate"]
    assert isinstance(rate, (int, float)) and rate > 0, f"Invalid rate: {rate}"
    print(f"       Status: {response.status_code} | Predicted Freight Rate: ${rate:.2f} USD/MT ({data['model']})")


def test_historical_endpoint():
    print("[TEST] 4. Testing GET /api/historical...")
    # Test default query
    res_default = client.get("/api/historical?limit=5")
    assert res_default.status_code == 200
    data_default = res_default.json()
    assert isinstance(data_default, list)
    assert len(data_default) == 5

    # Test filtered query
    res_filter = client.get("/api/historical?vessel_type=Capesize&commodity=Iron%20Ore&limit=3")
    assert res_filter.status_code == 200
    data_filter = res_filter.json()
    assert isinstance(data_filter, list)
    for row in data_filter:
        assert row["vessel_type"] == "Capesize"
        assert row["commodity"] == "Iron Ore"

    print(f"       Status: 200 | Fetched {len(data_filter)} filtered historical records successfully.")


def test_vessels_endpoint():
    print("[TEST] 5. Testing GET /api/vessels...")
    response = client.get("/api/vessels")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()

    assert "total_vessel_types" in data
    assert "vessels" in data and len(data["vessels"]) > 0

    first_vessel = data["vessels"][0]
    for key in ["vessel_type", "count", "avg_dwt", "avg_freight_rate", "common_commodities"]:
        assert key in first_vessel, f"Missing key in vessel stat: {key}"

    print(f"       Status: {response.status_code} | Total Vessel Categories: {data['total_vessel_types']}")


def test_demand_endpoint():
    print("[TEST] 6. Testing GET /api/demand...")
    response = client.get("/api/demand")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()

    assert "trend" in data and len(data["trend"]) > 0
    assert "baseline_index" in data and data["baseline_index"] == 100.0

    sample_point = data["trend"][0]
    for key in ["period", "avg_demand", "min_demand", "max_demand", "record_count"]:
        assert key in sample_point, f"Missing key in demand trend: {key}"

    print(f"       Status: {response.status_code} | Total Monthly Trend Periods: {data['total_periods']}")


def test_chartering_decision_endpoint():
    print("[TEST] 7. Testing POST /api/chartering-decision...")
    response = client.post("/api/chartering-decision", json=SAMPLE_VOYAGE_PAYLOAD)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    expected_keys = [
        "predicted_freight_rate",
        "demand_level",
        "fuel_cost_level",
        "congestion_level",
        "recommendation",
        "explanation",
    ]
    for key in expected_keys:
        assert key in data, f"Missing key in decision response: {key}"

    assert data["demand_level"] in ["Low", "Medium", "High"]
    assert data["fuel_cost_level"] in ["Low", "Medium", "High"]
    assert data["congestion_level"] in ["Low", "Medium", "High"]
    assert len(data["recommendation"]) > 0
    assert len(data["explanation"]) > 0

    print(f"       Status: {response.status_code}")
    print(f"       Demand: {data['demand_level']} | Fuel: {data['fuel_cost_level']} | Congestion: {data['congestion_level']}")
    print(f"       Recommendation: {data['recommendation']}")
    print(f"       Explanation: {data['explanation'][:110]}...")


def test_validation_error_handling():
    print("[TEST] 8. Testing validation error handling (422 Unprocessable Entity)...")
    invalid_payload = SAMPLE_VOYAGE_PAYLOAD.copy()
    invalid_payload["vessel_size"] = -500  # Invalid negative size
    response = client.post("/api/forecast", json=invalid_payload)
    assert response.status_code == 422, f"Expected 422 validation error, got {response.status_code}"
    print("       Status: 422 (Correctly rejected negative vessel_size).")


def run_all_api_tests():
    print("=================================================================")
    print("       FreightAI FastAPI Production Route Test Suite            ")
    print("=================================================================\n")

    test_health_endpoint()
    test_summary_endpoint()
    test_forecast_endpoint()
    test_historical_endpoint()
    test_vessels_endpoint()
    test_demand_endpoint()
    test_chartering_decision_endpoint()
    test_validation_error_handling()

    print("\n=================================================================")
    print("[SUCCESS] All 7 API Endpoints + Validation Tests Passed Perfectly!")
    print("=================================================================")


if __name__ == "__main__":
    run_all_api_tests()
