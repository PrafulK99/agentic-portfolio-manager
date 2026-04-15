import { Card, Badge } from './common'

interface Holding {
  symbol: string
  quantity: number
  entry_price: number
  current_price: number
  profit_loss: number
  allocation: number
}

interface HoldingsTableProps {
  holdings: Holding[]
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <Card className="p-6 mb-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Holdings</h2>
      
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Symbol</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Quantity</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Entry Price</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
              Current Price
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Profit/Loss</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
              Allocation
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding, index) => {
            const isPositive = holding.profit_loss >= 0
            const gainPercentage =
              holding.entry_price > 0
                ? ((holding.current_price - holding.entry_price) / holding.entry_price) * 100
                : 0

            return (
              <tr
                key={`${holding.symbol}-${index}`}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <Badge variant="info">{holding.symbol}</Badge>
                </td>
                <td className="text-right py-4 px-4 text-gray-900 font-medium">
                  {holding.quantity.toFixed(4)}
                </td>
                <td className="text-right py-4 px-4 text-gray-900">
                  ${holding.entry_price.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4 text-gray-900 font-medium">
                  ${holding.current_price.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4">
                  <div className="flex flex-col items-end">
                    <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}${Math.abs(holding.profit_loss).toFixed(2)}
                    </span>
                    <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      ({isPositive ? '+' : ''}
                      {gainPercentage.toFixed(2)}%)
                    </span>
                  </div>
                </td>
                <td className="text-right py-4 px-4 text-gray-900">
                  {(holding.allocation * 100).toFixed(1)}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {holdings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No holdings yet. Start by adding a position.</p>
        </div>
      )}
    </Card>
  )
}
