"""
Test script for FreightAI ML Prediction Engine
Loads the selected model, tests inference on realistic maritime scenarios,
and verifies predictions are valid, finite, and non-NaN.
"""

import math
from predict import FreightPredictor


def run_prediction_tests():
    print("[INFO] Initializing FreightPredictor for validation testing...")
    predictor = FreightPredictor()
    print(f"[INFO] Successfully loaded model: {predictor.selected_model_name}")

    # 4 distinct realistic maritime scenarios
    test_cases = [
        {
            "scenario": "Scenario 1: Capesize Bulk Carrier (Iron Ore, Australia to China)",
            "data": {
                "date": "2026-10-15",
                "vessel_type": "Capesize",
                "vessel_size": 185000,
                "origin": "Port Hedland",
                "destination": "Qingdao",
                "commodity": "Iron Ore",
                "distance_nm": 3650.0,
                "fuel_price": 625.0,
                "cargo_demand": 105.0,
                "weather_condition": "Calm",
                "port_congestion": 2.0,
            },
        },
        {
            "scenario": "Scenario 2: VLCC Supertanker (Crude Oil, Middle East to Singapore)",
            "data": {
                "date": "2026-11-05",
                "vessel_type": "VLCC",
                "vessel_size": 305000,
                "origin": "Ras Tanura",
                "destination": "Singapore",
                "commodity": "Crude Oil",
                "distance_nm": 3720.0,
                "fuel_price": 680.0,
                "cargo_demand": 118.0,
                "weather_condition": "Moderate",
                "port_congestion": 3.5,
            },
        },
        {
            "scenario": "Scenario 3: Container Vessel (High Congestion & Adverse Weather, Trans-Pacific)",
            "data": {
                "date": "2026-12-01",
                "vessel_type": "Container Post-Panamax",
                "vessel_size": 110000,
                "origin": "Shanghai",
                "destination": "Los Angeles",
                "commodity": "Containerized Freight",
                "distance_nm": 5700.0,
                "fuel_price": 660.0,
                "cargo_demand": 125.0,
                "weather_condition": "Stormy",
                "port_congestion": 7.0,
            },
        },
        {
            "scenario": "Scenario 4: Panamax Grain Carrier (South America to Europe)",
            "data": {
                "date": "2026-10-25",
                "vessel_type": "Panamax",
                "vessel_size": 76000,
                "origin": "Santos",
                "destination": "Rotterdam",
                "commodity": "Grain",
                "distance_nm": 5450.0,
                "fuel_price": 635.0,
                "cargo_demand": 98.0,
                "weather_condition": "Rough Sea",
                "port_congestion": 3.8,
            },
        },
    ]

    print(f"\n[INFO] Running inference on {len(test_cases)} sample scenarios:\n")

    for i, test_case in enumerate(test_cases, 1):
        payload = test_case["data"]
        prediction = predictor.predict(payload)

        # Assertions
        assert prediction is not None, f"Prediction for scenario {i} is None"
        assert not math.isnan(prediction), f"Prediction for scenario {i} is NaN"
        assert not math.isinf(prediction), f"Prediction for scenario {i} is Infinite"
        assert prediction > 0, f"Prediction for scenario {i} is non-positive: {prediction}"

        print(f"--- {test_case['scenario']} ---")
        print(f"    Origin -> Destination: {payload['origin']} -> {payload['destination']} ({payload['distance_nm']} nm)")
        print(f"    Vessel: {payload['vessel_type']} ({payload['vessel_size']} DWT) | Cargo: {payload['commodity']}")
        print(f"    Fuel: ${payload['fuel_price']}/MT | Demand Index: {payload['cargo_demand']} | Congestion: {payload['port_congestion']} days | Weather: {payload['weather_condition']}")
        print(f"    [PREDICTION] Estimated Freight Rate: ${prediction:.2f} / Metric Ton\n")

    print("[SUCCESS] All prediction tests completed successfully with valid, finite numerical results!")


if __name__ == "__main__":
    run_prediction_tests()
