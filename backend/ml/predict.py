"""
Prediction Engine for FreightAI
Loads the selected trained regression model and provides a reusable prediction function
supporting both raw human-readable maritime inputs and pre-encoded feature matrices.
"""

import json
import os
from typing import Any, Dict, List, Union
import joblib
import numpy as np
import pandas as pd


class FreightPredictor:
    """Wrapper class managing the loaded model, metadata, and feature transformations."""

    def __init__(self, model_path: str = None, metadata_path: str = None):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.models_dir = os.path.join(base_dir, "models", "saved_models")
        self.processed_dir = os.path.join(base_dir, "data", "processed")

        self.model_path = model_path or os.path.join(self.models_dir, "best_model.joblib")
        self.metadata_path = metadata_path or os.path.join(self.processed_dir, "model_metadata.json")

        self._load_artifacts()

    def _load_artifacts(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        if not os.path.exists(self.metadata_path):
            raise FileNotFoundError(f"Metadata file not found: {self.metadata_path}")

        self.model = joblib.load(self.model_path)
        with open(self.metadata_path, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        self.feature_names: List[str] = self.metadata["feature_names"]
        self.selected_model_name: str = self.metadata.get("selected_model", "Unknown")

    def _prepare_features(self, record: Dict[str, Any]) -> pd.DataFrame:
        """Transforms a raw single maritime record into the model's expected feature vector."""
        row_dict = {col: 0.0 for col in self.feature_names}

        # Date handling & temporal feature extraction
        raw_date = record.get("date")
        if raw_date:
            dt = pd.to_datetime(raw_date)
        else:
            dt = pd.Timestamp.now()

        temporal = {
            "year": dt.year,
            "month": dt.month,
            "day_of_week": dt.dayofweek,
            "quarter": dt.quarter,
        }

        # Fill numerical features
        numerical_keys = [
            "vessel_size",
            "distance_nm",
            "fuel_price",
            "cargo_demand",
            "port_congestion",
        ]
        for key in numerical_keys:
            if key in record:
                row_dict[key] = float(record[key])

        for key, val in temporal.items():
            if key in row_dict:
                row_dict[key] = float(val)

        # Fill one-hot categorical features
        categorical_keys = [
            ("vessel_type", "vessel_type_"),
            ("origin", "origin_"),
            ("destination", "destination_"),
            ("commodity", "commodity_"),
            ("weather_condition", "weather_condition_"),
        ]

        for field, prefix in categorical_keys:
            if field in record and record[field] is not None:
                dummy_col = f"{prefix}{record[field]}"
                if dummy_col in row_dict:
                    row_dict[dummy_col] = 1.0

        return pd.DataFrame([row_dict], columns=self.feature_names)

    def predict(self, input_data: Union[Dict[str, Any], List[Dict[str, Any]], pd.DataFrame]) -> Union[float, List[float]]:
        """Makes freight rate predictions for a single record, list of records, or DataFrame."""
        if isinstance(input_data, dict):
            # Check if dict already contains feature columns
            if any(k in self.feature_names for k in input_data.keys()) and "vessel_type" not in input_data:
                df_features = pd.DataFrame([input_data]).reindex(columns=self.feature_names, fill_value=0.0)
            else:
                df_features = self._prepare_features(input_data)
        elif isinstance(input_data, list):
            df_features = pd.concat([self._prepare_features(item) for item in input_data], ignore_index=True)
        elif isinstance(input_data, pd.DataFrame):
            df_features = input_data.reindex(columns=self.feature_names, fill_value=0.0)
        else:
            raise ValueError(f"Unsupported input type: {type(input_data)}")

        predictions = self.model.predict(df_features)

        # Validation: check for NaN or infinite values
        if np.isnan(predictions).any() or np.isinf(predictions).any():
            raise ValueError("Model produced invalid (NaN or Infinite) predictions!")

        # Round to 2 decimal places and ensure positive rate
        cleaned_preds = [round(float(max(5.0, p)), 2) for p in predictions]

        if isinstance(input_data, dict):
            return cleaned_preds[0]
        return cleaned_preds


# Global singleton instance for quick modular usage
_global_predictor = None


def get_predictor() -> FreightPredictor:
    """Returns a singleton instance of the FreightPredictor."""
    global _global_predictor
    if _global_predictor is None:
        _global_predictor = FreightPredictor()
    return _global_predictor


def predict_freight_rate(data: Union[Dict[str, Any], List[Dict[str, Any]], pd.DataFrame]):
    """Convenience function for freight rate prediction."""
    predictor = get_predictor()
    return predictor.predict(data)


if __name__ == "__main__":
    predictor = FreightPredictor()
    print(f"[INFO] Initialized FreightPredictor with model: {predictor.selected_model_name}")
    print(f"[INFO] Expected features: {len(predictor.feature_names)}")
