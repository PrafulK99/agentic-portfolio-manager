from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.trade_history import TradeHistory


def save_analysis_to_history(
    db: Session,
    symbol: str,
    investment_amount: float,
    decision: str,
    confidence: float,
    explanation_summary: str = None,
    explanation_detailed: str = None,
    market_trend: str = None,
    risk_level: str = None,
    is_executed: str = "pending",
) -> TradeHistory:
    """
    Save a trade analysis to history.
    """
    trade = TradeHistory(
        symbol=symbol,
        investment_amount=investment_amount,
        decision=decision,
        confidence=confidence,
        explanation_summary=explanation_summary,
        explanation_detailed=explanation_detailed,
        market_trend=market_trend,
        risk_level=risk_level,
        is_executed=is_executed,
    )
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade


def get_trade_history(
    db: Session,
    symbol: str = None,
    decision: str = None,
    limit: int = 100,
    offset: int = 0,
) -> list[TradeHistory]:
    """
    Retrieve trade history with optional filtering.
    """
    query = db.query(TradeHistory)
    
    if symbol:
        query = query.filter(TradeHistory.symbol == symbol.upper())
    if decision:
        query = query.filter(TradeHistory.decision == decision.upper())
    
    # Order by most recent first
    query = query.order_by(TradeHistory.created_at.desc())
    
    return query.offset(offset).limit(limit).all()


def get_trade_by_id(db: Session, trade_id: str) -> TradeHistory:
    """
    Retrieve a specific trade by ID.
    """
    return db.query(TradeHistory).filter(TradeHistory.id == trade_id).first()


def update_trade_execution(db: Session, trade_id: str, is_executed: str) -> TradeHistory:
    """
    Update the execution status of a trade.
    """
    trade = get_trade_by_id(db, trade_id)
    if trade:
        trade.is_executed = is_executed
        db.commit()
        db.refresh(trade)
    return trade
