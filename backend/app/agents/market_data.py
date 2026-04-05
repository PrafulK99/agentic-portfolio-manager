"""Shared market data helpers for agent modules."""

from __future__ import annotations

from typing import Any

import yfinance as yf


def validate_symbol(symbol: str) -> str:
    cleaned_symbol = symbol.strip().upper()
    if not cleaned_symbol:
        raise ValueError("Stock symbol is required.")
    return cleaned_symbol


def fetch_stock_history(symbol: str, period: str = "30d", interval: str = "1d") -> tuple[str, Any]:
    validated_symbol = validate_symbol(symbol)
    try:
        history = yf.Ticker(validated_symbol).history(period=period, interval=interval)
    except Exception as exc:  # pragma: no cover - depends on external service
        raise RuntimeError("Failed to fetch stock data from yfinance.") from exc

    if history.empty or "Close" not in history:
        raise ValueError(f"No market data found for symbol '{validated_symbol}'.")

    return validated_symbol, history


def extract_close_prices(history: Any, symbol: str) -> Any:
    close_prices = history["Close"].dropna()
    if close_prices.empty:
        raise ValueError(f"No closing price data found for symbol '{symbol}'.")
    return close_prices
