import { useState } from 'react'
import { Card, Button } from './common'
import { analyzeStock, executeTrade } from '../services/api'
import { AIExplanationPanel, type AIExplanation } from './AIExplanationPanel'

interface DecisionPanelProps {
  onTradeSuccess?: () => Promise<void> | void
}

export function DecisionPanel({ onTradeSuccess }: DecisionPanelProps) {
  const [symbol, setSymbol] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [explanation, setExplanation] = useState<AIExplanation | null>(null)

  const validateInputs = () => {
    if (!symbol || !amount) {
      setErrorMessage('Please fill in all fields')
      return null
    }

    const inputSymbol = symbol.trim().toUpperCase()
    const inputAmount = Number(amount)

    if (!inputSymbol || Number.isNaN(inputAmount) || inputAmount <= 0) {
      setErrorMessage('Please enter a valid symbol and amount')
      return null
    }

    return { inputSymbol, inputAmount }
  }

  const handleAnalyze = async () => {
    const validated = validateInputs()
    if (!validated) return

    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await analyzeStock(validated.inputSymbol, validated.inputAmount)
      setExplanation(response.decision.explanation)
      setSuccessMessage(`Analysis complete. Recommendation: ${response.decision.decision}`)
    } catch (error) {
      console.error('Error analyzing stock:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to analyze stock')
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async () => {
    const validated = validateInputs()
    if (!validated) return

    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await executeTrade(validated.inputSymbol, validated.inputAmount)
      setExplanation(response.decision.explanation)

      if (onTradeSuccess) {
        await onTradeSuccess()
      }

      setSuccessMessage(response.message || 'Trade executed successfully')
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
          {loading ? 'Processing...' : 'Execute Trade'}
        </Button>

        <Button onClick={handleAnalyze} variant="secondary" className="w-full" disabled={loading}>
          {loading ? 'Processing...' : 'Analyze Only'}
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
          Tip: Analyze first for clarity, then execute when confidence is acceptable.
        </p>
      </div>

      {explanation && <AIExplanationPanel explanation={explanation} />}
    </Card>
  )
}
