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
    """Chart data response."""

    symbol: str = Field(..., description="Stock ticker symbol")
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
        # Fetch 30 days of historical data
        ticker = yf.Ticker(symbol_upper)
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

        # Return response
        return ChartResponse(
            symbol=symbol_upper,
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
