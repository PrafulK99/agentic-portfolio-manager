from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, String, Float, DateTime, Text, Index

from ..core.database import Base


class TradeHistory(Base):
    """
    Model for storing trade analysis and execution history.
    """
    __tablename__ = "trade_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    symbol = Column(String(10), nullable=False, index=True)
    investment_amount = Column(Float, nullable=False)
    decision = Column(String(10), nullable=False)  # BUY, SELL, HOLD, REJECT
    confidence = Column(Float, nullable=False)
    explanation_summary = Column(Text, nullable=True)
    explanation_detailed = Column(Text, nullable=True)
    market_trend = Column(String(10), nullable=True)  # bullish, bearish
    risk_level = Column(String(10), nullable=True)  # low, medium, high
    is_executed = Column(String(10), default="pending")  # pending, executed, rejected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    __table_args__ = (
        Index("idx_trade_history_symbol_created", "symbol", "created_at"),
    )
