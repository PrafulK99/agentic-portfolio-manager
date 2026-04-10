"""
Portfolio service module for managing portfolio holdings.

This module contains business logic for adding, updating, and managing
portfolio positions, including live price updates.
"""

from typing import Dict, List
import logging

import yfinance
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.portfolio import Portfolio

# Configure logging
logger = logging.getLogger(__name__)


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
        # Round prices to 2 decimal places for financial precision
        entry_price = round(current_price, 2)
        
        # Calculate investment amount based on allocation (as decimal)
        invested_amount = amount * allocation
        
        # Calculate quantity of units (precision to 4 decimal places)
        quantity = round(invested_amount / entry_price, 4)
        
        # Create new portfolio holding
        portfolio = Portfolio(
            symbol=symbol.upper(),
            allocation=allocation,
            entry_price=entry_price,
            current_price=entry_price,
            quantity=quantity,
            profit_loss=0.0,
        )
        
        # Add to session and commit
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        
        # Return structured response with proper rounding
        return {
            "symbol": portfolio.symbol,
            "quantity": float(portfolio.quantity),
            "entry_price": round(float(portfolio.entry_price), 2),
            "invested_amount": round(float(invested_amount), 2),
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


def get_live_price(symbol: str) -> float:
    """
    Fetch the latest stock price from market data.
    
    Retrieves the current market price for a given stock ticker symbol
    using yfinance. Returns None if the API call fails.
    
    Args:
        symbol: Stock ticker symbol (e.g., "AAPL", "GOOGL")
    
    Returns:
        Current market price as float, or None if fetch fails
    
    Example:
        price = get_live_price("AAPL")
        if price:
            print(f"Current price: ${price:.2f}")
    """
    try:
        # Fetch stock data from yfinance
        ticker = yfinance.Ticker(symbol)
        price = ticker.info.get("currentPrice") or ticker.info.get("regularMarketPrice")
        
        if price is None:
            logger.warning(f"Could not fetch live price for {symbol}: using stored price")
            return None
        
        # Round to 2 decimal places for financial precision
        return round(float(price), 2)
    
    except Exception as e:
        logger.warning(f"Error fetching live price for {symbol}: {str(e)} - using stored price")
        return None


def get_portfolio(db: Session) -> List[Dict]:
    """
    Fetch all portfolio holdings with live price updates.
    
    Retrieves all current portfolio positions from the database
    and updates prices with live market data. Calculates profit/loss
    dynamically based on current market prices.
    
    Args:
        db: SQLAlchemy database session
    
    Returns:
        List of dictionaries containing:
            - symbol: Stock ticker symbol
            - quantity: Number of units held
            - entry_price: Average purchase price per unit
            - current_price: Current live market price (rounded to 2 decimals)
            - profit_loss: Current profit/loss amount (rounded to 2 decimals)
            - allocation: Portfolio allocation percentage
    
    Raises:
        SQLAlchemyError: If database query fails
    
    Example:
        holdings = get_portfolio(db_session)
        for holding in holdings:
            print(f"{holding['symbol']}: ${holding['current_price']:.2f}")
    """
    try:
        # Query all portfolio holdings
        portfolios = db.query(Portfolio).all()
        
        # Convert to dictionaries with live price updates and precision rounding
        holdings = []
        for p in portfolios:
            # Retrieve and round values with proper precision
            entry_price = round(float(p.entry_price), 2)
            quantity = round(float(p.quantity), 4)
            
            # Fetch live price for this symbol
            live_price = get_live_price(p.symbol)
            
            # Use live price if available, otherwise fall back to stored price
            # Live prices already rounded to 2 decimals by get_live_price()
            current_price = live_price if live_price is not None else entry_price
            
            # Calculate profit/loss based on live price (final rounding at output)
            profit_loss = round((current_price - entry_price) * quantity, 2)
            
            holding = {
                "symbol": p.symbol,
                "quantity": quantity,
                "entry_price": entry_price,
                "current_price": current_price,
                "profit_loss": profit_loss,
                "allocation": round(float(p.allocation), 4),
            }
            holdings.append(holding)
        
        return holdings
    
    except SQLAlchemyError as e:
        raise RuntimeError(f"Database error while fetching portfolio: {str(e)}")
    
    except Exception as e:
        raise RuntimeError(f"Unexpected error while fetching portfolio: {str(e)}")


def calculate_portfolio_metrics(db: Session) -> Dict[str, float]:
    """
    Calculate overall portfolio metrics with live prices.
    
    Computes total investment, current value, and profit/loss
    across all portfolio holdings using live market prices.
    
    Args:
        db: SQLAlchemy database session
    
    Returns:
        Dictionary containing:
            - total_investment: Sum of (entry_price * quantity) for all holdings
            - current_value: Sum of (live current_price * quantity) for all holdings
            - total_profit_loss: Total profit/loss based on live prices
    
    Raises:
        SQLAlchemyError: If database query fails
    
    Example:
        metrics = calculate_portfolio_metrics(db_session)
        print(f"Current Value: ${metrics['current_value']:.2f}")
        print(f"Total Profit/Loss: ${metrics['total_profit_loss']:.2f}")
    """
    try:
        # Get portfolio with live prices
        holdings = get_portfolio(db=db)
        
        # Handle empty portfolio
        if not holdings:
            return {
                "total_investment": 0.0,
                "current_value": 0.0,
                "total_profit_loss": 0.0,
            }
        
        # Calculate metrics using live prices (full precision until final rounding)
        # Total investment = sum(entry_price * quantity) rounded at final step
        total_investment = sum(
            holding["entry_price"] * holding["quantity"] for holding in holdings
        )
        # Current value = sum(current_price * quantity) rounded at final step
        current_value = sum(
            holding["current_price"] * holding["quantity"] for holding in holdings
        )
        # Calculate total profit/loss with full precision
        total_profit_loss = current_value - total_investment
        
        return {
            "total_investment": round(total_investment, 2),
            "current_value": round(current_value, 2),
            "total_profit_loss": round(total_profit_loss, 2),
        }
    
    except RuntimeError as e:
        # Re-raise RuntimeError from get_portfolio
        raise e
    
    except Exception as e:
        raise RuntimeError(
            f"Unexpected error while calculating portfolio metrics: {str(e)}"
        )
