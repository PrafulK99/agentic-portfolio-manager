from datetime import datetime
from typing import Literal

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel

from app.core.database import get_db
from app.services.trade_history_service import get_trade_history as get_trade_history_service

router = APIRouter(tags=["history"])


class TradeHistoryResponse(BaseModel):
    id: str
    symbol: str
    investment_amount: float
    decision: Literal["BUY", "SELL", "HOLD", "REJECT"]
    confidence: float
    explanation_summary: str = None
    explanation_detailed: str = None
    market_trend: str = None
    risk_level: str = None
    is_executed: str
    created_at: datetime

    class Config:
        from_attributes = True


class GetHistoryResponse(BaseModel):
    trades: list[TradeHistoryResponse]
    total: int


@router.get("/history", response_model=GetHistoryResponse, status_code=status.HTTP_200_OK)
def get_history(
    symbol: str = None,
    decision: str = None,
    limit: int = 100,
    offset: int = 0,
    db = Depends(get_db),
) -> GetHistoryResponse:
    """
    Retrieve trade analysis history with optional filtering.
    
    Query Parameters:
    - symbol: Filter by stock symbol (e.g., AAPL)
    - decision: Filter by decision (BUY, SELL, HOLD, REJECT)
    - limit: Number of records to return (default: 100, max: 500)
    - offset: Pagination offset (default: 0)
    """
    try:
        # Validate limit
        limit = min(limit, 500)
        
        trades = get_trade_history_service(
            db=db,
            symbol=symbol,
            decision=decision,
            limit=limit,
            offset=offset,
        )
        
        return GetHistoryResponse(
            trades=[TradeHistoryResponse.from_orm(trade) for trade in trades],
            total=len(trades),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving trade history.",
        ) from exc
