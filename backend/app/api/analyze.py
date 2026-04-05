from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agents.market_agent import analyze_stock

router = APIRouter(tags=["analysis"])


class AnalyzeRequest(BaseModel):
    symbol: str = Field(..., min_length=1, description="Ticker symbol, e.g. AAPL")


class AnalyzeResponse(BaseModel):
    symbol: str
    current_price: float
    short_ma: float
    long_ma: float
    trend: Literal["bullish", "bearish"]
    confidence: float


@router.post("/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        result = analyze_stock(request.symbol)
        return AnalyzeResponse(**result)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while analyzing stock data.",
        ) from exc
