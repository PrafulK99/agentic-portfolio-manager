"""
FastAPI router for stock chart data endpoints.

Provides historical price data for visualization on the frontend.
"""

from __future__ import annotations

from typing import Literal

import yfinance as yf
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/chart", tags=["chart"])


class ChartDataPoint(BaseModel):
    """Single data point in chart data."""

    date: str = Field(..., description="Date in YYYY-MM-DD format")
    price: float = Field(..., gt=0, description="Close price for the date")


class ChartResponse(BaseModel):
    """Chart data response with currency information."""

    symbol: str = Field(..., description="Stock ticker symbol")
    currency: str = Field(default="USD", description="Currency code (e.g., USD, EUR, INR)")
    current_price: float = Field(..., description="Most recent closing price")
    data: list[ChartDataPoint] = Field(..., description="Historical price data points")
    status: Literal["success"] = Field(default="success", description="Response status")


@router.get(
    "/{symbol}",
    response_model=ChartResponse,
    status_code=status.HTTP_200_OK,
    summary="Get 30-day historical chart data",
    description="Fetch 30 days of historical price data for a stock symbol",
)
def get_chart_data(symbol: str) -> ChartResponse:
    """
    Fetch historical stock price data for charting.

    Retrieves the last 30 days of daily close prices for the specified symbol.
    This data is suitable for line charts and trend analysis.

    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')

    Returns:
        ChartResponse containing symbol and array of date/price data points

    Raises:
        HTTPException 400: If symbol is invalid or empty
        HTTPException 503: If yfinance API fails or no data available
    """
    # Validate symbol
    if not symbol or not isinstance(symbol, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symbol must be a non-empty string.",
        )

    symbol_upper = symbol.strip().upper()

    try:
        # Fetch ticker object to get metadata (currency)
        ticker = yf.Ticker(symbol_upper)
        
        # Fetch 30 days of historical data
        history = ticker.history(period="1mo")

        # Validate we got data
        if history.empty:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"No data available for symbol '{symbol_upper}'. Please check the symbol and try again.",
            )

        if "Close" not in history.columns:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Invalid data structure returned for '{symbol_upper}'.",
            )

        # Extract currency from ticker info (default to USD if not available)
        currency = "USD"
        try:
            # Safely try to get currency from ticker info
            info = ticker.info
            if isinstance(info, dict) and "currency" in info:
                currency = info.get("currency", "USD").upper()
        except Exception:
            # If currency fetch fails, default to USD
            pass

        # Convert to chart data points
        data_points: list[ChartDataPoint] = []
        for date, row in history.iterrows():
            close_price = float(row["Close"])
            date_str = date.strftime("%Y-%m-%d")
            data_points.append(
                ChartDataPoint(
                    date=date_str,
                    price=close_price,
                )
            )

        # Get current price (last available data point)
        current_price = float(history["Close"].iloc[-1]) if not history.empty else 0.0

        # Return response with currency information
        return ChartResponse(
            symbol=symbol_upper,
            currency=currency,
            current_price=current_price,
            data=data_points,
        )

    except HTTPException:
        # Re-raise HTTPExceptions (validation errors)
        raise
    except Exception as exc:
        # Catch unexpected errors
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch chart data for '{symbol_upper}'. The market data service may be temporarily unavailable.",
        ) from exc
