from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agents.orchestrator import run_analysis

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
    class ExplanationResponse(BaseModel):
        summary: str
        factors: list[str]
        confidence: float

    decision: Literal["BUY", "SELL", "HOLD", "REJECT"]
    allocation: float
    confidence: float
    explanation: ExplanationResponse


class AnalyzeResponse(BaseModel):
    market_analysis: MarketAnalysisResponse
    risk_analysis: RiskAnalysisResponse
    compliance: ComplianceResponse
    decision: DecisionResponse


@router.post("/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyze a stock and return market, risk, compliance, and decision analysis.
    
    Delegates to orchestrator for business logic - API layer is thin.
    """
    try:
        # Run complete analysis workflow via orchestrator
        analysis_result = run_analysis(symbol=request.symbol, amount=request.amount)
        
        # Map orchestrator output to response models
        return AnalyzeResponse(
            market_analysis=MarketAnalysisResponse(**analysis_result["market_analysis"]),
            risk_analysis=RiskAnalysisResponse(**analysis_result["risk_analysis"]),
            compliance=ComplianceResponse(**analysis_result["compliance"]),
            decision=DecisionResponse(**analysis_result["decision"]),
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
