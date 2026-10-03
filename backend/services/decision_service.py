"""
Chartering Decision Support Engine for FreightAI
Applies transparent, rule-based maritime commercial heuristics to evaluate
predicted freight rates, market cargo demand, bunker fuel prices, and port congestion
to provide actionable chartering guidance.
"""

from typing import Any, Dict


class DecisionService:
    @staticmethod
    def classify_demand(cargo_demand: float) -> str:
        if cargo_demand < 95.0:
            return "Low"
        elif cargo_demand <= 115.0:
            return "Medium"
        return "High"

    @staticmethod
    def classify_fuel(fuel_price: float) -> str:
        if fuel_price < 600.0:
            return "Low"
        elif fuel_price <= 700.0:
            return "Medium"
        return "High"

    @staticmethod
    def classify_congestion(port_congestion: float) -> str:
        if port_congestion < 2.5:
            return "Low"
        elif port_congestion <= 5.0:
            return "Medium"
        return "High"

    def evaluate_chartering_strategy(
        self,
        predicted_freight_rate: float,
        cargo_demand: float,
        fuel_price: float,
        port_congestion: float,
        vessel_type: str = "Vessel",
    ) -> Dict[str, Any]:
        """Generates transparent rule-based chartering recommendations and justifications."""
        demand_tier = self.classify_demand(cargo_demand)
        fuel_tier = self.classify_fuel(fuel_price)
        congestion_tier = self.classify_congestion(port_congestion)

        reasons = []

        # Heuristic 1: Severe congestion priority
        if congestion_tier == "High":
            recommendation = "Lock-in Period Time Charter or Forward Contract with Demurrage Protection"
            reasons.append(
                f"Severe port congestion ({port_congestion:.1f} days waiting time) poses significant demurrage risks."
            )
            if demand_tier == "High":
                reasons.append(
                    f"Surging cargo demand (index: {cargo_demand:.1f}) further tightens regional tonnage supply, favoring long-term fixed charter coverage."
                )
            else:
                reasons.append(
                    f"Contractual demurrage caps and flexible berth assignment clauses are strongly recommended."
                )

        # Heuristic 2: High fuel exposure with subdued/medium demand
        elif fuel_tier == "High" and demand_tier != "High":
            recommendation = "Negotiate Voyage Charter with Bunker Adjustment Factor (BAF) / Eco-Speed Clause"
            reasons.append(
                f"Elevated bunker fuel prices (${fuel_price:.2f}/MT) represent over 50% of voyage operational costs."
            )
            reasons.append(
                f"Moderate market demand (index: {cargo_demand:.1f}) prevents full fuel cost pass-through to cargo owners; incorporate explicit BAF clauses or slow-steaming agreements."
            )

        # Heuristic 3: High demand with favorable port operations
        elif demand_tier == "High":
            recommendation = "Execute Prompt Spot Voyage Charter Before Rate Escalation"
            reasons.append(
                f"Strong cargo demand (index: {cargo_demand:.1f}) indicates upward spot rate momentum across {vessel_type} routes."
            )
            reasons.append(
                f"Manageable port congestion ({port_congestion:.1f} days) and stable bunker costs (${fuel_price:.2f}/MT) support immediate booking."
            )

        # Heuristic 4: Soft demand (Charterer's market)
        elif demand_tier == "Low":
            recommendation = "Short-Term Spot Negotiation / Secure Concessionary Fixture"
            reasons.append(
                f"Subdued cargo demand (index: {cargo_demand:.1f}) tilts commercial bargaining leverage toward charterers."
            )
            reasons.append(
                f"With projected freight rate at ${predicted_freight_rate:.2f}/MT, avoid long-term lockups and negotiate spot discounts."
            )

        # Heuristic 5: Balanced market conditions
        else:
            recommendation = "Balanced Index-Linked Voyage Charter"
            reasons.append(
                f"Market indicators show equilibrium (Demand Index: {cargo_demand:.1f}, Fuel: ${fuel_price:.2f}/MT, Congestion: {port_congestion:.1f} days)."
            )
            reasons.append(
                f"Projected rate of ${predicted_freight_rate:.2f}/MT reflects fair market value; an index-linked fixture distributes rate fluctuation risk equitably."
            )

        disclaimer = " Disclaimer: This recommendation is generated via quantitative decision heuristics for operational decision-support and does not constitute guaranteed commercial or financial advice."
        explanation = " ".join(reasons) + disclaimer

        return {
            "predicted_freight_rate": round(float(predicted_freight_rate), 2),
            "demand_level": demand_tier,
            "fuel_cost_level": fuel_tier,
            "congestion_level": congestion_tier,
            "recommendation": recommendation,
            "explanation": explanation,
        }


# Singleton instance
decision_service = DecisionService()
