"""
FastAPI router for portfolio operations.

This module handles all portfolio-related API endpoints including
adding positions, retrieving holdings, and updating allocations.
"""

from typing import Dict, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.agents.compliance_agent import check_compliance
from app.agents.market_agent import analyze_stock
from app.agents.market_data import fetch_stock_history
from app.agents.risk_agent import analyze_risk
from app.agents.strategy_agent import generate_decision
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


class ExecutePortfolioRequest(BaseModel):
    """Request model for executing AI-driven portfolio decision."""

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

    class Config:
        """Pydantic config."""
        schema_extra = {
            "example": {
                "symbol": "AAPL",
                "amount": 10000.0,
            }
        }


class DecisionDetails(BaseModel):
    """AI decision details."""

    decision: Literal["BUY", "SELL", "HOLD", "REJECT"]
    allocation: float
    confidence: float
    reason: str
    current_price: float


class ExecutePortfolioResponse(BaseModel):
    """Response model for portfolio execution."""

    decision: DecisionDetails
    portfolio_entry: Optional[Dict] = None
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


@router.post(
    "/execute",
    response_model=ExecutePortfolioResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute AI-driven portfolio decision",
    description="Analyze stock and execute buy decision if recommended",
)
def execute_portfolio_decision(
    request: ExecutePortfolioRequest,
    db: Session = Depends(get_db),
) -> Dict:
    """
    Execute an AI-driven portfolio decision.
    
    This endpoint calls the analysis agents to evaluate a stock and determine
    if it should be added to the portfolio. If the decision is BUY, the position
    is added to the database automatically.
    
    Args:
        request: Portfolio execution request containing symbol and amount
        db: Database session injected via dependency injection
    
    Returns:
        ExecutePortfolioResponse containing the decision and portfolio entry (if BUY)
    
    Raises:
        HTTPException: If analysis fails or decision cannot be made
    """
    try:
        # Reuse existing analysis logic (no code duplication)
        symbol, history = fetch_stock_history(request.symbol)
        market_analysis = analyze_stock(symbol=symbol, history=history)
        risk_analysis = analyze_risk(symbol=symbol, history=history)
        compliance = check_compliance(risk_data=risk_analysis, amount=request.amount)
        decision = generate_decision(
            market_data=market_analysis,
            risk_data=risk_analysis,
            compliance_data=compliance,
        )
        
        # Extract current price from market analysis
        current_price = market_analysis.get("current_price")
        
        # Prepare decision response
        decision_details = DecisionDetails(
            decision=decision["decision"],
            allocation=decision["allocation"],
            confidence=decision["confidence"],
            reason=decision["reason"],
            current_price=current_price,
        )
        
        # If decision is not BUY, return early with message
        if decision["decision"] != "BUY":
            return ExecutePortfolioResponse(
                decision=decision_details,
                portfolio_entry=None,
                message=f"No investment executed. Decision was {decision['decision']}",
            )
        
        # Decision is BUY - add to portfolio
        portfolio_entry = add_to_portfolio(
            db=db,
            symbol=request.symbol,
            allocation=decision["allocation"],
            amount=request.amount,
            current_price=current_price,
        )
        
        return ExecutePortfolioResponse(
            decision=decision_details,
            portfolio_entry=portfolio_entry,
            message="Investment decision executed successfully",
        )
    
    except ValueError as e:
        # Handle validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}",
        )
    
    except RuntimeError as e:
        # Handle service errors (agents, database, etc.)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service error: {str(e)}",
        )
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while executing portfolio decision",
        )
