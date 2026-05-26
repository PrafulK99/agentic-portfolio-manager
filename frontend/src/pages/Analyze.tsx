import { useState, useEffect } from 'react';

interface AnalysisResult {
  market_analysis: {
    symbol: string;
    current_price: number;
    short_ma: number;
    long_ma: number;
    trend: 'bullish' | 'bearish';
    confidence: number;
  };
  risk_analysis: {
    symbol: string;
    volatility: number;
    risk_level: 'low' | 'medium' | 'high';
    suggested_allocation: number;
  };
  compliance: {
    is_compliant: boolean;
    adjusted_allocation: number;
    violations: string[];
    notes: string;
  };
  decision: {
    decision: 'BUY' | 'SELL' | 'HOLD' | 'REJECT';
    allocation: number;
    confidence: number;
    explanation: {
      summary: string;
      factors: string[];
      confidence: number;
    };
  };
}

type AgentStatus = 'idle' | 'processing' | 'completed';

interface AgentState {
  id: string;
  name: string;
  status: AgentStatus;
  progress: number;
}

export default function Analyze() {
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [agents, setAgents] = useState<AgentState[]>([
    { id: 'market', name: 'Market Agent', status: 'idle', progress: 0 },
    { id: 'analysis', name: 'Analysis Agent', status: 'idle', progress: 0 },
    { id: 'risk', name: 'Risk Agent', status: 'idle', progress: 0 },
    { id: 'compliance', name: 'Compliance Agent', status: 'idle', progress: 0 },
  ]);

  // Simulate agent processing workflow
  useEffect(() => {
    if (!isAnalyzing) return;

    const agentTimings = [
      { id: 'market', startDelay: 0, duration: 1000 },
      { id: 'analysis', startDelay: 400, duration: 1200 },
      { id: 'risk', startDelay: 800, duration: 900 },
      { id: 'compliance', startDelay: 1300, duration: 800 },
    ];

    const intervals: NodeJS.Timeout[] = [];

    agentTimings.forEach(({ id, startDelay, duration }) => {
      // Start processing
      const startTimeout = setTimeout(() => {
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === id ? { ...agent, status: 'processing', progress: 0 } : agent
          )
        );

        // Progress animation
        let elapsed = 0;
        const progressInterval = setInterval(() => {
          elapsed += 50;
          const progress = Math.min((elapsed / duration) * 100, 100);
          setAgents((prev) =>
            prev.map((agent) =>
              agent.id === id ? { ...agent, progress } : agent
            )
          );

          if (elapsed >= duration) {
            clearInterval(progressInterval);
            setAgents((prev) =>
              prev.map((agent) =>
                agent.id === id ? { ...agent, status: 'completed', progress: 100 } : agent
              )
            );
          }
        }, 50);

        intervals.push(progressInterval);
      }, startDelay);

      intervals.push(startTimeout as any);
    });

    return () => {
      intervals.forEach((interval) => clearTimeout(interval as any));
    };
  }, [isAnalyzing]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !amount) {
      setError('Please provide both symbol and amount.');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setShowResults(false);
    setResult(null);

    // Reset agents
    setAgents((prev) =>
      prev.map((agent) => ({ ...agent, status: 'idle', progress: 0 }))
    );

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.toUpperCase(), amount: parseFloat(amount) }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze stock');
      }

      const data = await response.json();
      setResult(data);

      // Show results after agents finish processing (3 seconds total)
      setTimeout(() => {
        setShowResults(true);
        setIsAnalyzing(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing stock');
      setIsAnalyzing(false);
    }
  };

  const decisionColors = {
    BUY: { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
    SELL: { bg: 'bg-error-container', text: 'text-on-error-container' },
    HOLD: { bg: 'bg-primary-container', text: 'text-on-primary-container' },
    REJECT: { bg: 'bg-surface-container', text: 'text-on-surface' },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Analyze Stock</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Use AI-powered agents to analyze any stock</p>
      </div>

      {/* Input Section */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Symbol Input */}
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Stock Symbol</label>
              <input
                type="text"
                placeholder="e.g., AAPL, GOOGL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant"
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Investment Amount ($)</label>
              <input
                type="number"
                placeholder="e.g., 1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant"
                min="1"
                step="0.01"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-3 rounded-lg hover:bg-primary/90 disabled:bg-primary/50 transition-colors"
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-error-container/10 border border-error rounded-lg flex gap-3">
            <span className="material-symbols-outlined text-error shrink-0">error</span>
            <p className="font-body-sm text-error">{error}</p>
          </div>
        )}
      </div>

      {/* Agent Processing Section */}
      {isAnalyzing && (
        <div className="space-y-4 animate-in fade-in">
          <div className="text-center mb-6">
            <h3 className="font-headline-lg-mobile font-semibold text-on-surface mb-2">AI Agents Analyzing...</h3>
            <p className="font-body-sm text-on-surface-variant">Running multi-agent workflow</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-label-caps text-label-caps font-semibold text-on-surface">{agent.name}</h4>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      agent.status === 'idle'
                        ? 'bg-surface-variant'
                        : agent.status === 'processing'
                          ? 'bg-primary animate-pulse'
                          : 'bg-secondary'
                    }`}
                  />
                </div>
                <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      agent.status === 'idle'
                        ? 'bg-surface-variant'
                        : agent.status === 'processing'
                          ? 'bg-primary'
                          : 'bg-secondary'
                    }`}
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
                <p className="font-body-sm text-on-surface-variant mt-2 text-right">
                  {agent.status === 'idle'
                    ? 'Waiting...'
                    : agent.status === 'processing'
                      ? `Processing... ${Math.round(agent.progress)}%`
                      : 'Completed'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {showResults && result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Decision Card */}
          <div className={`${decisionColors[result.decision.decision].bg} ${decisionColors[result.decision.decision].text} rounded-xl p-8 border border-outline-variant/30`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-label-caps text-label-caps opacity-75">RECOMMENDATION</p>
                <h3 className="font-display-lg text-display-lg font-bold">{result.decision.decision}</h3>
              </div>
              <div className="text-right">
                <p className="font-label-caps text-label-caps opacity-75">Confidence</p>
                <p className="font-display-lg text-display-lg font-bold">{(result.decision.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
            <p className="font-body-md text-body-md">{result.market_analysis.symbol} @ ${result.market_analysis.current_price.toFixed(2)}</p>
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Market Analysis */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">trending_up</span>
                <h4 className="font-headline-lg-mobile font-semibold text-on-surface">Market Analysis</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant">Trend</span>
                  <span className="font-body-sm font-bold text-on-surface capitalize">{result.market_analysis.trend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant">Current Price</span>
                  <span className="font-body-sm font-bold text-on-surface">${result.market_analysis.current_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant">Confidence</span>
                  <span className="font-body-sm font-bold text-on-surface">{(result.market_analysis.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-error">warning</span>
                <h4 className="font-headline-lg-mobile font-semibold text-on-surface">Risk Analysis</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant">Risk Level</span>
                  <span className="font-body-sm font-bold text-on-surface capitalize">{result.risk_analysis.risk_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant">Volatility</span>
                  <span className="font-body-sm font-bold text-on-surface">{(result.risk_analysis.volatility * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant">Suggested Allocation</span>
                  <span className="font-body-sm font-bold text-on-surface">${result.risk_analysis.suggested_allocation.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Check */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified</span>
                <h4 className="font-headline-lg-mobile font-semibold text-on-surface">Compliance Check</h4>
              </div>
              <div className={`px-3 py-1 rounded-full text-label-caps font-label-caps ${result.compliance.is_compliant ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                {result.compliance.is_compliant ? 'Compliant' : 'Non-Compliant'}
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-body-sm text-on-surface">{result.compliance.notes}</p>
              {result.compliance.violations.length > 0 && (
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Violations:</p>
                  <ul className="space-y-1">
                    {result.compliance.violations.map((v, i) => (
                      <li key={i} className="font-body-sm text-on-surface-variant">• {v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h4 className="font-headline-lg-mobile font-semibold text-on-surface">AI Explanation</h4>
            </div>
            <div className="space-y-4">
              <p className="font-body-md text-on-surface">{result.decision.explanation.summary}</p>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Key Factors:</p>
                <ul className="space-y-2">
                  {result.decision.explanation.factors.map((factor, i) => (
                    <li key={i} className="flex gap-2 font-body-sm text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check_circle</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isAnalyzing && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 shadow-sm text-center">
          <span className="material-symbols-outlined text-outline inline-block text-[48px] mb-4">search</span>
          <h3 className="font-headline-lg-mobile font-semibold text-on-surface mb-2">No Analysis Yet</h3>
          <p className="font-body-md text-on-surface-variant">Enter a stock symbol and amount to get started</p>
        </div>
      )}
    </div>
  );
}
