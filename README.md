# FreightAI – Intelligent Freight Forecasting & Vessel Chartering System

> **College SIH 2026 Prototype**  
> An end-to-end full-stack artificial intelligence decision-support platform designed for maritime dry bulk and tanker spot freight rate forecasting, fleet capacity optimization, and chartering advisory.

---

## 🌊 1. Problem Statement

Global maritime shipping accounts for over **80% of world trade by volume**. However, charterers, shipowners, and freight traders face severe market challenges:
- **Freight Rate Volatility:** Spot rates fluctuate unpredictably due to geopolitical shifts, seasonality, regional cargo demand imbalances, and seasonal commodity cycles (e.g., iron ore, crude oil, grain).
- **Bunker Fuel Price Swings:** Very Low Sulphur Fuel Oil (VLSFO) and High Sulphur Fuel Oil (HSFO) represent up to **50–60% of vessel voyage operating expenses (OPEX)**.
- **Port Demurrage & Congestion:** Bottlenecks at major discharge ports result in multimillion-dollar demurrage fees and disrupted voyage schedules.
- **Opacity in Chartering Decisions:** Traditional charter fixture negotiations rely on fragmented broker reports and subjective instincts rather than quantitative, data-driven forecasting.

---

## 💡 2. Solution Overview

**FreightAI** bridges maritime economics and machine learning to deliver transparent, actionable intelligence:
1. **Accurate Rate Forecasting:** Machine learning regression models trained on multi-variate shipping parameters to predict freight rates ($/Metric Ton) with high statistical confidence.
2. **Quantitative Chartering Advisor:** A transparent, rule-based heuristic decision engine that pairs spot forecasts with demand elasticity, fuel spreads, and port wait-times to recommend optimal fixture types (e.g., *Spot Voyage Charter*, *Index-Linked Fixture*, *Period Time Charter*, or *Contract of Affreightment (COA)*).
3. **Live Fleet Matching & Directory:** Automated evaluation of 9 global vessel classifications (Capesize, VLCC, Suezmax, Aframax, Panamax, Supramax, Handysize, LNG Carrier, Container) with custom vector visual assets and voyage cost estimators.
4. **Market & Macro Intelligence:** Real-time visibility into Baltic Exchange indices (BCI, BPI, BSI, BHSI) and global bunker spreads across key hubs (Singapore, Rotterdam, Fujairah, Houston).

---

## 🏗️ 3. System Architecture

FreightAI follows a decoupled, production-grade client-server architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 Frontend (Vite)                        │
│  - Tailwind CSS v4 Theme Engine (Adaptive Dark / Pure Light Modes)     │
│  - Recharts Quantitative Visualizations & Baltic Momentum Tracking    │
│  - Web Speech API Voice Command Route Navigation                       │
│  - REST API Client with Defensive Deserialization & SVG Asset Fallbacks│
└────────────────────────────────────▲───────────────────────────────────┘
                                     │ JSON over HTTP (CORS Enabled)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend (Python 3.10+)                  │
