"""Gemini API service for generating AI explanations of investment decisions."""

import os
from typing import Any

import google.generativeai as genai


def initialize_gemini() -> None:
    """Initialize Gemini API with API key from environment."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment variables")
    genai.configure(api_key=api_key)


def generate_explanation(
    symbol: str,
    decision: str,
    market_data: dict[str, Any],
    risk_data: dict[str, Any],
    compliance_data: dict[str, Any],
    investment_amount: float,
) -> str:
    """
    Generate a human-readable explanation for an investment decision using Gemini API.

    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL')
        decision: The recommendation (BUY, SELL, HOLD, REJECT)
        market_data: Market analysis data
        risk_data: Risk analysis data
        compliance_data: Compliance check data
        investment_amount: Investment amount in INR

    Returns:
        A detailed explanation string explaining the recommendation
    """
    initialize_gemini()

    # Build the analysis summary for Gemini
    analysis_summary = f"""
Stock: {symbol}
Decision: {decision}
Investment Amount: ₹{investment_amount:,.2f}

MARKET ANALYSIS:
- Current Price: ₹{market_data.get('current_price', 'N/A')}
- Trend: {market_data.get('trend', 'N/A').upper()}
- Short MA (7-day): ₹{market_data.get('short_ma', 'N/A')}
- Long MA (21-day): ₹{market_data.get('long_ma', 'N/A')}
- Confidence: {market_data.get('confidence', 0) * 100:.1f}%

RISK ANALYSIS:
- Volatility: {risk_data.get('volatility', 0) * 100:.2f}%
- Risk Level: {risk_data.get('risk_level', 'N/A').upper()}
- Suggested Allocation: {risk_data.get('suggested_allocation', 0) * 100:.1f}%

COMPLIANCE:
- Compliant: {'Yes' if compliance_data.get('is_compliant') else 'No'}
- Violations: {', '.join(compliance_data.get('violations', [])) if compliance_data.get('violations') else 'None'}
- Adjusted Allocation: {compliance_data.get('adjusted_allocation', 0) * 100:.1f}%
"""

    prompt = f"""You are a financial advisor explaining an AI-generated investment recommendation to a user who may not be technically savvy.

{analysis_summary}

Generate a clear, concise, and professional explanation (3-4 sentences) for why this recommendation was made. 
Focus on:
1. The main reason for this decision (market trend, risk level, or compliance)
2. Key supporting factors
3. What the user should understand about the recommendation

Use simple language and avoid jargon. Be direct and confident in your explanation. Start with "Based on current market analysis..."
"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        # Fallback explanation if Gemini API fails
        return f"The AI recommends {decision} for {symbol} based on market trend ({market_data.get('trend', 'unknown')}), risk level ({risk_data.get('risk_level', 'unknown')}), and compliance constraints. Investment: ₹{investment_amount:,.2f}"
