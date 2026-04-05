"""Compliance checks for allocation and investment constraints."""

from __future__ import annotations

from typing import Any

MAX_ALLOCATION_PER_STOCK = 0.3
HIGH_RISK_MAX_ALLOCATION = 0.15
MIN_INVESTMENT_AMOUNT = 100.0


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def check_compliance(risk_data: dict, amount: float) -> dict:
    """
    Validate allocation and investment amount against compliance rules.

    Always returns a structured dictionary with compliance outcome.
    """
    try:
        violations: list[str] = []
        risk_level = str(risk_data.get("risk_level", "")).strip().lower()
        suggested_allocation = _to_float(risk_data.get("suggested_allocation"), default=0.0)
        investment_amount = _to_float(amount, default=0.0)

        allowed_max = MAX_ALLOCATION_PER_STOCK
        if risk_level == "high":
            allowed_max = HIGH_RISK_MAX_ALLOCATION
            if suggested_allocation > allowed_max:
                violations.append("High risk asset restricted")

        adjusted_allocation = max(0.0, min(suggested_allocation, allowed_max))

        if suggested_allocation > allowed_max:
            violations.append("Allocation exceeds max limit")

        if investment_amount < MIN_INVESTMENT_AMOUNT:
            violations.append("Investment amount too low")

        is_compliant = len(violations) == 0
        notes = (
            "Portfolio input is compliant with current allocation and investment rules."
            if is_compliant
            else "Compliance checks found one or more rule violations; allocation adjusted where needed."
        )

        return {
            "is_compliant": is_compliant,
            "adjusted_allocation": round(adjusted_allocation, 4),
            "violations": violations,
            "notes": notes,
        }
    except Exception:
        return {
            "is_compliant": False,
            "adjusted_allocation": 0.0,
            "violations": ["Compliance processing error"],
            "notes": "Compliance check failed due to invalid input data.",
        }
