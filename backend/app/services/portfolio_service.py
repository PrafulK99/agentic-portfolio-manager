"""
Portfolio service module for managing portfolio holdings.

This module contains business logic for adding, updating, and managing
portfolio positions.
"""

from typing import Dict, List

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
            allocation=0.2,
            amount=10000.0,
            current_price=150.5
        )
    """
    # Validate inputs
    if allocation <= 0 or allocation > 1:
        raise ValueError("Allocation must be between 0 and 1 (decimal format, e.g., 0.2 for 20%)")
    
    if current_price <= 0:
        raise ValueError("Current price must be greater than 0")
    
    if amount <= 0:
        raise ValueError("Amount must be greater than 0")
    
    try:
        # Calculate investment amount based on allocation (as decimal)
        invested_amount = amount * allocation
        
        # Calculate quantity of units (precision to 4 decimal places)
        quantity = round(invested_amount / current_price, 4)
        
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


def get_portfolio(db: Session) -> List[Dict]:
    """
    Fetch all portfolio holdings.
    
    Retrieves all current portfolio positions from the database
    with relevant information for display and analysis.
    
    Args:
        db: SQLAlchemy database session
    
    Returns:
        List of dictionaries containing:
            - symbol: Stock ticker symbol
            - quantity: Number of units held
            - entry_price: Average purchase price per unit
            - current_price: Current market price per unit
            - profit_loss: Current profit/loss amount
            - allocation: Portfolio allocation percentage
    
    Raises:
        SQLAlchemyError: If database query fails
    
    Example:
        holdings = get_portfolio(db_session)
        for holding in holdings:
            print(f"{holding['symbol']}: {holding['quantity']} units")
    """
    try:
        # Query all portfolio holdings
        portfolios = db.query(Portfolio).all()
        
        # Convert to dictionaries for response
        holdings = [
            {
                "symbol": p.symbol,
                "quantity": float(p.quantity),
                "entry_price": float(p.entry_price),
                "current_price": float(p.current_price),
                "profit_loss": float(p.profit_loss),
                "allocation": float(p.allocation),
            }
            for p in portfolios
        ]
        
        return holdings
    
    except SQLAlchemyError as e:
        raise RuntimeError(f"Database error while fetching portfolio: {str(e)}")
    
    except Exception as e:
        raise RuntimeError(f"Unexpected error while fetching portfolio: {str(e)}")


def calculate_portfolio_metrics(db: Session) -> Dict[str, float]:
    """
    Calculate overall portfolio metrics.
    
    Computes total investment, current value, and profit/loss
    across all portfolio holdings.
    
    Args:
        db: SQLAlchemy database session
    
    Returns:
        Dictionary containing:
            - total_investment: Sum of (entry_price * quantity) for all holdings
            - current_value: Sum of (current_price * quantity) for all holdings
            - total_profit_loss: Difference between current value and total investment
    
    Raises:
        SQLAlchemyError: If database query fails
    
    Example:
        metrics = calculate_portfolio_metrics(db_session)
        print(f"Current Value: ${metrics['current_value']:.2f}")
        print(f"Total Profit/Loss: ${metrics['total_profit_loss']:.2f}")
    """
    try:
        # Query all portfolio holdings
        portfolios = db.query(Portfolio).all()
        
        # Handle empty portfolio
        if not portfolios:
            return {
                "total_investment": 0.0,
                "current_value": 0.0,
                "total_profit_loss": 0.0,
            }
        
        # Calculate metrics
        total_investment = sum(
            float(p.entry_price) * float(p.quantity) for p in portfolios
        )
        current_value = sum(
            float(p.current_price) * float(p.quantity) for p in portfolios
        )
        total_profit_loss = current_value - total_investment
        
        return {
            "total_investment": round(total_investment, 2),
            "current_value": round(current_value, 2),
            "total_profit_loss": round(total_profit_loss, 2),
        }
    
    except SQLAlchemyError as e:
        raise RuntimeError(
            f"Database error while calculating portfolio metrics: {str(e)}"
        )
    
    except Exception as e:
        raise RuntimeError(
            f"Unexpected error while calculating portfolio metrics: {str(e)}"
        )
