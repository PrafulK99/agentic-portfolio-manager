import { useState, useEffect } from 'react';

interface Holding {
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  profit_loss: number;
  allocation: number;
}

interface PortfolioMetrics {
  total_investment: number;
  current_value: number;
  total_profit_loss: number;
}

interface PortfolioData {
  holdings: Holding[];
  metrics: PortfolioMetrics;
}

export function Dashboard() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://127.0.0.1:8000/api/portfolio');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        const data = await response.json();
        setPortfolioData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching portfolio');
        setPortfolioData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const calculateYTD = (metrics: PortfolioMetrics): number => {
    if (metrics.total_investment === 0) return 0;
    return (metrics.total_profit_loss / metrics.total_investment) * 100;
  };

  const getProfitLossColor = (value: number): string => {
    if (value > 0) return 'text-secondary';
    if (value < 0) return 'text-error';
    return 'text-on-surface-variant';
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Portfolio Dashboard</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Monitor your investments with AI-powered insights</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 shadow-sm text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-container rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-surface-container rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Portfolio Dashboard</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Monitor your investments with AI-powered insights</p>
        </div>
        <div className="bg-error-container border border-error rounded-xl p-6 shadow-sm">
          <p className="font-body-md text-on-error-container">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!portfolioData || portfolioData.holdings.length === 0) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Portfolio Dashboard</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Monitor your investments with AI-powered insights</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 shadow-sm text-center">
          <span className="material-symbols-outlined text-outline inline-block text-[64px] mb-4 opacity-40">account_balance_wallet</span>
          <h3 className="font-headline-lg-mobile font-semibold text-on-surface mb-2">No Portfolio Data</h3>
          <p className="font-body-md text-on-surface-variant mb-6">Get started by analyzing your first stock using the Analyze Stock page</p>
          <a
            href="/analyze"
            className="inline-block bg-primary text-on-primary font-label-caps text-label-caps px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Analyze a Stock
          </a>
        </div>
      </div>
    );
  }

  const metrics = portfolioData.metrics;
  const ytdReturn = calculateYTD(metrics);
  const ytdColor = getProfitLossColor(ytdReturn);
  const plColor = getProfitLossColor(metrics.total_profit_loss);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Portfolio Dashboard</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Your portfolio performance at a glance</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Portfolio Value (Large Card) */}
        <div className="col-span-1 md:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Total Portfolio Value</p>
              <h3 className="font-display-lg text-display-lg font-bold text-on-surface">₹{metrics.current_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
            </div>
            <div className={`${ytdColor} px-3 py-1 rounded-full flex items-center gap-1 font-label-caps text-label-caps`}>
              <span className="material-symbols-outlined text-[16px]">{ytdReturn >= 0 ? 'trending_up' : 'trending_down'}</span>
              {ytdReturn >= 0 ? '+' : ''}{ytdReturn.toFixed(2)}%
            </div>
          </div>
          <div className="text-sm text-on-surface-variant">
            <p>Total Invested: ₹{metrics.total_investment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Profit/Loss & Stats */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-gutter">
          {/* Profit/Loss */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex-1">
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Total Profit/Loss</p>
            <div className="flex items-baseline gap-2">
              <span className={`font-headline-lg text-headline-lg font-bold ${plColor}`}>
                {metrics.total_profit_loss >= 0 ? '+' : ''}₹{metrics.total_profit_loss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Holdings Count */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex-1 flex items-center justify-between">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Holdings</p>
              <p className="font-display-lg text-display-lg font-bold text-on-surface mt-1">{portfolioData.holdings.length}</p>
            </div>
            <span className="material-symbols-outlined text-primary text-[32px]">portfolio</span>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="col-span-1 md:col-span-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-headline-lg-mobile font-semibold text-on-surface mb-4">Your Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="text-left py-3 px-4 font-label-caps text-on-surface-variant">Symbol</th>
                  <th className="text-right py-3 px-4 font-label-caps text-on-surface-variant">Quantity</th>
                  <th className="text-right py-3 px-4 font-label-caps text-on-surface-variant">Entry Price</th>
                  <th className="text-right py-3 px-4 font-label-caps text-on-surface-variant">Current Price</th>
                  <th className="text-right py-3 px-4 font-label-caps text-on-surface-variant">Profit/Loss</th>
                  <th className="text-right py-3 px-4 font-label-caps text-on-surface-variant">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.holdings.map((holding) => (
                  <tr key={holding.symbol} className="border-b border-outline-variant/20 hover:bg-surface-container-highest transition-colors">
                    <td className="py-3 px-4 font-body-md text-on-surface font-semibold">{holding.symbol}</td>
                    <td className="py-3 px-4 text-right font-body-sm text-on-surface">{holding.quantity.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right font-body-sm text-on-surface">₹{holding.entry_price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-body-sm text-on-surface">₹{holding.current_price.toFixed(2)}</td>
                    <td className={`py-3 px-4 text-right font-body-sm font-semibold ${getProfitLossColor(holding.profit_loss)}`}>
                      {holding.profit_loss >= 0 ? '+' : ''}₹{holding.profit_loss.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-body-sm text-on-surface">{(holding.allocation * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}