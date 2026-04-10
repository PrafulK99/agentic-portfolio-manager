import { Card } from './common'

interface PortfolioMetrics {
  total_investment: number
  current_value: number
  total_profit_loss: number
}

interface PortfolioSummaryProps {
  metrics: PortfolioMetrics
}

export function PortfolioSummary({ metrics }: PortfolioSummaryProps) {
  const gainPercentage = metrics.total_investment
    ? (metrics.total_profit_loss / metrics.total_investment) * 100
    : 0
  const isPositive = metrics.total_profit_loss >= 0

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Investment */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Investment</p>
          <p className="text-3xl font-bold text-gray-900">
            ${metrics.total_investment.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Current Value */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Current Value</p>
          <p className="text-3xl font-bold text-gray-900">
            ${metrics.current_value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Profit/Loss */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Profit/Loss</p>
          <div className="flex items-baseline gap-2">
            <p
              className={`text-3xl font-bold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}$
              {Math.abs(metrics.total_profit_loss).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <span
              className={`text-lg font-semibold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ({isPositive ? '+' : ''}
              {gainPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
