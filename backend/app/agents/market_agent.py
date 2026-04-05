"""Market analysis agent utilities."""

from __future__ import annotations

from typing import Any

import yfinance as yf


def _validate_symbol(symbol: str) -> str:
    cleaned_symbol = symbol.strip().upper()
    if not cleaned_symbol:
        raise ValueError("Stock symbol is required.")
    return cleaned_symbol


def _calculate_confidence(short_ma: float, long_ma: float) -> float:
    if long_ma == 0:
        return 0.0
    confidence = abs(short_ma - long_ma) / abs(long_ma)
    return max(0.0, min(1.0, confidence))


def analyze_stock(symbol: str) -> dict[str, Any]:
    """
    Analyze a stock using recent price history and moving averages.

    Returns a dictionary with symbol, latest close price, 7-day MA,
    21-day MA, trend direction, and confidence score.
    """
    validated_symbol = _validate_symbol(symbol)

    try:
        history = yf.Ticker(validated_symbol).history(period="30d", interval="1d")
    except Exception as exc:  # pragma: no cover - depends on external service
        raise RuntimeError("Failed to fetch stock data from yfinance.") from exc

    if history.empty or "Close" not in history:
        raise ValueError(f"No market data found for symbol '{validated_symbol}'.")

    close_prices = history["Close"].dropna()
    if close_prices.empty:
        raise ValueError(f"No closing price data found for symbol '{validated_symbol}'.")

    if len(close_prices) < 21:
        raise ValueError(
            f"Insufficient data for symbol '{validated_symbol}'. Need at least 21 trading days."
        )

    current_price = float(close_prices.iloc[-1])
    short_ma = float(close_prices.rolling(window=7).mean().iloc[-1])
    long_ma = float(close_prices.rolling(window=21).mean().iloc[-1])

    if any(value != value for value in (short_ma, long_ma)):  # NaN check
        raise ValueError(f"Unable to compute moving averages for symbol '{validated_symbol}'.")

    trend = "bullish" if short_ma > long_ma else "bearish"
    confidence = _calculate_confidence(short_ma=short_ma, long_ma=long_ma)

    return {
        "symbol": validated_symbol,
        "current_price": round(current_price, 4),
        "short_ma": round(short_ma, 4),
        "long_ma": round(long_ma, 4),
        "trend": trend,
        "confidence": round(confidence, 4),
    }
