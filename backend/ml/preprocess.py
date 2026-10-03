"""
Data Preprocessing Pipeline for FreightAI
Loads raw synthetic freight dataset, validates data integrity,
handles missing values and duplicates, encodes categorical features,
scales numerical features, splits into train/test sets, and saves processed outputs.
"""

import json
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def preprocess_pipeline(raw_csv_path: str, output_dir: str):
    """Executes the full data preprocessing workflow."""
    print(f"[INFO] Loading raw dataset from: {raw_csv_path}")
    
    if not os.path.exists(raw_csv_path):
        raise FileNotFoundError(f"Raw dataset not found at {raw_csv_path}")

    # 1. Load Raw CSV
    df = pd.read_csv(raw_csv_path)
    initial_rows = len(df)
    print(f"[INFO] Loaded {initial_rows} rows and {len(df.columns)} columns.")

    # 2. Check Missing Values
    missing_counts = df.isnull().sum().to_dict()
    print("[INFO] Missing values per column:", missing_counts)
    
    # Impute if any missing values present (robustness safeguard)
    for col in df.columns:
        if df[col].isnull().sum() > 0:
            if df[col].dtype in [np.float64, np.int64]:
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna(df[col].mode()[0])

    # 3. Remove Duplicates
    df = df.drop_duplicates().reset_index(drop=True)
    duplicates_removed = initial_rows - len(df)
    print(f"[INFO] Duplicates removed: {duplicates_removed}. Remaining rows: {len(df)}")

    # 4. Feature Engineering from Date
    df["date"] = pd.to_datetime(df["date"])
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day_of_week"] = df["date"].dt.dayofweek
    df["quarter"] = df["date"].dt.quarter

    # Categorical and Numerical column separation
    categorical_cols = ["vessel_type", "origin", "destination", "commodity", "weather_condition"]
    numerical_cols = [
        "vessel_size",
        "distance_nm",
        "fuel_price",
        "cargo_demand",
        "port_congestion",
        "year",
        "month",
        "day_of_week",
        "quarter",
    ]
    target_col = "freight_rate"

    print("[INFO] Categorical features:", categorical_cols)
    print("[INFO] Numerical features:", numerical_cols)
    print("[INFO] Target variable:", target_col)

    # 5. Handle Categorical Variables (One-Hot Encoding with clean prefix)
    df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=False, dtype=int)

    # Convert date back to string for clean CSV serialization
    df_encoded["date"] = df_encoded["date"].dt.strftime("%Y-%m-%d")
    df_clean_unencoded = df.copy()
    df_clean_unencoded["date"] = df_clean_unencoded["date"].dt.strftime("%Y-%m-%d")

    # 6. Train-Test Split (80% train, 20% test)
    train_df, test_df = train_test_split(df_encoded, test_size=0.20, random_state=42, shuffle=True)
    
    # Also create unencoded train/test split for easy interpretation/EDA
    train_unencoded, test_unencoded = train_test_split(df_clean_unencoded, test_size=0.20, random_state=42, shuffle=True)

    os.makedirs(output_dir, exist_ok=True)

    # 7. Save Processed Artifacts
    train_path = os.path.join(output_dir, "train.csv")
    test_path = os.path.join(output_dir, "test.csv")
    unencoded_train_path = os.path.join(output_dir, "train_unencoded.csv")
    unencoded_test_path = os.path.join(output_dir, "test_unencoded.csv")
    full_processed_path = os.path.join(output_dir, "preprocessed_freight_data.csv")

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)
    train_unencoded.to_csv(unencoded_train_path, index=False)
    test_unencoded.to_csv(unencoded_test_path, index=False)
    df_encoded.to_csv(full_processed_path, index=False)

    metadata = {
        "total_records": len(df_encoded),
        "train_records": len(train_df),
        "test_records": len(test_df),
        "categorical_columns": categorical_cols,
        "numerical_columns": numerical_cols,
        "target_column": target_col,
        "encoded_feature_columns": [c for c in df_encoded.columns if c not in ["date", target_col]],
    }

    metadata_path = os.path.join(output_dir, "pipeline_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[SUCCESS] Preprocessing completed successfully.")
    print(f"[INFO] Processed files saved to: {output_dir}")
    print(f"   - {train_path} ({len(train_df)} rows)")
    print(f"   - {test_path} ({len(test_df)} rows)")
    print(f"   - {full_processed_path} ({len(df_encoded)} rows)")
    print(f"   - {metadata_path}")


def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    raw_path = os.path.join(base_dir, "data", "raw", "freight_dataset.csv")
    output_dir = os.path.join(base_dir, "data", "processed")
    preprocess_pipeline(raw_path, output_dir)


if __name__ == "__main__":
    main()
