from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agents.compliance_agent import check_compliance
from app.agents.market_agent import analyze_stock
from app.agents.risk_agent import analyze_risk
from app.agents.strategy_agent import generate_decision
from app.services.market_data_service import get_stock_data

router = APIRouter(tags=["analysis"])


class AnalyzeRequest(BaseModel):
    symbol: str = Field(..., min_length=1, description="Ticker symbol, e.g. AAPL")
    amount: float = Field(..., gt=0, description="Investment amount, e.g. 1000")


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


class ComplianceResponse(BaseModel):
    is_compliant: bool
    adjusted_allocation: float
    violations: list[str]
    notes: str


class DecisionResponse(BaseModel):
    decision: Literal["BUY", "SELL", "HOLD", "REJECT"]
    allocation: float
    confidence: float
    reason: str


class AnalyzeResponse(BaseModel):
    market_analysis: MarketAnalysisResponse
    risk_analysis: RiskAnalysisResponse
    compliance: ComplianceResponse
    decision: DecisionResponse


@router.post("/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        symbol, history = get_stock_data(request.symbol)
        market_analysis = analyze_stock(symbol=symbol, history=history)
        risk_analysis = analyze_risk(symbol=symbol, history=history)
        compliance = check_compliance(risk_data=risk_analysis, amount=request.amount)
        decision = generate_decision(
            market_data=market_analysis,
            risk_data=risk_analysis,
            compliance_data=compliance,
        )
        return AnalyzeResponse(
            market_analysis=MarketAnalysisResponse(**market_analysis),
            risk_analysis=RiskAnalysisResponse(**risk_analysis),
            compliance=ComplianceResponse(**compliance),
            decision=DecisionResponse(**decision),
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
