/**
 * Stock chart data service
 * Fetches historical stock data from backend API
 */

interface StockDataPoint {
  date: string
  close: number
}

/**
 * Fetch historical stock data for charting from backend
 * Uses backend endpoint that calls yfinance
 */
export async function fetchStockChartData(symbol: string): Promise<StockDataPoint[]> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/chart/${symbol}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || `Failed to fetch data for ${symbol}`)
    }

    const data = await response.json()
    
    // Transform backend response to chart format
    return data.data.map((point: { date: string; price: number }) => ({
      date: point.date,
      close: point.price,
    }))
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol}:`, error)
    // Return empty array instead of throwing to allow graceful UI handling
    return []
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

/**
 * Calculate price change percentage
 */
export function calculatePriceChange(data: StockDataPoint[]): {
  change: number
  changePercent: number
} {
  if (data.length < 2) {
    return { change: 0, changePercent: 0 }
  }

  const startPrice = data[0].close
  const endPrice = data[data.length - 1].close
  const change = endPrice - startPrice
  const changePercent = (change / startPrice) * 100

  return { change, changePercent }
}
