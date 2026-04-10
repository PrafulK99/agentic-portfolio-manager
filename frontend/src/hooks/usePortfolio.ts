/**
 * Custom hook for portfolio operations.
 * 
 * Manages portfolio state and data fetching.
 */

import { useState, useEffect, useCallback } from 'react'
import { fetchPortfolio } from '../services/api'

interface Portfolio {
  holdings: any[]
  metrics: {
    total_investment: number
    current_value: number
    total_profit_loss: number
  }
}

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPortfolio = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPortfolio()
      setPortfolio(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setPortfolio(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPortfolio()
  }, [loadPortfolio])

  return { portfolio, loading, error, refresh: loadPortfolio }
}
