from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agents.market_data import fetch_stock_history
from app.agents.market_agent import analyze_stock
from app.agents.risk_agent import analyze_risk

router = APIRouter(tags=["analysis"])


class AnalyzeRequest(BaseModel):
    symbol: str = Field(..., min_length=1, description="Ticker symbol, e.g. AAPL")


class MarketAnalysisResponse(BaseModel):
    symbol: str
    current_price: float
    short_ma: float
    long_ma: float
    trend: Literal["bullish", "bearish"]
    confidence: float


class RiskAnalysisResponse(BaseModel):
    symbol: str
    volatility: float
    risk_level: Literal["low", "medium", "high"]
    suggested_allocation: float


class AnalyzeResponse(BaseModel):
    market_analysis: MarketAnalysisResponse
    risk_analysis: RiskAnalysisResponse


@router.post("/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        symbol, history = fetch_stock_history(request.symbol)
        market_analysis = analyze_stock(symbol=symbol, history=history)
        risk_analysis = analyze_risk(symbol=symbol, history=history)
        return AnalyzeResponse(
            market_analysis=MarketAnalysisResponse(**market_analysis),
            risk_analysis=RiskAnalysisResponse(**risk_analysis),
        )
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
