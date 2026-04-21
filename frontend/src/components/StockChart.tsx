import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from './common'
import { 
  fetchStockChartData, 
  calculatePriceChange, 
  formatPrice,
  formatPriceChange,
  getCurrencySymbol,
  type StockDataWithCurrency
} from '../services/stockChart'

interface StockChartProps {
  symbol: string
  height?: number
}

interface ChartData {
  date: string
  close: number
}

export function StockChart({ symbol, height = 300 }: StockChartProps) {
  const [stockData, setStockData] = useState<StockDataWithCurrency | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchStockChartData(symbol)
        if (data.data.length === 0) {
          setError('No data available for this symbol')
        } else {
          setStockData(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (symbol) {
      loadChartData()
    }
  }, [symbol])

  if (loading) {
    return (
      <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Fetching market data...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (error || !stockData || stockData.data.length === 0) {
    return (
      <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-600 text-sm font-semibold mb-2">{error || 'Unable to load chart data'}</p>
            <p className="text-gray-500 text-xs">Please check the symbol and try again</p>
          </div>
        </div>
      </Card>
    )
  }

  const chartData = stockData.data
  const priceChange = calculatePriceChange(chartData)
  const isPositive = priceChange.change >= 0
  const currentPrice = stockData.currentPrice
  const currency = stockData.currency
  const currencySymbol = getCurrencySymbol(currency)

  return (
    <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{stockData.symbol}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600 text-sm">30-Day Price History</p>
              <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                {currency}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(currentPrice, currency)}
            </p>
            <p
              className={`text-sm font-semibold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPriceChange(priceChange.change, priceChange.changePercent, currency)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Data source: yfinance</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            style={{ overflow: 'visible' }}
            interval={Math.floor(chartData.length / 5)}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            domain={['dataMin - 5', 'dataMax + 5']}
            label={{ value: `Price (${currencySymbol})`, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => formatPrice(value, currency)}
            labelFormatter={(label: string) => `Date: ${label}`}
          />
          <Legend wrapperStyle={{ paddingTop: '1rem' }} />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            name={`Close Price (${currencySymbol})`}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
