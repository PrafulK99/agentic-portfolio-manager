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


def _build_trend_factor(short_ma: float, long_ma: float) -> str:
    if short_ma > long_ma:
        return "Market trend is bullish (short MA > long MA)"
    if short_ma < long_ma:
        return "Market trend is bearish (short MA < long MA)"
    return "Market trend is neutral (short MA = long MA)"


def _build_volatility_factor(risk_level: str) -> str:
    if risk_level == "low":
        return "Volatility is low"
    if risk_level == "medium":
        return "Volatility is moderate"
    if risk_level == "high":
        return "Volatility is high"
    return "Volatility is unknown"


def _build_compliance_factor(is_compliant: bool, violations: list[str]) -> str:
    if is_compliant:
        return "No compliance violations"
    if violations:
        return f"Compliance violations detected: {', '.join(violations)}"
    return "Compliance violations detected"


def _build_summary(decision: str) -> str:
    if decision == "BUY":
        return "AI recommends BUY based on positive trend and acceptable risk."
    if decision == "SELL":
        return "AI recommends SELL based on negative trend and elevated downside risk."
    if decision == "HOLD":
        return "AI recommends HOLD due to mixed trend and risk signals."
    return "AI recommends REJECT due to compliance constraints."


def generate_decision(market_data: dict, risk_data: dict, compliance_data: dict) -> dict:
    """
    Generate a deterministic portfolio decision from market, risk, and compliance inputs.

    Returns decision, allocation, confidence, and structured explanation.
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
        short_ma = _to_float(market_data.get("short_ma"), default=0.0)
        long_ma = _to_float(market_data.get("long_ma"), default=0.0)
        violations = compliance_data.get("violations", [])
        if not isinstance(violations, list):
            violations = []

        if not is_compliant:
            decision = "REJECT"
        elif trend == "bullish" and risk_level != "high":
            decision = "BUY"
        elif trend == "bearish":
            decision = "SELL"
        else:
            decision = "HOLD"

        confidence = _clamp((market_confidence + (1.0 - volatility)) / 2.0)
        explanation = {
            "summary": _build_summary(decision),
            "factors": [
                _build_trend_factor(short_ma=short_ma, long_ma=long_ma),
                _build_volatility_factor(risk_level=risk_level),
                _build_compliance_factor(is_compliant=is_compliant, violations=violations),
            ],
            "confidence": round(confidence, 4),
        }

        return {
            "decision": decision,
            "allocation": round(allocation, 4),
            "confidence": round(confidence, 4),
            "explanation": explanation,
        }
    except Exception:
        return {
            "decision": "REJECT",
            "allocation": 0.0,
            "confidence": 0.0,
            "explanation": {
                "summary": "AI recommends REJECT due to invalid input data.",
                "factors": [
                    "Market trend is unknown",
                    "Volatility is unknown",
                    "Compliance could not be validated",
                ],
                "confidence": 0.0,
            },
        }
