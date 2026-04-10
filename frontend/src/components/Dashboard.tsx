import { PortfolioSummary } from './PortfolioSummary'
import { HoldingsTable } from './HoldingsTable'
import { DecisionPanel } from './DecisionPanel'

// Dummy data
const DUMMY_METRICS = {
  total_investment: 50000.0,
  current_value: 53750.5,
  total_profit_loss: 3750.5,
}

const DUMMY_HOLDINGS = [
  {
    symbol: 'AAPL',
    quantity: 50.0,
    entry_price: 180.5,
    current_price: 185.25,
    profit_loss: 237.5,
    allocation: 0.25,
  },
  {
    symbol: 'GOOGL',
    quantity: 30.0,
    entry_price: 140.75,
    current_price: 142.5,
    profit_loss: 52.5,
    allocation: 0.20,
  },
  {
    symbol: 'MSFT',
    quantity: 40.0,
    entry_price: 385.0,
    current_price: 390.75,
    profit_loss: 230.0,
    allocation: 0.30,
  },
  {
    symbol: 'TSLA',
    quantity: 25.0,
    entry_price: 242.0,
    current_price: 238.5,
    profit_loss: -87.5,
    allocation: 0.25,
  },
]

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-blue-600">
            🚀 AI Portfolio Manager
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            AI-powered portfolio analysis and management system
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary */}
        <PortfolioSummary metrics={DUMMY_METRICS} />

        {/* Holdings and Decision Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings Table */}
          <div className="lg:col-span-2">
            <HoldingsTable holdings={DUMMY_HOLDINGS} />
          </div>

          {/* Decision Panel */}
          <div>
            <DecisionPanel />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>© 2026 Agentic Portfolio Manager. All rights reserved.</p>
        </footer>
      </main>
    </div>
  )
}
