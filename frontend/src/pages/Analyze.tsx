import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Badge } from '../components/common';
import { analyzeStock, executeTrade } from '../services/api';
import { AgentStatusPanel, type Agent, type AgentStatus } from '../components/AgentStatusPanel';
import { simulateMultiAgentWorkflow, getTotalWorkflowTime, type AgentConfig } from '../utils/agentSimulator';
import { 
  Loader2, TrendingUp, TrendingDown, Target, Shield, Info, CheckCircle, AlertTriangle,
  BarChart3, Brain, Zap, Lock, ChevronRight, Sparkles
} from 'lucide-react';

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

// ─── Agent Status Card ────────────────────────────────────────────────────
// Now imported from AgentStatusPanel component instead


// ─── Risk Gauge ──────────────────────────────────────────────────────────

function RiskGauge({ level, volatility }: { level: 'low' | 'medium' | 'high'; volatility: number }) {
  const colors = {
    low: { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-400' },
    medium: { bg: 'from-amber-500 to-amber-600', text: 'text-amber-400' },
    high: { bg: 'from-red-500 to-red-600', text: 'text-red-400' },
  };

  const fillWidth = {
    low: 33,
    medium: 66,
    high: 100,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Risk Level</p>
          <p className={`text-2xl font-black ${colors[level].text}`}>{level.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Volatility</p>
          <p className="text-lg font-bold text-slate-200">{(volatility * 100).toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="relative h-3 rounded-full bg-slate-800/50 border border-white/10 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${colors[level].bg} rounded-full transition-all duration-500`}
          style={{ width: `${fillWidth[level]}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-slate-500">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}

// ─── Insight Card ────────────────────────────────────────────────────────

function InsightCard({
  icon: Icon,
  title,
  subtitle,
  children,
  className = ''
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-lg hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 ${className}`}>
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-50">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Result Summary Card ─────────────────────────────────────────────────

function ResultSummaryCard({ result }: { result: AnalysisResult }) {
  const decisionConfig = {
    BUY: {
      gradient: 'from-emerald-600 to-emerald-700',
      glow: 'shadow-emerald-500/20',
      textColor: 'text-emerald-100',
      badge: 'bg-emerald-500/20 border-emerald-500/30'
    },
    SELL: {
      gradient: 'from-red-600 to-red-700',
      glow: 'shadow-red-500/20',
      textColor: 'text-red-100',
      badge: 'bg-red-500/20 border-red-500/30'
    },
    HOLD: {
      gradient: 'from-blue-600 to-blue-700',
      glow: 'shadow-blue-500/20',
      textColor: 'text-blue-100',
      badge: 'bg-blue-500/20 border-blue-500/30'
    },
    REJECT: {
      gradient: 'from-slate-600 to-slate-700',
      glow: 'shadow-slate-500/20',
      textColor: 'text-slate-100',
      badge: 'bg-slate-500/20 border-slate-500/30'
    }
  };

  const config = decisionConfig[result.decision.decision];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} p-8 border border-white/20 shadow-2xl ${config.glow}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse" />
      </div>

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-black tracking-tight">{result.market_analysis.symbol}</h2>
              <span className="text-2xl font-bold opacity-90">${result.market_analysis.current_price.toFixed(2)}</span>
            </div>
            <p className={`text-sm font-medium opacity-90 ${config.textColor}`}>
              AI-Powered Investment Analysis
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-2">Confidence</p>
            <p className="text-3xl font-black">{(result.decision.confidence * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/20">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-3">Recommendation</p>
          <p className="text-5xl font-black tracking-tighter">{result.decision.decision}</p>
        </div>
      </div>
    </div>
  );
}

export default function Analyze() {
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Agent status management
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({
    'data-agent': 'idle',
    'analysis-agent': 'idle',
    'risk-agent': 'idle',
    'strategy-agent': 'idle',
  });
  
  const workflowControllerRef = useRef<AbortController | null>(null);

  // Create agents array for display
  const agents: Agent[] = [
    {
      id: 'data-agent',
      name: 'Data Agent',
      icon: BarChart3,
      status: agentStatuses['data-agent'],
      message: 'Gathering market data and technical indicators'
    },
    {
      id: 'analysis-agent',
      name: 'Analysis Agent',
      icon: Brain,
      status: agentStatuses['analysis-agent'],
      message: 'Analyzing trends and patterns'
    },
    {
      id: 'risk-agent',
      name: 'Risk Agent',
      icon: Shield,
      status: agentStatuses['risk-agent'],
      message: 'Calculating volatility and risk metrics'
    },
    {
      id: 'strategy-agent',
      name: 'Strategy Agent',
      icon: Zap,
      status: agentStatuses['strategy-agent'],
      message: 'Synthesizing recommendation'
    },
  ];

  // Define agent workflow configuration
  const agentConfig: AgentConfig[] = [
    { id: 'data-agent', name: 'Data Agent', delay: 0, duration: 1000, message: '' },
    { id: 'analysis-agent', name: 'Analysis Agent', delay: 400, duration: 1500, message: '' },
    { id: 'risk-agent', name: 'Risk Agent', delay: 800, duration: 1000, message: '' },
    { id: 'strategy-agent', name: 'Strategy Agent', delay: 1200, duration: 1000, message: '' },
  ];

  // Handle agent status updates during workflow
  const handleAgentStatusUpdate = useCallback((agentId: string, status: AgentStatus) => {
    setAgentStatuses((prev) => ({
      ...prev,
      [agentId]: status,
    }));
  }, []);

  // Simulate multi-agent workflow
  const simulateWorkflow = useCallback(() => {
    // Cancel any existing workflow
    if (workflowControllerRef.current) {
      workflowControllerRef.current.abort();
    }

    // Reset agent statuses to idle
    setAgentStatuses({
      'data-agent': 'idle',
      'analysis-agent': 'idle',
      'risk-agent': 'idle',
      'strategy-agent': 'idle',
    });

    // Create new workflow simulation
    const controller = simulateMultiAgentWorkflow(
      agentConfig,
      handleAgentStatusUpdate
    );
    workflowControllerRef.current = controller;

    // Calculate when workflow will complete
    const workflowTime = getTotalWorkflowTime(agentConfig);

    // Automatically show results after workflow completes
    setTimeout(() => {
      if (!controller.signal.aborted) {
        setShowResults(true);
        setIsAnalyzing(false);
      }
    }, workflowTime);
  }, [agentConfig, handleAgentStatusUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (workflowControllerRef.current) {
        workflowControllerRef.current.abort();
      }
    };
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !amount) {
      setError('Please provide both symbol and amount.');
      return;
    }

    // Reset state
    setError('');
    setSuccessMsg('');
    setResult(null);
    setShowResults(false);
    setIsAnalyzing(true);

    try {
      // Start multi-agent workflow simulation
      simulateWorkflow();

      // Fetch analysis data in parallel (don't wait for workflow animation)
      const data = await analyzeStock(symbol, Number(amount));
      
      // Store result but don't show yet - wait for workflow to complete
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing stock');
      setIsAnalyzing(false);
      if (workflowControllerRef.current) {
        workflowControllerRef.current.abort();
      }
    }
  };

  const handleExecute = async () => {
    if (!result || !symbol || !amount) return;

    setExecuting(true);
    setError('');
    setSuccessMsg('');

    try {
      await executeTrade(symbol, Number(amount));
      setSuccessMsg(`Successfully executed ${result.decision.decision} for ${symbol}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error executing trade');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI-Powered Analysis
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
              Multi-Agent Stock Analysis
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Real-time insights from market data, risk analysis, compliance, and strategy agents
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4 mb-12">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Symbol Input */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-300" />
                  <input
                    type="text"
                    placeholder="Stock Symbol (e.g., AAPL)"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="relative w-full px-5 py-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 text-sm font-medium"
                    required
                  />
                </div>

                {/* Amount Input */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-300" />
                  <input
                    type="number"
                    placeholder="Investment Amount ($)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    className="relative w-full px-5 py-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || executing}
                className="w-full relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-100 group-hover:opacity-110 transition-all duration-300" />
                <div className="relative flex items-center justify-center gap-2 py-3.5">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Run Analysis</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </div>
              </Button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-emerald-400">{successMsg}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Agent Processing State */}
          {isAnalyzing && (
            <div className="animate-in fade-in duration-500">
              <AgentStatusPanel agents={agents} isProcessing={isAnalyzing} />
            </div>
          )}

          {/* Empty State */}
          {!result && !isAnalyzing && (
            <div className="text-center py-20">
              <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <Target className="w-12 h-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                Enter a stock symbol and investment amount to get AI-driven insights from our multi-agent system
              </p>
            </div>
          )}

          {/* Results */}
          {result && showResults && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Result Summary */}
              <ResultSummaryCard result={result} />

              {/* Main Insights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Market & Risk */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Market Analysis */}
                  <InsightCard
                    icon={result.market_analysis.trend === 'bullish' ? TrendingUp : TrendingDown}
                    title="Market Analysis"
                    subtitle="Technical indicators & trend analysis"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Trend Direction</span>
                        <Badge
                          variant={result.market_analysis.trend === 'bullish' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {result.market_analysis.trend === 'bullish' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {result.market_analysis.trend.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                          <p className="text-xs text-slate-500 mb-1">Short MA</p>
                          <p className="text-lg font-bold text-slate-200">${result.market_analysis.short_ma.toFixed(2)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                          <p className="text-xs text-slate-500 mb-1">Long MA</p>
                          <p className="text-lg font-bold text-slate-200">${result.market_analysis.long_ma.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </InsightCard>

                  {/* Risk Analysis */}
                  <InsightCard
                    icon={Shield}
                    title="Risk Assessment"
                    subtitle="Volatility & exposure analysis"
                  >
                    <RiskGauge level={result.risk_analysis.risk_level} volatility={result.risk_analysis.volatility} />
                  </InsightCard>
                </div>

                {/* Right Column - Compliance & Summary */}
                <div className="space-y-6">
                  {/* Compliance Status */}
                  <InsightCard
                    icon={Lock}
                    title="Compliance Check"
                    subtitle="Regulatory verification"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                        <span className="text-xs font-medium text-slate-400">Status</span>
                        {result.compliance.is_compliant ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">Passed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-bold text-red-400">Failed</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                        <p className="text-xs text-slate-500 mb-1">Adjusted Allocation</p>
                        <p className="text-lg font-bold text-slate-200">{(result.compliance.adjusted_allocation * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </InsightCard>

                  {/* Allocation Summary */}
                  <InsightCard
                    icon={Target}
                    title="Suggested Allocation"
                    subtitle="Position sizing"
                  >
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm font-bold text-blue-300 mb-2">Recommended Amount</p>
                      <p className="text-2xl font-black text-white">${(Number(amount) * result.decision.allocation).toFixed(2)}</p>
                      <p className="text-xs text-blue-300/70 mt-2">{(result.decision.allocation * 100).toFixed(0)}% of portfolio</p>
                    </div>
                  </InsightCard>
                </div>
              </div>

              {/* AI Explanation */}
              <InsightCard
                icon={Brain}
                title="AI Analysis Explanation"
                subtitle="Reasoning behind the recommendation"
              >
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-300">
                    {result.decision.explanation.summary}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Key Factors</p>
                    <div className="space-y-2">
                      {result.decision.explanation.factors.map((factor, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10">
                          <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </InsightCard>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={handleExecute}
                  disabled={executing || result.decision.decision === 'REJECT'}
                  className="flex-1 relative group overflow-hidden"
                >
                  <div className={`absolute inset-0 ${
                    result.decision.decision === 'SELL' 
                      ? 'bg-red-600 group-hover:bg-red-500' 
                      : 'bg-gradient-to-r from-emerald-600 to-blue-600 group-hover:from-emerald-500 group-hover:to-blue-500'
                  } opacity-100 transition-all duration-300`} />
                  <div className="relative flex items-center justify-center gap-2 py-3.5 font-semibold">
                    {executing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Execute {result.decision.decision}
                      </>
                    )}
                  </div>
                </Button>

                <Button
                  onClick={() => {
                    setResult(null);
                    setShowResults(false);
                    setSymbol('');
                    setAmount('');
                  }}
                  className="flex-1 relative group overflow-hidden bg-slate-800/50 border border-white/10 text-white hover:bg-slate-700/50 hover:border-white/20"
                >
                  <div className="flex items-center justify-center gap-2 font-semibold">
                    New Analysis
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}