import { useEffect, useState } from 'react'
import { PortfolioSummary } from './PortfolioSummary'
import { HoldingsTable } from './HoldingsTable'
import { DecisionPanel } from './DecisionPanel'
import { Card } from './common'

interface PortfolioData {
  holdings: any[]
  metrics: {
    total_investment: number
    current_value: number
    total_profit_loss: number
  }
}

export function Dashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPortfolio = async () => {
    console.log('Fetching portfolio...')
    try {
      const res = await fetch('http://127.0.0.1:8000/api/portfolio')
      const data = await res.json()
      console.log('API DATA:', data)
      setPortfolio(data)
    } catch (err) {
      console.error('ERROR:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Component mounted')
    fetchPortfolio()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-blue-600">AI Portfolio Manager</h1>
          <p className="text-gray-600 text-sm mt-1">AI-powered portfolio analysis and management system</p>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2">Portfolio Data (Raw)</h3>
          <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded">{JSON.stringify(portfolio, null, 2)}</pre>
        </Card>

        {portfolio && portfolio.holdings?.length === 0 && (
          <Card className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Holdings Yet</h3>
            <p className="text-gray-600 mb-6">Your portfolio is empty. Start by adding your first position!</p>
            <div className="max-w-md mx-auto">
              <DecisionPanel onTradeSuccess={fetchPortfolio} />
            </div>
          </Card>
        )}

        {portfolio && portfolio.holdings?.length > 0 && (
          <>
            <PortfolioSummary metrics={portfolio.metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <HoldingsTable holdings={portfolio.holdings} />
              </div>
              <div>
                <DecisionPanel onTradeSuccess={fetchPortfolio} />
              </div>
            </div>
          </>
        )}

        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>Copyright 2026 Agentic Portfolio Manager. All rights reserved.</p>
        </footer>
      </main>
    </div>
  )
}
