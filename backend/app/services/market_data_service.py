"""Market data service for fetching and processing stock information.

This is a data service layer that handles retrieval and transformation of
market data. It contains NO decision logic - only data fetching and processing.
"""

from __future__ import annotations

from typing import Any

import yfinance as yf


def validate_symbol(symbol: str) -> str:
    """
    Validate and normalize a stock ticker symbol.

    Args:
        symbol: Raw stock ticker symbol

    Returns:
        Normalized symbol (uppercase, trimmed)

    Raises:
        ValueError: If symbol is empty or invalid
    """
    cleaned_symbol = symbol.strip().upper()
    if not cleaned_symbol:
        raise ValueError("Stock symbol is required.")
    return cleaned_symbol


def get_stock_data(
    symbol: str, period: str = "30d", interval: str = "1d"
) -> tuple[str, Any]:
    """
    Fetch historical stock data from yfinance.

    This function retrieves OHLCV (Open, High, Low, Close, Volume) data
    for the specified symbol and time period. Returns the validated symbol
    and pandas DataFrame with historical data.

    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL')
        period: Time period for historical data (default: '30d')
        interval: Data interval (default: '1d' for daily)

    Returns:
        Tuple of (validated_symbol, history_dataframe)

    Raises:
        ValueError: If no data found for symbol
        RuntimeError: If API call fails
    """
    validated_symbol = validate_symbol(symbol)
    try:
        history = yf.Ticker(validated_symbol).history(period=period, interval=interval)
    except Exception as exc:  # pragma: no cover - depends on external service
        raise RuntimeError("Failed to fetch stock data from yfinance.") from exc

    if history.empty or "Close" not in history:
        raise ValueError(f"No market data found for symbol '{validated_symbol}'.")

    return validated_symbol, history


def get_current_price(symbol: str) -> float:
    """
    Get the current price for a stock symbol.

    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL')

    Returns:
        Current close price as float

    Raises:
        ValueError: If no data found
        RuntimeError: If API call fails
    """
    validated_symbol, history = get_stock_data(symbol, period="5d", interval="1d")
    close_prices = _extract_close_prices(history, validated_symbol)
    return float(close_prices.iloc[-1])


def _extract_close_prices(history: Any, symbol: str) -> Any:
    """
    Extract close prices from historical data.

    Internal helper function for processing market data.

    Args:
        history: pandas DataFrame with OHLCV data
        symbol: Stock ticker symbol (for error messages)

    Returns:
        pandas Series of close prices with NaN values removed

    Raises:
        ValueError: If no closing price data available
    """
    close_prices = history["Close"].dropna()
    if close_prices.empty:
        raise ValueError(f"No closing price data found for symbol '{symbol}'.")
    return close_prices


def extract_close_prices(history: Any, symbol: str) -> Any:
    """
    Extract close prices from historical data.

    Public interface for agents and analysis tools.

    Args:
        history: pandas DataFrame with OHLCV data
        symbol: Stock ticker symbol (for error messages)

    Returns:
        pandas Series of close prices with NaN values removed

    Raises:
        ValueError: If no closing price data available
    """
    return _extract_close_prices(history, symbol)
