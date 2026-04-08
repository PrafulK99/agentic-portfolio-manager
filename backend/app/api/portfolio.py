"""
FastAPI router for portfolio operations.

This module handles all portfolio-related API endpoints including
adding positions, retrieving holdings, and updating allocations.
"""

from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.portfolio_service import add_to_portfolio

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


class AddPortfolioRequest(BaseModel):
    """Request model for adding a position to the portfolio."""

    symbol: str = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Stock ticker symbol (e.g., AAPL, GOOGL)"
    )
    amount: float = Field(
        ...,
        gt=0,
        description="Total investment amount in base currency"
    )
    allocation: float = Field(
        ...,
        gt=0,
        le=100,
        description="Portfolio allocation percentage (0-100)"
    )
    current_price: float = Field(
        ...,
        gt=0,
        description="Current market price per unit"
    )

    class Config:
        """Pydantic config."""
        schema_extra = {
            "example": {
                "symbol": "AAPL",
                "amount": 10000.0,
                "allocation": 20.0,
                "current_price": 180.50,
            }
        }


class AddPortfolioResponse(BaseModel):
    """Response model for adding a position to portfolio."""

    symbol: str
    quantity: float
    entry_price: float
    invested_amount: float
    message: str


@router.post(
    "/add",
    response_model=AddPortfolioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add position to portfolio",
    description="Add a new stock position to the portfolio with specified allocation",
)
def add_portfolio_position(
    request: AddPortfolioRequest,
    db: Session = Depends(get_db),
) -> Dict:
    """
    Add a new position to the portfolio.
    
    This endpoint calculates the investment amount based on the allocation
    percentage, computes the quantity to purchase, and stores the position
    in the database.
    
    Args:
        request: Portfolio addition request containing symbol, amount, allocation, price
        db: Database session injected via dependency injection
    
    Returns:
        AddPortfolioResponse containing the added position details
    
    Raises:
        HTTPException: If validation fails or database operation fails
    """
    try:
        result = add_to_portfolio(
            db=db,
            symbol=request.symbol,
            allocation=request.allocation,
            amount=request.amount,
            current_price=request.current_price,
        )
        return result
    
    except ValueError as e:
        # Handle validation errors from service
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}",
        )
    
    except RuntimeError as e:
        # Handle runtime errors (database, etc.)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Service error: {str(e)}",
        )
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while adding to portfolio",
        )
