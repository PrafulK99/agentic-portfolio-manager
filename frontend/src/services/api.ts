/**
 * API service module for communicating with backend.
 * 
 * Handles all HTTP requests to the portfolio manager API.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * Fetch portfolio holdings and metrics
 */
export const fetchPortfolio = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio`)
    if (!response.ok) {
      throw new Error(`Portfolio fetch failed: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    throw error
  }
}

/**
 * Add a new position to portfolio
 */
export const addPortfolioPosition = async (data: {
  symbol: string
  amount: number
  allocation: number
  current_price: number
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`Add position failed: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error adding position:', error)
    throw error
  }
}

/**
 * Execute AI-driven portfolio decision
 */
export const executePortfolioDecision = async (data: {
  symbol: string
  amount: number
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`Execute decision failed: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error executing decision:', error)
    throw error
  }
}

/**
 * Analyze stock and get AI recommendations
 */
export const analyzeStock = async (symbol: string, amount: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, amount }),
    })
    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error analyzing stock:', error)
    throw error
  }
}
