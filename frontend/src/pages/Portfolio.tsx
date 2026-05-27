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

export default function Portfolio() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

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

  const getProfitLossColor = (value: number): string => {
    if (value > 0) return 'text-secondary';
    if (value < 0) return 'text-error';
    return 'text-on-surface-variant';
  };

  const getProfitLossBg = (value: number): string => {
    if (value > 0) return 'bg-secondary/10';
    if (value < 0) return 'bg-error/10';
    return 'bg-surface-container';
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">My Portfolio</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">View and manage all your holdings</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-container rounded"></div>
            <div className="h-4 bg-surface-container rounded"></div>
            <div className="h-4 bg-surface-container rounded"></div>
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
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">My Portfolio</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">View and manage all your holdings</p>
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
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">My Portfolio</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">View and manage all your holdings</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 shadow-sm text-center">
          <span className="material-symbols-outlined text-outline inline-block text-[64px] mb-4 opacity-40">portfolio</span>
          <h3 className="font-headline-lg-mobile font-semibold text-on-surface mb-2">Empty Portfolio</h3>
          <p className="font-body-md text-on-surface-variant mb-6">Start by analyzing stocks and building your portfolio</p>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">My Portfolio</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">View and manage all your holdings</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Total Invested */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="font-label-caps text-label-caps text-on-surface-variant">Total Invested</p>
            <span className="material-symbols-outlined text-primary">trending_up</span>
          </div>
          <h3 className="font-display-lg text-display-lg font-bold text-on-surface">₹{metrics.total_investment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
        </div>

        {/* Current Value */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="font-label-caps text-label-caps text-on-surface-variant">Current Value</p>
            <span className="material-symbols-outlined text-secondary">show_chart</span>
          </div>
          <h3 className="font-display-lg text-display-lg font-bold text-on-surface">₹{metrics.current_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
        </div>

        {/* Total Gain/Loss */}
        <div className={`${getProfitLossBg(metrics.total_profit_loss)} border border-outline-variant/30 rounded-xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-label-caps text-label-caps text-on-surface-variant">Total Profit/Loss</p>
            <span className={`material-symbols-outlined ${getProfitLossColor(metrics.total_profit_loss)}`}>
              {metrics.total_profit_loss >= 0 ? 'trending_up' : 'trending_down'}
            </span>
          </div>
          <h3 className={`font-display-lg text-display-lg font-bold ${getProfitLossColor(metrics.total_profit_loss)}`}>
            {metrics.total_profit_loss >= 0 ? '+' : ''}₹{metrics.total_profit_loss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </h3>
          <p className={`font-label-caps text-label-caps mt-1 ${getProfitLossColor(metrics.total_profit_loss)}`}>
            {((metrics.total_profit_loss / metrics.total_investment) * 100).toFixed(2)}% Return
          </p>
        </div>
      </div>

      {/* Holdings Grid */}
      <div className="space-y-4">
        <h3 className="font-headline-lg-mobile font-semibold text-on-surface">Holdings ({portfolioData.holdings.length})</h3>
        <div className="grid grid-cols-1 gap-4">
          {portfolioData.holdings.map((holding) => (
            <div
              key={holding.symbol}
              onClick={() => setSelectedHolding(selectedHolding?.symbol === holding.symbol ? null : holding)}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-headline-lg-mobile font-bold text-on-surface">{holding.symbol}</h4>
                    <span className="font-body-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                      {(holding.allocation * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant">
                    {holding.quantity.toFixed(4)} units @ ₹{holding.current_price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-headline-lg font-bold ${getProfitLossColor(holding.profit_loss)}`}>
                    {holding.profit_loss >= 0 ? '+' : ''}₹{holding.profit_loss.toFixed(2)}
                  </p>
                  <p className={`font-body-sm font-semibold ${getProfitLossColor(holding.profit_loss)}`}>
                    {((holding.profit_loss / (holding.entry_price * holding.quantity)) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedHolding?.symbol === holding.symbol && (
                <div className="border-t border-outline-variant/20 pt-4 mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">Entry Price</p>
                      <p className="font-body-md font-semibold text-on-surface">₹{holding.entry_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">Current Price</p>
                      <p className="font-body-md font-semibold text-on-surface">₹{holding.current_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">Total Cost</p>
                      <p className="font-body-md font-semibold text-on-surface">₹{(holding.entry_price * holding.quantity).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">Current Value</p>
                      <p className="font-body-md font-semibold text-on-surface">₹{(holding.current_price * holding.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="font-body-sm text-on-surface">
                      Click to {selectedHolding ? 'collapse' : 'expand'} details
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Allocation Breakdown */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <h3 className="font-headline-lg-mobile font-semibold text-on-surface mb-4">Allocation Breakdown</h3>
        <div className="space-y-3">
          {portfolioData.holdings.map((holding) => (
            <div key={holding.symbol} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-body-sm text-on-surface-variant mb-1">{holding.symbol}</p>
                <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${holding.allocation * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="font-body-sm font-semibold text-on-surface w-12 text-right">
                {(holding.allocation * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
