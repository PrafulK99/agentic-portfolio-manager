"""
SQLAlchemy model for Portfolio representing individual holdings.

This module defines the Portfolio ORM model for storing portfolio holdings,
their prices, quantities, and performance metrics.
"""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, DateTime, DECIMAL, Float, Index, String
from sqlalchemy.types import Uuid

from ..core.database import Base


class Portfolio(Base):
    """
    Portfolio model representing a single holding in a user's portfolio.
    
    Attributes:
        id: Unique identifier (UUID primary key)
        symbol: Stock/asset ticker symbol (indexed for quick lookups)
        allocation: Percentage allocation of total portfolio (0-100)
        entry_price: Purchase price per unit
        current_price: Current market price per unit
        quantity: Number of units held
        profit_loss: Current profit/loss amount
        created_at: Timestamp when the holding was added
    """

    __tablename__ = "portfolios"

    id = Column(
        Uuid,
        primary_key=True,
        default=uuid4,
        nullable=False,
        doc="Unique identifier for the portfolio holding"
    )
    symbol = Column(
        String(10),
        nullable=False,
        index=True,
        doc="Stock ticker symbol (e.g., AAPL, GOOGL)"
    )
    allocation = Column(
        DECIMAL(5, 2),
        nullable=False,
        default=0.0,
        doc="Percentage allocation of total portfolio (0-100)"
    )
    entry_price = Column(
        DECIMAL(12, 4),
        nullable=False,
        default=0.0,
        doc="Average purchase price per unit"
    )
    current_price = Column(
        DECIMAL(12, 4),
        nullable=False,
        default=0.0,
        doc="Current market price per unit"
    )
    quantity = Column(
        DECIMAL(12, 4),
        nullable=False,
        default=0.0,
        doc="Number of units held"
    )
    profit_loss = Column(
        DECIMAL(14, 2),
        nullable=False,
        default=0.0,
        doc="Current profit/loss amount in base currency"
    )
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        doc="Timestamp when the holding was created"
    )

    # Composite index for common queries
    __table_args__ = (
        Index("idx_symbol_created", "symbol", "created_at"),
    )

    def __repr__(self) -> str:
        """String representation of the Portfolio."""
        return (
            f"Portfolio(id={self.id}, symbol={self.symbol}, "
            f"qty={self.quantity}, current_price={self.current_price})"
        )
