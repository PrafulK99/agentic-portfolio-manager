/**
 * Utility functions for formatting and display.
 */

/**
 * Format a number as currency
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a number as percentage
 */
export const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`
}

/**
 * Format a number with thousands separator
 */
export const formatNumber = (value: number, decimals = 2): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Determine color based on positive/negative value
 */
export const getProfitLossColor = (value: number): string => {
  if (value > 0) return '#22c55e' // Green
  if (value < 0) return '#ef4444' // Red
  return '#666666' // Gray
}
