"""
Synthetic Maritime Freight Dataset Generator for FreightAI
Generates a realistic 10,000-row maritime freight market dataset covering 3 years
with realistic non-linear relationships between fuel price, demand, distance,
vessel types, port congestion, weather conditions, and freight rates.
"""

import os
import random
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

# Set deterministic random seed for reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

TOTAL_ROWS = 10000

# Canonical Maritime Trading Routes with baseline nautical mile distances
ROUTES = [
    {"origin": "Port Hedland", "destination": "Qingdao", "base_nm": 3650, "dominant_types": ["Capesize"], "commodities": ["Iron Ore"]},
    {"origin": "Tubarao", "destination": "Qingdao", "base_nm": 11200, "dominant_types": ["Capesize", "Panamax"], "commodities": ["Iron Ore", "Bauxite"]},
    {"origin": "Santos", "destination": "Rotterdam", "base_nm": 5450, "dominant_types": ["Panamax", "Supramax"], "commodities": ["Grain", "Bauxite"]},
    {"origin": "Ras Tanura", "destination": "Singapore", "base_nm": 3720, "dominant_types": ["VLCC", "Suezmax"], "commodities": ["Crude Oil"]},
    {"origin": "Ras Tanura", "destination": "Qingdao", "base_nm": 6250, "dominant_types": ["VLCC", "Suezmax"], "commodities": ["Crude Oil"]},
    {"origin": "Houston", "destination": "Rotterdam", "base_nm": 4850, "dominant_types": ["Aframax", "Suezmax", "Supramax"], "commodities": ["Crude Oil", "Refined Petroleum", "Chemicals"]},
    {"origin": "Shanghai", "destination": "Los Angeles", "base_nm": 5700, "dominant_types": ["Container Post-Panamax"], "commodities": ["Containerized Freight"]},
    {"origin": "Ningbo", "destination": "Hamburg", "base_nm": 10500, "dominant_types": ["Container Post-Panamax"], "commodities": ["Containerized Freight"]},
    {"origin": "Ras Laffan", "destination": "Tokyo", "base_nm": 6550, "dominant_types": ["LNG Carrier"], "commodities": ["LNG"]},
    {"origin": "Newcastle", "destination": "Mumbai", "base_nm": 5900, "dominant_types": ["Capesize", "Panamax"], "commodities": ["Thermal Coal"]},
    {"origin": "Richards Bay", "destination": "Rotterdam", "base_nm": 7100, "dominant_types": ["Capesize", "Panamax"], "commodities": ["Thermal Coal"]},
    {"origin": "Dampier", "destination": "Yokohama", "base_nm": 3950, "dominant_types": ["Capesize", "LNG Carrier"], "commodities": ["Iron Ore", "LNG"]},
    {"origin": "Corpus Christi", "destination": "Antwerp", "base_nm": 4920, "dominant_types": ["Aframax", "Suezmax"], "commodities": ["Crude Oil", "Refined Petroleum"]},
    {"origin": "Singapore", "destination": "Dubai", "base_nm": 3400, "dominant_types": ["Handysize", "Supramax", "Container Post-Panamax"], "commodities": ["Steel Coils", "Chemicals", "Containerized Freight"]},
    {"origin": "Santos", "destination": "Qingdao", "base_nm": 11800, "dominant_types": ["Panamax", "Capesize"], "commodities": ["Grain", "Iron Ore"]},
]

# Vessel Specifications: DWT range, base rate ($/ton), and sensitivity factors
VESSEL_SPECS = {
    "Capesize": {"dwt_min": 160000, "dwt_max": 210000, "base_cost_per_ton": 12.0, "fuel_sens": 0.022},
    "Panamax": {"dwt_min": 65000, "dwt_max": 85000, "base_cost_per_ton": 22.0, "fuel_sens": 0.035},
    "Supramax": {"dwt_min": 50000, "dwt_max": 65000, "base_cost_per_ton": 28.0, "fuel_sens": 0.042},
    "Handysize": {"dwt_min": 25000, "dwt_max": 40000, "base_cost_per_ton": 36.0, "fuel_sens": 0.050},
    "VLCC": {"dwt_min": 280000, "dwt_max": 320000, "base_cost_per_ton": 14.0, "fuel_sens": 0.025},
    "Suezmax": {"dwt_min": 130000, "dwt_max": 165000, "base_cost_per_ton": 20.0, "fuel_sens": 0.032},
    "Aframax": {"dwt_min": 80000, "dwt_max": 120000, "base_cost_per_ton": 26.0, "fuel_sens": 0.038},
    "Container Post-Panamax": {"dwt_min": 80000, "dwt_max": 135000, "base_cost_per_ton": 45.0, "fuel_sens": 0.045},
    "LNG Carrier": {"dwt_min": 70000, "dwt_max": 95000, "base_cost_per_ton": 50.0, "fuel_sens": 0.040},
}

WEATHER_CONDITIONS = ["Calm", "Moderate", "Rough Sea", "Stormy", "Monsoon/Tropical Cyclone"]
WEATHER_PROBS = [0.45, 0.32, 0.14, 0.06, 0.03]
WEATHER_IMPACT_MULTIPLIER = {
    "Calm": 1.00,
    "Moderate": 1.03,
    "Rough Sea": 1.09,
    "Stormy": 1.18,
    "Monsoon/Tropical Cyclone": 1.25,
}


