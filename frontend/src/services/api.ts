/**
 * API Service - Frontend to Backend Communication
 * Handles all HTTP requests to the portfolio manager API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

/**
 * Helper function to handle API responses
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const error = await response.json()
      throw new Error(error.message || response.statusText)
    } catch {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }
  }
  return await response.json()
}

/**
 * Fetch current portfolio with holdings and metrics
 */
export const getPortfolio = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return await handleResponse(response)
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    throw new Error(`Failed to fetch portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Execute a trade (buy/sell) with AI analysis
 */
export const executeTrade = async (symbol: string, amount: number) => {
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('Symbol must be a valid string')
  }
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Amount must be a positive number')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        amount: Number(amount),
      }),
    })
    return await handleResponse(response)
  } catch (error) {
    console.error('Error executing trade:', error)
    throw new Error(`Failed to execute trade: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
  const { symbol, amount, allocation, current_price } = data

  if (!symbol || !amount || allocation === undefined || !current_price) {
    throw new Error('Missing required fields: symbol, amount, allocation, current_price')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        amount: Number(amount),
        allocation: Number(allocation),
        current_price: Number(current_price),
      }),
    })
    return await handleResponse(response)
  } catch (error) {
    console.error('Error adding position:', error)
    throw new Error(`Failed to add position: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    return await handleResponse(response)
  } catch (error) {
    console.error('Error executing decision:', error)
    throw new Error(`Execute decision failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Analyze stock and get AI recommendations
 */
export const analyzeStock = async (symbol: string, amount: number) => {
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('Symbol must be a valid string')
  }
  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('Amount must be a non-negative number')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        amount: Number(amount),
      }),
    })
    return await handleResponse(response)
  } catch (error) {
    console.error('Error analyzing stock:', error)
    throw new Error(`Failed to analyze stock: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
