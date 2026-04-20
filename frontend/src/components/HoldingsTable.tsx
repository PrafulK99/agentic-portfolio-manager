import { Link } from 'react-router-dom'
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
    <Card className="p-6 mb-6 overflow-x-auto border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Holdings</h2>       

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Symbol</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Quantity</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Entry Price</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
              Current Price
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Profit/Loss</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
              Allocation
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {holdings.map((holding, index) => {
            const isPositive = holding.profit_loss >= 0
            const gainPercentage =
              holding.entry_price > 0
                ? ((holding.current_price - holding.entry_price) / holding.entry_price) * 100
                : 0

            return (
              <tr
                key={`${holding.symbol}-${index}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors group cursor-pointer"
              >
                <td className="py-4 px-4 w-1 flex flex-col justify-center align-middle">
                  <Link to={`/portfolio/${holding.symbol}`}>
                    <Badge variant="info" className="group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors group-hover:text-blue-800 dark:group-hover:text-blue-300 transform group-hover:scale-105 inline-block">
                      {holding.symbol}
                    </Badge>
                  </Link>
                </td>
                <td className="text-right py-4 px-4 text-gray-900 dark:text-gray-200 font-medium"> 
                  {holding.quantity.toFixed(4)}
                </td>
                <td className="text-right py-4 px-4 text-gray-900 dark:text-gray-200">
                  ${holding.entry_price.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4 text-gray-900 dark:text-gray-200 font-medium"> 
                  ${holding.current_price.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4">
                  <div className="flex flex-col items-end">
                    <span className={`font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isPositive ? '+' : ''}${Math.abs(holding.profit_loss).toFixed(2)}
                    </span>
                    <span className={`text-xs ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ({isPositive ? '+' : ''}
                      {gainPercentage.toFixed(2)}%)
                    </span>
                  </div>
                </td>
                <td className="text-right py-4 px-4 text-gray-900 dark:text-gray-200">
                  {(holding.allocation * 100).toFixed(1)}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {holdings.length === 0 && (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 mt-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
          <p>No holdings yet. Start by adding a position.</p>
        </div>
      )}
    </Card>
  )
}
