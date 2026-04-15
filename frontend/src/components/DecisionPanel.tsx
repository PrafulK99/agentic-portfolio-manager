import { useState } from 'react'
import { Card, Button } from './common'

interface DecisionPanelProps {
  onTradeSuccess?: () => Promise<void> | void
}

export function DecisionPanel({ onTradeSuccess }: DecisionPanelProps) {
  const [symbol, setSymbol] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleExecute = async () => {
    if (!symbol || !amount) {
      setErrorMessage('Please fill in all fields')
      return
    }

    const inputSymbol = symbol.trim().toUpperCase()
    const inputAmount = Number(amount)

    if (!inputSymbol || Number.isNaN(inputAmount) || inputAmount <= 0) {
      setErrorMessage('Please enter a valid symbol and amount')
      return
    }

    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/portfolio/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: inputSymbol,
          amount: inputAmount,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      await response.json()

      if (onTradeSuccess) {
        await onTradeSuccess()
      }

      setSuccessMessage('Trade executed successfully')
      setSymbol('')
      setAmount('')
    } catch (error) {
      console.error('Error executing decision:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to execute trade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Decision Panel</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., AAPL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1000"
            min="0"
            step="100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <Button onClick={handleExecute} variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Executing trade...' : 'Execute Trade'}
        </Button>
      </div>

      {successMessage && (
        <div className="mt-4 p-3 rounded-lg border border-green-300 bg-green-50 text-green-800 text-sm">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          Tip: Enter a stock symbol and amount to execute AI-assisted portfolio trades.
        </p>
      </div>
    </Card>
  )
}
