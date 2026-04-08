"""
Portfolio service module for managing portfolio holdings.

This module contains business logic for adding, updating, and managing
portfolio positions.
"""

from typing import Dict

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.portfolio import Portfolio


def add_to_portfolio(
    db: Session,
    symbol: str,
    allocation: float,
    amount: float,
    current_price: float,
) -> Dict[str, any]:
    """
    Add a new holding to the portfolio or update existing one.
    
    This function calculates the investment amount based on allocation percentage,
    computes the quantity of units to hold, and stores the position in the database.
    
    Args:
        db: SQLAlchemy database session
        symbol: Stock ticker symbol (e.g., "AAPL", "GOOGL")
        allocation: Portfolio allocation percentage (0-100)
        amount: Total investment amount in base currency
        current_price: Current market price per unit
    
    Returns:
        Dictionary containing:
            - symbol: The stock ticker symbol
            - quantity: Number of units purchased
            - entry_price: Purchase price per unit (same as current_price)
            - invested_amount: Total amount invested
            - message: Success message
    
    Raises:
        ValueError: If allocation or current_price are invalid
        SQLAlchemyError: If database operation fails
    
    Example:
        response = add_to_portfolio(
            db=db_session,
            symbol="AAPL",
            allocation=20.0,
            amount=10000.0,
            current_price=150.5
        )
    """
    # Validate inputs
    if allocation <= 0 or allocation > 100:
        raise ValueError("Allocation must be between 0 and 100")
    
    if current_price <= 0:
        raise ValueError("Current price must be greater than 0")
    
    if amount <= 0:
        raise ValueError("Amount must be greater than 0")
    
    try:
        # Calculate investment amount based on allocation percentage
        invested_amount = amount * (allocation / 100)
        
        # Calculate quantity of units
        quantity = invested_amount / current_price
        
        # Create new portfolio holding
        portfolio = Portfolio(
            symbol=symbol.upper(),
            allocation=allocation,
            entry_price=current_price,
            current_price=current_price,
            quantity=quantity,
            profit_loss=0.0,
        )
        
        # Add to session and commit
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        
        # Return structured response
        return {
            "symbol": portfolio.symbol,
            "quantity": float(portfolio.quantity),
            "entry_price": float(portfolio.entry_price),
            "invested_amount": float(invested_amount),
            "message": "Successfully added to portfolio",
        }
    
    except SQLAlchemyError as e:
        # Rollback on database error
        db.rollback()
        raise RuntimeError(f"Database error while adding to portfolio: {str(e)}")
    
    except ValueError as e:
        # Re-raise validation errors
        raise e
    
    except Exception as e:
        # Rollback on any unexpected error
        db.rollback()
        raise RuntimeError(f"Unexpected error while adding to portfolio: {str(e)}")
