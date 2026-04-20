import { useState, useEffect } from 'react';
import { Card } from '../components/common';
import { getDecisionHistory } from '../services/api';
import { Filter, Search, Calendar, ChevronDown, AlertTriangle, Target } from 'lucide-react';

interface Decision {
  id: string;
  symbol: string;
  decision: 'BUY' | 'SELL' | 'HOLD' | 'REJECT';
  confidence: number;
  reason: string;
  timestamp: string;
}

export default function History() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDecisionHistory();
        setDecisions(data as Decision[]);
      } catch (err) {
        setError('Failed to fetch decision history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'BUY': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'SELL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'HOLD': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const filteredDecisions = decisions.filter(d => {
    const matchSymbol = d.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
    const matchDecision = filterDecision === 'ALL' || d.decision === filterDecision;
    return matchSymbol && matchDecision;
  });

  return (
    <div className="flex flex-col h-full space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Decision History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review past AI multi-agent recommendations and rationales.</p>
        </div>
      </div>

      <Card className="p-4 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by symbol..."
            value={filterSymbol}
            onChange={(e) => setFilterSymbol(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 appearance-none focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer"
          >
            <option value="ALL">All Decisions</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
            <option value="HOLD">Hold</option>
            <option value="REJECT">Reject</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-500">Loading history...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="p-8 text-center bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Failed to load</h3>
          <p className="text-red-600 dark:text-red-500/80 text-sm mt-1">{error}</p>
        </Card>
      ) : filteredDecisions.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50/50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No decisions found</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">
            {decisions.length === 0 ? "You haven't run any AI analysis workflows yet." : "No records match your active filters."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDecisions.map((decision) => (
            <Card key={decision.id} className="p-5 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Left col: Symbol & Basic identifiers */}
                <div className="md:w-1/4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl font-extrabold text-gray-900 dark:text-white">{decision.symbol}</span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${getDecisionColor(decision.decision)}`}>
                      {decision.decision}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(decision.timestamp).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Mid col: Reason */}
                <div className="md:w-1/2 bg-gray-50/80 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {decision.reason}
                  </p>
                </div>

                {/* Right col: Confidence */}
                <div className="md:w-1/4 flex flex-col justify-center items-end">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    AI Confidence
                  </p>
                  <div className="flex items-center gap-2 w-full justify-end">
                    <div className="flex-1 max-w-[100px] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${decision.confidence > 0.8 ? 'bg-green-500' : decision.confidence > 0.5 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${decision.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {(decision.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}