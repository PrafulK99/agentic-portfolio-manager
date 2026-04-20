import { useState } from 'react';
import { Card, Button, Badge } from '../components/common';
import { analyzeStock, executeTrade } from '../services/api';
import { Loader2, TrendingUp, TrendingDown, Target, Shield, Info, CheckCircle, AlertTriangle } from 'lucide-react';

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

export default function Analyze() {
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !amount) {
      setError('Please provide both symbol and amount.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setResult(null);

    try {
      const data = await analyzeStock(symbol, Number(amount));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing stock');
    } finally {
      setLoading(false);
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

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'BUY': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'SELL': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'HOLD': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis Hub</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Run AI-driven multi-agent analysis on any stock before trading
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700 dark:text-green-400">{successMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Run Analysis</h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  placeholder="e.g. AAPL"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>
              <Button
                disabled={loading || executing}
                className="w-full flex justify-center items-center py-2.5 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Stock'
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
          {!result && !loading && (
            <Card className="p-12 text-center bg-gray-50/50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center">
              <Target className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Awaiting Analysis</h3>
              <p className="text-gray-500 max-w-sm">
                Enter a stock symbol and amount to see multi-agent market insights, risk assessment, and AI-driven recommendations.
              </p>
            </Card>
          )}

          {loading && (
             <Card className="p-12 flex flex-col items-center justify-center min-h-75 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
               <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
               <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">Running multi-agent analysis...</p>
             </Card>
          )}

          {result && (
            <div className="space-y-6">
              {/* Decision Header Card */}
              <Card className="p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{result.market_analysis.symbol}</h2>
                      <span className="text-xl text-gray-500">${result.market_analysis.current_price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Overall Confidence: </span>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${result.decision.confidence * 100}%` }}
                          />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{(result.decision.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-6 py-3 rounded-xl border ${getDecisionColor(result.decision.decision)}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">AI Decision</p>
                    <p className="text-3xl font-black">{result.decision.decision}</p>
                  </div>
                </div>
              </Card>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Market Analysis */}
                <Card className="p-5 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                  <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                    {result.market_analysis.trend === 'bullish' ? 
                      <TrendingUp className="text-green-500 mr-2" /> : 
                      <TrendingDown className="text-red-500 mr-2" />
                    }
                    <h3 className="font-bold text-lg">Market Analysis</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Trend</span>
                      <Badge variant={result.market_analysis.trend === 'bullish' ? 'success' : 'danger'}>
                        {result.market_analysis.trend.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Short MA</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-200">${result.market_analysis.short_ma.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Long MA</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-200">${result.market_analysis.long_ma.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>

                {/* Risk Analysis */}
                <Card className="p-5 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                  <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                    <Shield className="text-blue-500 mr-2" />
                    <h3 className="font-bold text-lg">Risk & Compliance</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Risk Level</span>
                      <Badge variant={result.risk_analysis.risk_level === 'high' ? 'danger' : result.risk_analysis.risk_level === 'medium' ? 'warning' : 'success'}>
                        {result.risk_analysis.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Compliance</span>
                      {result.compliance.is_compliant ? (
                        <span className="text-green-600 font-bold flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                          <CheckCircle className="w-4 h-4 mr-1"/> Passed
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold flex items-center bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                          <AlertTriangle className="w-4 h-4 mr-1"/> Failed
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Volatility</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-200">{(result.risk_analysis.volatility * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* AI Explanation Section */}
              <Card className="p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                  <Info className="text-purple-500 mr-2" />
                  <h3 className="font-bold text-lg">AI Explanation</h3>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 p-4 rounded-xl mb-6">
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-medium">
                    {result.decision.explanation.summary}
                  </p>
                </div>

                <div className="mb-6 bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Key Factors</h4>
                  <ul className="space-y-3">
                    {result.decision.explanation.factors.map((factor, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle className="text-purple-500 mr-3 h-5 w-5 shrink-0" />
                        <span className="leading-tight">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Execute Actions */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
                  <Button
                    onClick={handleExecute}
                    disabled={executing || result.decision.decision === 'REJECT'}
                    variant={result.decision.decision === 'SELL' ? 'danger' : 'primary'}
                    className="px-8 py-3 flex justify-center items-center font-bold text-base shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
                  >
                    {executing ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Executing...
                      </>
                    ) : (
                      `Execute ${result.decision.decision} for $${amount}`
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}