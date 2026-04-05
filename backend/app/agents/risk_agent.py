"""Risk analysis agent utilities."""

from __future__ import annotations

from typing import Any, Literal

from app.agents.market_data import extract_close_prices, fetch_stock_history, validate_symbol


def _classify_risk(volatility: float) -> tuple[Literal["low", "medium", "high"], float]:
    if volatility < 0.01:
        return "low", 0.3
    if volatility <= 0.02:
        return "medium", 0.2
    return "high", 0.1


def analyze_risk(symbol: str, history: Any | None = None) -> dict[str, Any]:
    """
    Analyze stock risk using 30-day daily return volatility.

    Returns symbol, volatility, risk level, and suggested allocation.
    """
    validated_symbol = validate_symbol(symbol)
    if history is None:
        _, history = fetch_stock_history(validated_symbol)

    close_prices = extract_close_prices(history, validated_symbol)

    returns = close_prices.pct_change().dropna()
    if returns.empty:
        raise ValueError(
            f"Insufficient data to calculate returns for symbol '{validated_symbol}'."
        )

    volatility = float(returns.std())
    if volatility != volatility:  # NaN check
        raise ValueError(f"Unable to compute volatility for symbol '{validated_symbol}'.")

    risk_level, suggested_allocation = _classify_risk(volatility)

    return {
        "symbol": validated_symbol,
        "volatility": round(volatility, 6),
        "risk_level": risk_level,
        "suggested_allocation": suggested_allocation,
    }