def generate_synthetic_freight_data(num_records: int = TOTAL_ROWS) -> pd.DataFrame:
    """Generates synthetic freight rate records with realistic maritime economic correlations."""
    
    end_date = datetime(2026, 10, 1)
    start_date = end_date - timedelta(days=3 * 365)
    total_days = (end_date - start_date).days

    # Random timestamps across the 3-year timeline
    random_days = np.random.randint(0, total_days, size=num_records)
    dates = [start_date + timedelta(days=int(d)) for d in random_days]

    records = []

    for dt in dates:
        # Route selection
        route = random.choice(ROUTES)
        origin = route["origin"]
        destination = route["destination"]
        
        # Route distance with slight route deviation / navigational adjustments (±3%)
        dist_nm = round(route["base_nm"] * np.random.uniform(0.97, 1.03), 1)
        
        # Vessel type and commodity matched to the route profile
        vessel_type = random.choice(route["dominant_types"])
        commodity = random.choice(route["commodities"])
        
        spec = VESSEL_SPECS[vessel_type]
        vessel_size = int(np.random.randint(spec["dwt_min"], spec["dwt_max"]))

        # Global fuel price (VLSFO in $/MT) with macro cyclical wave + daily volatility
        # Base trend centered around $640/MT with ±$100 macroeconomic cycle and random shocks
        day_ratio = (dt - start_date).days / total_days
        macro_oil_cycle = 640 + 75 * np.sin(2 * np.pi * day_ratio * 1.5)
        fuel_price = round(float(macro_oil_cycle + np.random.normal(0, 22)), 2)
        fuel_price = max(450.0, min(850.0, fuel_price))

        # Cargo Demand Index (70 to 140, baseline 100), with seasonal peak in Q3/Q4
        month = dt.month
        seasonality = 8.0 if month in [9, 10, 11] else (-5.0 if month in [1, 2] else 0.0)
        cargo_demand = round(float(100.0 + seasonality + np.random.normal(0, 10)), 2)
        cargo_demand = max(65.0, min(145.0, cargo_demand))

        # Weather Condition
        weather = np.random.choice(WEATHER_CONDITIONS, p=WEATHER_PROBS)

        # Port Congestion (waiting time in days, 0.5 to 16.0 days)
        # Port congestion correlates with higher cargo demand and specific high-traffic hubs
        hub_multiplier = 1.3 if destination in ["Qingdao", "Shanghai", "Rotterdam", "Los Angeles"] else 1.0
        base_congestion = np.random.exponential(scale=2.8) * hub_multiplier
        if cargo_demand > 115:
            base_congestion += 2.0
        if weather in ["Stormy", "Monsoon/Tropical Cyclone"]:
            base_congestion += 1.5
        port_congestion = round(float(max(0.5, min(18.0, base_congestion))), 1)

        # --- FREIGHT RATE CALCULATION ($/Metric Ton) ---
        # 1. Base rate governed by vessel economies of scale & type
        base_rate = spec["base_cost_per_ton"]
        
        # 2. Distance component ($/ton proportional to voyage length)
        # Larger ships have lower incremental cost per nm
        dist_factor = (dist_nm / 1000.0) * (spec["base_cost_per_ton"] * 0.16)
        
        # 3. Fuel price influence: Bunker is 40-50% of voyage cost
        # Deviation from benchmark $600/MT scaled by vessel fuel sensitivity
        fuel_diff = (fuel_price - 600.0) * spec["fuel_sens"]
        
        # 4. Demand pressure: High demand tightens charter availability exponentially
        demand_factor = (cargo_demand - 100.0) * 0.22
        
        # 5. Port Congestion premium: Demurrage costs and vessel availability lockup
        congestion_fee = port_congestion * 0.95
        
        # 6. Weather risk premium
        weather_mult = WEATHER_IMPACT_MULTIPLIER[weather]
        
        # 7. Vessel size fine-tuning (slight economy of scale within the class)
        size_discount = (vessel_size - spec["dwt_min"]) / (spec["dwt_max"] - spec["dwt_min"]) * -1.5
        
        # 8. Uncorrelated real-world market noise (Gaussian error)
        noise = np.random.normal(0, 2.2)

        # Combined freight rate ($/MT)
        raw_rate = (base_rate + dist_factor + fuel_diff + demand_factor + congestion_fee + size_discount) * weather_mult + noise
        
        # Guardrail freight rate to realistic maritime floor
        freight_rate = round(float(max(8.5, raw_rate)), 2)

        records.append({
            "date": dt.strftime("%Y-%m-%d"),
            "vessel_type": vessel_type,
            "vessel_size": vessel_size,
            "origin": origin,
            "destination": destination,
            "commodity": commodity,
            "distance_nm": dist_nm,
            "fuel_price": fuel_price,
            "cargo_demand": cargo_demand,
            "freight_rate": freight_rate,
            "weather_condition": weather,
            "port_congestion": port_congestion,
        })

    df = pd.DataFrame(records)
    # Sort chronologically by date
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(by="date").reset_index(drop=True)
    df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    
    return df


def main():
    print("[FreightAI] Generating synthetic maritime freight dataset...")
    df = generate_synthetic_freight_data(TOTAL_ROWS)

    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw"))
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "freight_dataset.csv")

    df.to_csv(output_path, index=False)
    print(f"[SUCCESS] Generated dataset successfully saved to: {output_path}")
    print(f"[INFO] Total Rows: {len(df)}, Total Columns: {len(df.columns)}")
    print("[INFO] Columns:", list(df.columns))
    print("\nSample records:")
    print(df.head(3))


if __name__ == "__main__":
    main()
