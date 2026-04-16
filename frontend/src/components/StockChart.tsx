import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from './common'
import { fetchStockChartData, calculatePriceChange, formatPrice } from '../services/stockChart'

interface StockChartProps {
  symbol: string
  height?: number
}

interface ChartData {
  date: string
  close: number
}

export function StockChart({ symbol, height = 300 }: StockChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true)
      setError(null)
      try {
        const chartData = await fetchStockChartData(symbol)
        if (chartData.length === 0) {
          setError('No data available')
        } else {
          setData(chartData)
        }
      } catch (err) {
        setError('Failed to load chart data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadChartData()
  }, [symbol])

  if (loading) {
    return (
      <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading chart data...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (error || data.length === 0) {
    return (
      <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-600 text-sm">{error || 'Unable to load chart data'}</p>
          </div>
        </div>
      </Card>
    )
  }

  const priceChange = calculatePriceChange(data)
  const isPositive = priceChange.change >= 0
  const currentPrice = data[data.length - 1].close

  return (
    <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{symbol}</h3>
            <p className="text-gray-600 text-sm">30-Day Price History</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatPrice(currentPrice)}</p>
            <p
              className={`text-sm font-semibold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}{formatPrice(priceChange.change)} ({isPositive ? '+' : ''}{priceChange.changePercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            style={{ overflow: 'visible' }}
            interval={Math.floor(data.length / 5)}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            domain={['dataMin - 5', 'dataMax + 5']}
            label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => formatPrice(value)}
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
            name="Close Price"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
