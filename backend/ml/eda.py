"""
Exploratory Data Analysis (EDA) Script for FreightAI
Calculates summary statistics, distribution metrics, and correlations
for the maritime freight dataset and saves to data/processed/dataset_summary.json.
"""

import json
import os
import pandas as pd


def generate_eda_summary(csv_path: str, output_json_path: str) -> dict:
    """Computes essential descriptive statistics and correlation matrix for the dataset."""
    print(f"[INFO] Analyzing dataset from: {csv_path}")

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset file not found at: {csv_path}")

    df = pd.read_csv(csv_path)

    # Core required metrics
    num_rows = int(len(df))
    num_cols = int(len(df.columns))
    missing_values = {col: int(count) for col, count in df.isnull().sum().items()}

    avg_freight_rate = round(float(df["freight_rate"].mean()), 2)
    min_freight_rate = round(float(df["freight_rate"].min()), 2)
    max_freight_rate = round(float(df["freight_rate"].max()), 2)

    avg_cargo_demand = round(float(df["cargo_demand"].mean()), 2)
    avg_fuel_price = round(float(df["fuel_price"].mean()), 2)

    # Numerical columns for correlation analysis
    num_cols_list = df.select_dtypes(include=["number"]).columns.tolist()
    correlation_df = df[num_cols_list].corr().round(4)
    correlation_matrix = correlation_df.to_dict()

    summary = {
        "dataset_name": "FreightAI Synthetic Maritime Freight Dataset",
        "number_of_rows": num_rows,
        "number_of_columns": num_cols,
        "columns": list(df.columns),
        "missing_values": missing_values,
        "total_missing_values": int(sum(missing_values.values())),
        "average_freight_rate": avg_freight_rate,
        "minimum_freight_rate": min_freight_rate,
        "maximum_freight_rate": max_freight_rate,
        "average_cargo_demand": avg_cargo_demand,
        "average_fuel_price": avg_fuel_price,
        "correlation_between_numerical_variables": correlation_matrix,
        "additional_statistics": {
            "freight_rate_std": round(float(df["freight_rate"].std()), 2),
            "distance_nm_mean": round(float(df["distance_nm"].mean()), 2),
            "port_congestion_mean_days": round(float(df["port_congestion"].mean()), 2),
            "vessel_types_count": int(df["vessel_type"].nunique()),
            "commodities_count": int(df["commodity"].nunique()),
            "routes_count": int(df[["origin", "destination"]].drop_duplicates().shape[0]),
        }
    }

    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"[SUCCESS] Summary statistics successfully exported to: {output_json_path}")
    print(f"[INFO] Summary Overview:")
    print(f"   * Rows: {num_rows}")
    print(f"   * Columns: {num_cols}")
    print(f"   * Missing Values: {summary['total_missing_values']}")
    print(f"   * Avg Freight Rate: ${avg_freight_rate} / ton (Min: ${min_freight_rate}, Max: ${max_freight_rate})")
    print(f"   * Avg Cargo Demand Index: {avg_cargo_demand}")
    print(f"   * Avg Fuel Price: ${avg_fuel_price} / MT")

    return summary


def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    raw_path = os.path.join(base_dir, "data", "raw", "freight_dataset.csv")
    output_json = os.path.join(base_dir, "data", "processed", "dataset_summary.json")
    generate_eda_summary(raw_path, output_json)


if __name__ == "__main__":
    main()