│  - /api/health             : System liveness & readiness check         │
│  - /api/summary            : Dataset analytics & model evaluation KPIs │
│  - /api/historical         : Filterable historical spot voyage records │
│  - /api/vessels            : Fleet capacity and freight distribution   │
│  - /api/demand             : Monthly cargo demand progression trend    │
│  - /api/forecast           : Real-time ML inference prediction        │
│  - /api/chartering-decision: Heuristic chartering recommendation engine │
└────────────────────────────────────▲───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────────────┐   ┌──────────────────────────────┐
│       Machine Learning Engine       │   │       Data Repository        │
│  - Scikit-Learn Inference Pipeline  │   │  - 10,000 Synthetic Voyages  │
│  - Gradient Boosting Regressor (Joblib)│ │  - 9 Vessel Classes          │
│  - Preprocessing Feature Encoders   │   │  - 15 Global Trade Corridors │
└─────────────────────────────────────┘   └──────────────────────────────┘
```

---

## 📊 4. Dataset & Preprocessing Pipeline

The underlying dataset comprises **10,000 realistic synthetic maritime voyage transactions** spanning approximately 3 years (2023–2026), generated to model real-world maritime economic correlations:

### Feature Schema:
- `date`: Timestamp covering 36 historical months with seasonality.
- `vessel_type`: 9 classifications (Capesize, VLCC, Suezmax, Aframax, Supramax, Panamax, Handysize, LNG Carrier, Container Post-Panamax).
- `vessel_size`: Deadweight tonnage (DWT) ranging from 30,000 to 320,000 MT.
- `origin` & `destination`: 15 major maritime routes (e.g., Port Hedland → Qingdao, Ras Tanura → Ningbo, Tubarao → Rotterdam).
- `commodity`: 10 key cargo types (Iron Ore, Crude Oil, Thermal Coal, Grain, Bauxite, LNG, Containerized Goods, etc.).
- `distance_nm`: Nautical voyage distance (1,500 to 12,000 nautical miles).
- `fuel_price`: VLSFO bunker benchmark ($450 – $950 / MT).
- `cargo_demand`: Market inquiry demand index (70 – 140 pts, baseline 100).
- `weather_condition`: Voyage weather severity (Calm, Moderate, Rough, Storm).
- `port_congestion`: Demurrage queue duration at destination (0.5 – 10.0 days).
- `freight_rate`: Target spot rate ($/Metric Ton), modeled with OPEX, distance, fuel elasticity, demand pressure, and controlled stochastic noise.

### Data Processing Scripts:
- `backend/ml/generate_dataset.py`: Realistic data generator implementing domain economic relationships.
- `backend/ml/preprocess.py`: Deduplication, missing-value validation, categorical one-hot encoding, feature normalization, and 80/20 train/test split.
- `backend/ml/eda.py`: Automated summary statistics computation (`dataset_summary.json`).

---

## 🤖 5. Machine Learning Models & Results

Three regression architectures were trained and rigorously evaluated using 5-fold cross-validation on unseen test data:

| Model Architecture | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | $R^2$ Score | Selection Status |
|---|:---:|:---:|:---:|:---:|
| **Linear Regression** | \$9.41 / MT | \$11.82 / MT | 86.12% | Baseline |
| **Random Forest Regressor** | \$2.45 / MT | \$3.12 / MT | 98.92% | Evaluated (51 MB) |
| **Gradient Boosting Regressor** | **\$2.03 / MT** | **\$2.55 / MT** | **99.38%** | **Selected Production Model** |

### Why Gradient Boosting Regressor was Selected:
1. **Superior Accuracy:** Achieved the highest test $R^2$ (**99.38%**) and lowest MAE (**\$2.03/t**).
2. **Lightweight Deployment Artifact:** Serializes to only **574 KB** (`best_model.joblib`), ensuring sub-millisecond API inference latency and seamless repository versioning compared to the 51 MB Random Forest model.
3. **Robust Non-linear Handling:** Effectively captures interaction terms between bunker fuel prices, cargo demand elasticity, and weather delays.

---

## 🔌 6. API Endpoints

The backend is built with FastAPI and provides automatic Swagger interactive documentation at `/docs`.

| Method | Endpoint | Description | Input / Parameters |
|---|---|---|---|
| `GET` | `/api/health` | Service liveness and connectivity verification | None |
| `GET` | `/api/summary` | Dataset metadata, mean metrics, and ML evaluation stats | None |
| `GET` | `/api/historical` | Query historical freight rates with filtering | `vessel_type`, `commodity`, `origin`, `destination`, `limit` |
| `GET` | `/api/vessels` | Fleet aggregates across all 9 vessel classes | None |
| `GET` | `/api/demand` | 36-month cargo demand progression index | None |
| `POST` | `/api/forecast` | Real-time freight rate prediction via ML model | 11-field voyage parameter JSON payload |
| `POST` | `/api/chartering-decision` | Rule-based chartering advisory and rationale | 11-field voyage parameter JSON payload |

---

## 💻 7. Frontend Features

- **Executive Dashboard:** Live KPI stat cards streaming directly from `/api/summary`, multi-series ComposedChart for historical rate trends, and monthly demand progression AreaChart.
- **Forecasting Studio:** Interactive parameter form allowing users to select trade corridors, vessel classes, commodities, and bunker prices to query the live `Gradient Boosting Regressor`.
- **Fleet Selection Directory:** Filterable vessel directory with table and grid views, complete with dedicated custom vector SVG illustrations for all 9 vessel classes and booking fixture confirmation modals.
- **AI Decision Support:** Commercial chartering advisor recommending specific charter types (Voyage, Period Time Charter, Index-Linked, COA) based on market signal tier analysis.
- **Market Indices & Energy Intelligence:** Real-time Baltic Exchange sub-indices (BCI, BPI, BSI, BHSI) and VLSFO/HSFO bunker fuel spread tracking across Singapore, Rotterdam, Fujairah, and Houston.
- **Executive Dossiers & Reports:** Filterable intelligence reports with ad-hoc report generator, printable dossier summaries, and CSV data export.
- **Adaptive Dark / Light Theme:** Native Tailwind CSS v4 `@custom-variant dark` styling providing deep navy/slate in dark mode and clean white in light mode.
- **Voice Navigation:** Web Speech API integration supporting hands-free voice commands (e.g., *"Forecast"*, *"Dashboard"*, *"Vessels"*, *"Dark Mode"*, *"Light Mode"*).

---

## 🛠️ 8. How to Run the Project

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Start the FastAPI Backend
```bash
# Navigate to backend directory
cd FreightAI/backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server (runs on port 8000)
python main.py
```
- API will be accessible at: `http://localhost:8000`
- Swagger UI documentation: `http://localhost:8000/docs`

