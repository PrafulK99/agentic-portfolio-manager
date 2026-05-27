from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field

from app.agents.orchestrator import run_analysis
from app.core.database import get_db
from app.services.trade_history_service import save_analysis_to_history

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
        detailed: str = None  # Added by Gemini AI, optional

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
def analyze(request: AnalyzeRequest, db = Depends(get_db)) -> AnalyzeResponse:
    """
    Analyze a stock and return market, risk, compliance, and decision analysis.
    
    Delegates to orchestrator for business logic - API layer is thin.
    Saves analysis result to trade history for tracking.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Run complete analysis workflow via orchestrator
        analysis_result = run_analysis(symbol=request.symbol, amount=request.amount)
        
        # Save analysis to trade history
        try:
            decision_data = analysis_result["decision"]
            save_analysis_to_history(
                db=db,
                symbol=request.symbol,
                investment_amount=request.amount,
                decision=decision_data.get("decision", "HOLD"),
                confidence=decision_data.get("confidence", 0.0),
                explanation_summary=decision_data.get("explanation", {}).get("summary"),
                explanation_detailed=decision_data.get("explanation", {}).get("detailed"),
                market_trend=analysis_result["market_analysis"].get("trend"),
                risk_level=analysis_result["risk_analysis"].get("risk_level"),
                is_executed="pending",
            )
        except Exception as db_err:
            logger.warning(f"Failed to save analysis to history: {db_err}")
            # Continue anyway - don't fail if history save fails
        
        # Map orchestrator output to response models
        return AnalyzeResponse(
            market_analysis=MarketAnalysisResponse(**analysis_result["market_analysis"]),
            risk_analysis=RiskAnalysisResponse(**analysis_result["risk_analysis"]),
            compliance=ComplianceResponse(**analysis_result["compliance"]),
            decision=DecisionResponse(**analysis_result["decision"]),
        )
    except ValueError as exc:
        logger.error(f"ValueError in analyze: {exc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        logger.error(f"RuntimeError in analyze: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service error: {str(exc)}",
        ) from exc
    except Exception as exc:
        logger.error(f"Unexpected error in analyze: {type(exc).__name__}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while analyzing stock data.",
        ) from exc
