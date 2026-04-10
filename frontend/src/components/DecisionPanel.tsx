import { useState } from 'react'
import { Card, Button } from './common'

export function DecisionPanel() {
  const [symbol, setSymbol] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleExecute = async () => {
    if (!symbol || !amount) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      // TODO: Call executePortfolioDecision API
      console.log('Execute decision for:', { symbol, amount })
      setSymbol('')
      setAmount('')
    } catch (error) {
      console.error('Error executing decision:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Decision Panel</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Symbol
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Investment Amount ($)
          </label>
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

        <Button
          onClick={handleExecute}
          variant="primary"
          className="w-full"
        >
          {loading ? 'Analyzing...' : 'Get AI Recommendation'}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Enter a stock symbol and amount to get AI-powered investment
          recommendations based on market analysis and risk assessment.
        </p>
      </div>
    </Card>
  )
}
