"""Strategy decision agent utilities."""

from __future__ import annotations

from typing import Any


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def generate_decision(market_data: dict, risk_data: dict, compliance_data: dict) -> dict:
    """
    Generate a deterministic portfolio decision from market, risk, and compliance inputs.

    Returns decision, allocation, confidence, and reasoning string.
    """
    try:
        trend = str(market_data.get("trend", "")).strip().lower()
        risk_level = str(risk_data.get("risk_level", "")).strip().lower()
        is_compliant = bool(compliance_data.get("is_compliant", False))

        market_confidence = _clamp(_to_float(market_data.get("confidence"), default=0.0))
        volatility = _clamp(_to_float(risk_data.get("volatility"), default=1.0))
        allocation = _clamp(
            _to_float(compliance_data.get("adjusted_allocation"), default=0.0)
        )

        if not is_compliant:
            decision = "REJECT"
        elif trend == "bullish" and risk_level != "high":
            decision = "BUY"
        elif trend == "bearish":
            decision = "SELL"
        else:
            decision = "HOLD"

        confidence = _clamp((market_confidence + (1.0 - volatility)) / 2.0)
        compliance_status = "compliant" if is_compliant else "non-compliant"
        reason = (
            f"Market trend is {trend or 'unknown'}, risk level is {risk_level or 'unknown'}, "
            f"and compliance status is {compliance_status}; decision set to {decision}."
        )

        return {
            "decision": decision,
            "allocation": round(allocation, 4),
            "confidence": round(confidence, 4),
            "reason": reason,
        }
    except Exception:
        return {
            "decision": "REJECT",
            "allocation": 0.0,
            "confidence": 0.0,
            "reason": "Strategy decision generation failed due to invalid input data.",
        }