### Step 2: Start the React Frontend
```bash
# Open a new terminal and navigate to frontend directory
cd FreightAI/frontend

# Install dependencies
npm install

# Start Vite development server (runs on port 5173)
npm run dev
```
- Web Application will be live at: `http://localhost:5173`

### Step 3: Run Verification & Tests
```bash
# Verify backend E2E integration
python backend/test_e2e.py

# Test backend with pytest / TestClient
python -m pytest backend/test_api.py

# Build frontend production bundle
cd frontend && npm run build
```

---

## 👥 9. Team Contributions

Developed as a college submission for **Smart India Hackathon (SIH) 2026**:
- **Dataset Engineering & Synthetic Generator:** Design of maritime economics data model, correlation logic, and data validation scripts (`generate_dataset.py`, `preprocess.py`).
- **Machine Learning & Model Benchmarking:** Implementation of regression algorithms, evaluation pipeline, and serialized inference wrapper (`train_models.py`, `predict.py`).
- **Backend API Engineering:** FastAPI modular route architecture, Pydantic schemas, and rule-based chartering heuristic engine (`routes/`, `services/`).
- **Frontend Architecture & UI/UX:** React 19 application, Recharts data visualizers, dark/light theme system, voice command integration, and custom maritime SVG visual assets.
- **Pair Programming & Development Assistance:** Developed collaboratively with Google DeepMind's Antigravity AI coding assistant.

---

## ⚖️ 10. Academic & Synthetic Data Disclaimer

> **Important Notice:**  
> This project is a college prototype developed for research, simulation, and academic demonstration under SIH 2026.  
> 1. All historical freight rates, vessel voyages, and port congestion metrics were synthetically generated using maritime domain rules.  
> 2. The chartering recommendations produced by the AI Decision Support module are generated through rule-based quantitative heuristics for operational decision-support only.  
> 3. Nothing in this application constitutes binding financial, legal, investment, or commercial advice.
