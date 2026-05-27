import { useState, useEffect } from 'react';

interface TradeHistory {
  id: string;
  symbol: string;
  investment_amount: number;
  decision: 'BUY' | 'SELL' | 'HOLD' | 'REJECT';
  confidence: number;
  explanation_summary: string | null;
  explanation_detailed: string | null;
  market_trend: string | null;
  risk_level: string | null;
  is_executed: string;
  created_at: string;
}

interface HistoryResponse {
  trades: TradeHistory[];
  total: number;
}

export default function History() {
  const [trades, setTrades] = useState<TradeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('');
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = 'http://127.0.0.1:8000/api/history?limit=200';
        if (filterSymbol) {
          url += `&symbol=${filterSymbol.toUpperCase()}`;
        }
        if (filterDecision) {
          url += `&decision=${filterDecision}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch trade history');
        }
        const data: HistoryResponse = await response.json();
        setTrades(data.trades);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching history');
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [filterSymbol, filterDecision]);

  const getDecisionColor = (decision: string): string => {
    switch (decision) {
      case 'BUY':
        return 'bg-secondary/10 border-secondary/20 text-secondary';
      case 'SELL':
        return 'bg-error/10 border-error/20 text-error';
      case 'HOLD':
        return 'bg-primary/10 border-primary/20 text-primary';
      case 'REJECT':
        return 'bg-outline-variant/10 border-outline-variant/20 text-on-surface-variant';
      default:
        return 'bg-surface-container';
    }
  };

  const getRiskColor = (risk: string | null): string => {
    if (!risk) return 'text-on-surface-variant';
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-secondary';
      case 'medium':
        return 'text-primary';
      case 'high':
        return 'text-error';
      default:
        return 'text-on-surface-variant';
    }
  };

  const getTrendIcon = (trend: string | null): string => {
    if (!trend) return 'trending_flat';
    return trend.toLowerCase() === 'bullish' ? 'trending_up' : 'trending_down';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Trade History</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">View all your analysis and trade decisions</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-container rounded"></div>
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
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Trade History</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">View all your analysis and trade decisions</p>
        </div>
        <div className="bg-error-container border border-error rounded-xl p-6 shadow-sm">
          <p className="font-body-md text-on-error-container">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Trade History</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">View all your analysis and trade decisions</p>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Filter by Symbol</label>
            <input
              type="text"
              placeholder="e.g., AAPL"
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant/30 rounded-lg bg-surface text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Filter by Decision</label>
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant/30 rounded-lg bg-surface text-on-surface focus:outline-none focus:border-primary/50"
            >
              <option value="">All Decisions</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
              <option value="HOLD">HOLD</option>
              <option value="REJECT">REJECT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {trades.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 shadow-sm text-center">
          <span className="material-symbols-outlined text-outline inline-block text-[64px] mb-4 opacity-40">history</span>
          <h3 className="font-headline-lg-mobile font-semibold text-on-surface mb-2">No Trade History</h3>
          <p className="font-body-md text-on-surface-variant">Start by analyzing stocks on the Analyze page</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="font-label-caps text-on-surface-variant">Total: {trades.length} analyses</p>
          {trades.map((trade) => (
            <div
              key={trade.id}
              onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)}
              className={`${getDecisionColor(trade.decision)} border rounded-xl p-6 shadow-sm cursor-pointer transition-all`}
            >
              {/* Main Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Symbol */}
                  <div className="flex items-center gap-2">
                    <span className="font-display-lg font-bold text-on-surface">{trade.symbol}</span>
                  </div>

                  {/* Decision Badge */}
                  <span className={`font-label-caps text-label-caps px-3 py-1 rounded-full border ${getDecisionColor(trade.decision)}`}>
                    {trade.decision}
                  </span>

                  {/* Confidence */}
                  <div className="hidden md:flex items-center gap-2">
                    <span className="font-body-sm text-on-surface-variant">Confidence:</span>
                    <div className="w-16 h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${trade.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-body-sm font-semibold text-on-surface min-w-fit">{(trade.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="text-right">
                  <p className="font-body-md font-semibold text-on-surface">₹{trade.investment_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  <p className="font-body-sm text-on-surface-variant text-xs">{formatDate(trade.created_at)}</p>
                </div>

                {/* Expand Icon */}
                <span className="material-symbols-outlined ml-4 transition-transform" style={{ transform: expandedTradeId === trade.id ? 'rotate(180deg)' : '' }}>
                  expand_more
                </span>
              </div>

              {/* Expanded Details */}
              {expandedTradeId === trade.id && (
                <div className="border-t border-current opacity-20 mt-6 pt-6 space-y-4">
                  {/* Risk & Trend */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">Risk Level</p>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${getRiskColor(trade.risk_level)}`}>
                          {trade.risk_level === 'low' ? 'shield' : trade.risk_level === 'high' ? 'warning' : 'info'}
                        </span>
                        <p className={`font-body-md font-semibold ${getRiskColor(trade.risk_level)}`}>
                          {trade.risk_level ? trade.risk_level.charAt(0).toUpperCase() + trade.risk_level.slice(1) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">Market Trend</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-on-surface">{getTrendIcon(trade.market_trend)}</span>
                        <p className="font-body-md font-semibold text-on-surface">
                          {trade.market_trend ? trade.market_trend.charAt(0).toUpperCase() + trade.market_trend.slice(1) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">Status</p>
                      <p className="font-body-md font-semibold text-on-surface">{trade.is_executed}</p>
                    </div>

                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">ID</p>
                      <p className="font-body-sm text-on-surface-variant font-mono truncate">{trade.id.slice(0, 8)}...</p>
                    </div>
                  </div>

                  {/* Summary & Detailed Explanation */}
                  {(trade.explanation_summary || trade.explanation_detailed) && (
                    <div className="border border-current opacity-20 rounded-lg p-4 space-y-3">
                      {trade.explanation_summary && (
                        <div>
                          <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">Summary</p>
                          <p className="font-body-md text-on-surface">{trade.explanation_summary}</p>
                        </div>
                      )}
                      {trade.explanation_detailed && (
                        <div>
                          <p className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-1">Detailed Analysis</p>
                          <p className="font-body-md text-on-surface leading-relaxed">{trade.explanation_detailed}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}