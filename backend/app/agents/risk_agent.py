"""Risk analysis agent utilities."""

from __future__ import annotations

from typing import Any, Literal

from app.services.market_data_service import (
    extract_close_prices,
    validate_symbol,
)


def _classify_risk(volatility: float) -> tuple[Literal["low", "medium", "high"], float]:
    if volatility < 0.01:
        return "low", 0.3
    if volatility <= 0.02:
        return "medium", 0.2
    return "high", 0.1


def analyze_risk(symbol: str, history: Any) -> dict[str, Any]:
    """
    Analyze stock risk using 30-day daily return volatility.

    This agent expects pre-fetched stock data. It does NOT fetch data from yfinance.
    Data must be fetched at the API layer and passed to this agent.

    Args:
        symbol: Stock ticker symbol (will be validated)
        history: Pre-fetched pandas DataFrame with OHLCV data (required, not optional)

    Returns:
        Dictionary with symbol, volatility, risk level, and suggested allocation.

    Raises:
        ValueError: If data validation fails or insufficient data for analysis
    """
    validated_symbol = validate_symbol(symbol)
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
