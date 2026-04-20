import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Activity, DollarSign, Briefcase, TrendingUp, TrendingDown, Clock, ArrowRightLeft } from 'lucide-react';
import { Card, Badge, Button } from '../components/common';
import { StockChart } from '../components/StockChart';
import { usePortfolio } from '../hooks/usePortfolio';

// Mock transaction history since the backend does not provide an endpoint for it yet
const generateMockTransactions = (symbol: string, currentPrice: number, entryPrice: number) => {
  return [
    { id: 1, type: 'BUY', date: '2026-04-18T10:30:00Z', shares: 15.5, price: currentPrice * 0.98, total: (15.5 * currentPrice * 0.98) },
    { id: 2, type: 'SELL', date: '2026-04-12T14:15:00Z', shares: 5.0, price: currentPrice * 1.05, total: (5.0 * currentPrice * 1.05) },
    { id: 3, type: 'BUY', date: '2026-04-05T09:45:00Z', shares: 20.0, price: entryPrice, total: (20.0 * entryPrice) },
  ];
};

export default function PortfolioDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const { portfolio, loading, error } = usePortfolio();

  const holding = portfolio?.holdings.find(h => h.symbol === symbol?.toUpperCase());
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <Card className="p-8 text-center text-red-500 border-red-200 bg-red-50">
          <h3 className="text-xl font-bold">Error Loading Portfolio</h3>
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  if (!holding) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center space-x-4 mb-2">
          <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase">{symbol} Not Found</h1>
        </div>
        <Card className="p-12 text-center border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <p className="text-gray-500">You don't currently hold any shares of {symbol?.toUpperCase()} in your portfolio.</p>
          <Link to="/analyze">
            <Button className="mt-6 inline-flex items-center">
              Analyze {symbol?.toUpperCase()} <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isPositive = holding.profit_loss >= 0;
  const gainPercentage = holding.entry_price > 0 
    ? ((holding.current_price - holding.entry_price) / holding.entry_price) * 100 
    : 0;

  const transactions = generateMockTransactions(holding.symbol, holding.current_price, holding.entry_price);

  return (
    <div className="flex flex-col h-full space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase">{holding.symbol}</h1>
              <Badge variant="info">{(holding.allocation * 100).toFixed(1)}% of Portfolio</Badge>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <Activity className="w-4 h-4 mr-1.5" /> Active Position
            </p>
          </div>
        </div>
        
        <Link to={`/analyze?symbol=${holding.symbol}`}>
          <Button variant="secondary" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
            Run AI Analysis
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Shares</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{holding.quantity.toFixed(4)}</p>
          </div>
        </Card>

        <Card className="p-5 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Cost</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${holding.entry_price.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="p-5 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mr-4">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Price</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${holding.current_price.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="p-5 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center">
          <div className={`p-3 rounded-xl mr-4 ${isPositive ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit / Loss</p>
            <div className="flex items-baseline space-x-2">
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}${Math.abs(holding.profit_loss).toFixed(2)}
              </p>
              <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                ({isPositive ? '+' : ''}{gainPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Chart Section */}
      <div className="mt-4">
        <StockChart symbol={holding.symbol} height={400} />
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Clock className="w-5 h-5 mr-2" /> Recent Transactions
        </h2>
        <Card className="overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Shares</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Price</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        tx.type === 'BUY' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                      {tx.shares.toFixed(4)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right">
                      ${tx.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                      ${tx.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <ArrowRightLeft className="w-3 h-3 mr-1" />
              *Mocked transaction history for UI demonstration
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}