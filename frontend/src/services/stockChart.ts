/**
 * Stock chart data service
 * Fetches historical stock data and currency information from backend API
 */

interface StockDataPoint {
  date: string
  close: number
}

interface StockDataWithCurrency {
  symbol: string
  currency: string
  currentPrice: number
  data: StockDataPoint[]
}

/**
 * Mapping of currency codes to symbols
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CHF': 'CHF',
  'CAD': 'C$',
  'AUD': 'A$',
  'INR': '₹',
  'CNY': '¥',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'SGD': 'S$',
  'HKD': 'HK$',
  'NZD': 'NZ$',
  'MXN': '$',
  'BRL': 'R$',
}

/**
 * Get currency symbol for a currency code
 * Returns the code if symbol not found
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency
}

/**
 * Fetch historical stock data with currency information from backend
 */
export async function fetchStockChartData(symbol: string): Promise<StockDataWithCurrency> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/chart/${symbol}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || `Failed to fetch data for ${symbol}`)
    }

    const data = await response.json()
    
    // Transform backend response to chart format with currency
    return {
      symbol: data.symbol,
      currency: data.currency || 'USD',
      currentPrice: data.current_price || 0,
      data: data.data.map((point: { date: string; price: number }) => ({
        date: point.date,
        close: point.price,
      }))
    }
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol}:`, error)
    throw error
  }
}

/**
 * Format price for display with currency symbol
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency)
  
  // Format number with 2 decimals
  const formatted = price.toFixed(2)
  
  // Place symbol before price for most currencies, after for some
  if (['JPY', 'CNY'].includes(currency)) {
    return `${formatted} ${symbol}`
  }
  
  return `${symbol}${formatted}`
}

/**
 * Format price change with currency awareness
 */
export function formatPriceChange(
  change: number, 
  changePercent: number,
  currency: string = 'USD'
): string {
  const symbol = getCurrencySymbol(currency)
  const sign = change >= 0 ? '+' : ''
  const formatted = Math.abs(change).toFixed(2)
  
  if (['JPY', 'CNY'].includes(currency)) {
    return `${sign}${formatted} ${symbol} (${sign}${changePercent.toFixed(2)}%)`
  }
  
  return `${sign}${symbol}${formatted} (${sign}${changePercent.toFixed(2)}%)`
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
