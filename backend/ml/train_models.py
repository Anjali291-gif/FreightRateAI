"""
Model Training and Comparison Pipeline for FreightAI
Trains and evaluates Linear Regression, Random Forest, and Gradient Boosting models
on processed maritime freight datasets, computes evaluation metrics (MAE, RMSE, R²),
dynamically selects the best performing model, and serializes artifacts using joblib.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def train_and_evaluate_models():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    train_path = os.path.join(base_dir, "data", "processed", "train.csv")
    test_path = os.path.join(base_dir, "data", "processed", "test.csv")
    models_dir = os.path.join(base_dir, "models", "saved_models")
    processed_dir = os.path.join(base_dir, "data", "processed")

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(processed_dir, exist_ok=True)

    print(f"[INFO] Loading datasets...")
    print(f"       Train: {train_path}")
    print(f"       Test:  {test_path}")

    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)

    target_name = "freight_rate"
    drop_cols = ["date", target_name]
    feature_names = [col for col in train_df.columns if col not in drop_cols]

    X_train = train_df[feature_names]
    y_train = train_df[target_name]
    X_test = test_df[feature_names]
    y_test = test_df[target_name]

    print(f"[INFO] Training rows: {len(X_train)}, Testing rows: {len(X_test)}")
    print(f"[INFO] Features count: {len(feature_names)}")

    # Model definitions
    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=100, max_depth=16, random_state=42, n_jobs=-1
        ),
        "Gradient Boosting Regressor": GradientBoostingRegressor(
            n_estimators=120, learning_rate=0.1, max_depth=5, random_state=42
        ),
    }

    results = {}
    saved_paths = {}

    for name, model in candidate_models.items():
        print(f"\n[INFO] Training model: {name}...")
        model.fit(X_train, y_train)

        # Predictions on test set
        y_pred = model.predict(X_test)

        mae = float(round(mean_absolute_error(y_test, y_pred), 4))
        # Compute RMSE cleanly with numpy
        rmse = float(round(np.sqrt(mean_squared_error(y_test, y_pred)), 4))
        r2 = float(round(r2_score(y_test, y_pred), 4))

        results[name] = {
            "MAE": mae,
            "RMSE": rmse,
            "R2": r2,
        }

        # Model file naming
        file_slug = name.lower().replace(" ", "_")
        model_filename = f"{file_slug}.joblib"
        model_filepath = os.path.join(models_dir, model_filename)
        joblib.dump(model, model_filepath)
        saved_paths[name] = model_filepath

        print(f"[METRICS] {name}:")
        print(f"          MAE:  {mae:.4f}")
        print(f"          RMSE: {rmse:.4f}")
        print(f"          R2:   {r2:.4f}")
        print(f"[SAVED] Saved model to: {model_filepath}")

    # Dynamic model selection based on highest R2 score and lowest RMSE
    selected_model_name = max(results.keys(), key=lambda m: (results[m]["R2"], -results[m]["RMSE"]))
    selected_model = candidate_models[selected_model_name]
    best_model_path = os.path.join(models_dir, "best_model.joblib")
    joblib.dump(selected_model, best_model_path)
    print(f"\n[SELECTED] Best Model: '{selected_model_name}' (R2: {results[selected_model_name]['R2']})")
    print(f"[SAVED] Saved best model to: {best_model_path}")

    # 1. Save model_comparison.json
    comparison_file = os.path.join(processed_dir, "model_comparison.json")
    comparison_data = {
        "models": results,
        "selected_model": selected_model_name,
        "selection_criteria": "Highest R2 score and lowest RMSE on test set",
    }
    with open(comparison_file, "w", encoding="utf-8") as f:
        json.dump(comparison_data, f, indent=2)
    print(f"[SAVED] Model comparison saved to: {comparison_file}")

    # 2. Save model_metadata.json
    metadata_file = os.path.join(processed_dir, "model_metadata.json")
    metadata_data = {
        "model_names": list(candidate_models.keys()),
        "MAE": {name: res["MAE"] for name, res in results.items()},
        "RMSE": {name: res["RMSE"] for name, res in results.items()},
        "R2": {name: res["R2"] for name, res in results.items()},
        "selected_model": selected_model_name,
        "selected_model_metrics": results[selected_model_name],
        "training_rows": int(len(X_train)),
        "testing_rows": int(len(X_test)),
        "feature_names": feature_names,
        "target_name": target_name,
    }
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata_data, f, indent=2)
    print(f"[SAVED] Model metadata saved to: {metadata_file}")

    # Print summary
    print("\n" + "=" * 65)
    print(f"{'Model':<30} | {'MAE':<8} | {'RMSE':<8} | {'R2':<8}")
    print("-" * 65)
    for name, metric in results.items():
        prefix = "-> " if name == selected_model_name else "   "
        print(f"{prefix + name:<30} | {metric['MAE']:<8.4f} | {metric['RMSE']:<8.4f} | {metric['R2']:<8.4f}")
    print("=" * 65)
    print(f"Selected Model: {selected_model_name}")

    return results, selected_model_name


if __name__ == "__main__":
    train_and_evaluate_models()
