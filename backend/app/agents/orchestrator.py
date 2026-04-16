"""
Analysis orchestrator that coordinates multi-agent workflow.

This module orchestrates the complete analysis flow:
1. Fetches stock data once
2. Runs agents in sequence
3. Passes outputs step-by-step
4. Returns comprehensive analysis result

No agent makes API calls - all data is fetched at the orchestrator level.
"""

from __future__ import annotations

from typing import Any

from app.agents.compliance_agent import check_compliance
from app.agents.market_agent import analyze_stock
from app.agents.risk_agent import analyze_risk
from app.agents.strategy_agent import generate_decision
from app.services.market_data_service import get_stock_data


def run_analysis(symbol: str, amount: float) -> dict[str, Any]:
    """
    Execute complete analysis workflow for a stock and investment amount.

    This orchestrator:
    1. Fetches stock data once from market_data_service
    2. Calls market_agent to analyze trends
    3. Calls risk_agent to assess volatility
    4. Calls compliance_agent to validate allocation
    5. Calls strategy_agent to generate final decision

    All agents receive pre-fetched data - no duplicate API calls.

    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
        amount: Investment amount in base currency (e.g., 1000.0)

    Returns:
        Dictionary containing:
        {
            "market_analysis": {
                "symbol": str,
                "current_price": float,
                "short_ma": float,
                "long_ma": float,
                "trend": "bullish" | "bearish",
                "confidence": float
            },
            "risk_analysis": {
                "symbol": str,
                "volatility": float,
                "risk_level": "low" | "medium" | "high",
                "suggested_allocation": float
            },
            "compliance": {
                "is_compliant": bool,
                "adjusted_allocation": float,
                "violations": list[str],
                "notes": str
            },
            "decision": {
                "decision": "BUY" | "SELL" | "HOLD" | "REJECT",
                "allocation": float,
                "confidence": float,
                "reason": str
            },
            "current_price": float
        }

    Raises:
        ValueError: If symbol or amount validation fails
        RuntimeError: If data fetching fails
    """
    # Step 1: Fetch stock data once
    validated_symbol, history = get_stock_data(symbol)

    # Step 2: Market analysis
    market_analysis = analyze_stock(symbol=validated_symbol, history=history)

    # Step 3: Risk analysis (uses same historical data)
    risk_analysis = analyze_risk(symbol=validated_symbol, history=history)

    # Step 4: Compliance check (uses risk analysis output)
    compliance = check_compliance(risk_data=risk_analysis, amount=amount)

    # Step 5: Strategy decision (uses all previous outputs)
    decision = generate_decision(
        market_data=market_analysis,
        risk_data=risk_analysis,
        compliance_data=compliance,
    )

    # Return complete analysis result
    return {
        "market_analysis": market_analysis,
        "risk_analysis": risk_analysis,
        "compliance": compliance,
        "decision": decision,
        "current_price": market_analysis.get("current_price"),
    }
