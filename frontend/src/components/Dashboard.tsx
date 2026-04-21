import { useEffect, useState, useCallback } from 'react'
import { Card, Badge, Section } from './common'
import { PortfolioSummary } from './PortfolioSummary'
import { HoldingsTable } from './HoldingsTable'
import { DecisionPanel } from './DecisionPanel'
import { StockChart } from './StockChart'
import { TrendingUp, Activity, AlertCircle, RefreshCw } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioMetrics {
  total_investment: number
  current_value: number
  total_profit_loss: number
}

interface Holding {
  symbol: string
  name?: string
  quantity: number
  avg_buy_price: number
  current_price: number
  current_value: number
  profit_loss: number
  profit_loss_pct: number
}

interface PortfolioData {
  holdings: Holding[]
  metrics: PortfolioMetrics
}

// ─── Agent Configuration ──────────────────────────────────────────────────────

const AGENTS = [
  { id: 'market', name: 'Market Agent', emoji: '📊', status: 'active', description: 'Real-time market analysis' },
  { id: 'risk', name: 'Risk Agent', emoji: '🛡️', status: 'active', description: 'Portfolio risk assessment' },
  { id: 'strategy', name: 'Strategy Agent', emoji: '📈', status: 'idle', description: 'Strategic recommendations' },
  { id: 'compliance', name: 'Compliance Agent', emoji: '✅', status: 'idle', description: 'Regulatory monitoring' },
]

// ─── Agent Status Dot ─────────────────────────────────────────────────────────

function AgentStatusDot({ status }: { status: string }) {
  const statusClasses = {
    active: 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/30',
    idle: 'bg-slate-500',
    processing: 'bg-blue-400 animate-pulse shadow-lg shadow-blue-400/20',
    error: 'bg-red-400 shadow-lg shadow-red-400/20',
  }
  return <div className={`w-2.5 h-2.5 rounded-full ${statusClasses[status as keyof typeof statusClasses] || statusClasses.idle}`} />
}

// ─── Premium Agent Card ────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  return (
    <Card interactive className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-lg shrink-0">
            {agent.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-50">{agent.name}</p>
            <p className="text-xs text-slate-500 truncate">{agent.description}</p>
          </div>
        </div>
        <AgentStatusDot status={agent.status} />
      </div>
    </Card>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-slate-800/30" />
        <div className="h-4 w-96 rounded-md bg-slate-800/20" />
      </div>

      {/* Agents skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-800/20" />
        ))}
      </div>

      {/* Portfolio overview skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-800/20" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-80 rounded-2xl bg-slate-800/20" />

      {/* Holdings + Decision skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-800/20" />
        <div className="h-80 rounded-2xl bg-slate-800/20" />
      </div>
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-premium">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-50">Failed to load portfolio</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Unable to connect to the portfolio service. Check your connection and try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-smooth shadow-lg shadow-blue-500/25"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyPortfolioState({ onTradeSuccess }: { onTradeSuccess: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-premium">
          <TrendingUp className="w-12 h-12 text-blue-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-lg shadow-emerald-400/50" />
      </div>

      <div className="text-center space-y-3 max-w-sm">
        <h2 className="text-2xl font-bold text-slate-50">Start Your Portfolio</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Add your first position to begin receiving AI-powered recommendations from your intelligent agent team.
        </p>
      </div>

      <div className="w-full max-w-md">
        <DecisionPanel onTradeSuccess={onTradeSuccess} />
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

  const fetchPortfolio = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/portfolio')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: PortfolioData = await res.json()
      setPortfolio(data)
      if (data.holdings?.length > 0) {
        setSelectedSymbol((prev) => prev ?? data.holdings[0].symbol)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  if (loading) return <DashboardSkeleton />
  if (error) return <ErrorState onRetry={fetchPortfolio} />

  const isEmpty = !portfolio || portfolio.holdings?.length === 0

  if (isEmpty) {
    return (
      <div className="space-y-8">
        <DashboardHeader />
        <EmptyPortfolioState onTradeSuccess={fetchPortfolio} />
      </div>
    )
  }

  const chartSymbol = selectedSymbol ?? portfolio.holdings[0].symbol

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────── */}
      <DashboardHeader />

      {/* ── AI Agents Grid ────────────────────────────── */}
      <Section title="AI Agent Team" subtitle="Real-time monitoring and analysis">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </Section>

      {/* ── Portfolio Overview ────────────────────────── */}
      <Section title="Portfolio Overview" subtitle="Your current positions and performance">
        <PortfolioSummary metrics={portfolio.metrics} />
      </Section>

      {/* ── Price Chart ───────────────────────────────── */}
      <Section
        title="Price Chart"
        subtitle={`Live market data for ${chartSymbol}`}
        action={
          portfolio.holdings.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {portfolio.holdings.map((h, i) => (
                <button
                  key={`${h.symbol}-${i}`}
                  onClick={() => setSelectedSymbol(h.symbol)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth ${
                    chartSymbol === h.symbol
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300'
                  }`}
                >
                  {h.symbol}
                </button>
              ))}
            </div>
          )
        }
      >
        <Card className="overflow-hidden">
          <StockChart symbol={chartSymbol} height={350} />
        </Card>
      </Section>

      {/* ── Holdings + Decision ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Section title="Holdings" subtitle={`${portfolio.holdings.length} position${portfolio.holdings.length !== 1 ? 's' : ''} in portfolio`}>
            <Card className="overflow-hidden">
              <HoldingsTable holdings={portfolio.holdings} />
            </Card>
          </Section>
        </div>

        <div>
          <Section title="Quick Actions" subtitle="Execute trades & analyze">
            <Card className="overflow-hidden">
              <DecisionPanel onTradeSuccess={fetchPortfolio} />
            </Card>
          </Section>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────

function DashboardHeader() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            Portfolio Dashboard
          </h1>
          <Badge variant="info" size="sm">
            <Activity className="w-3 h-3" />
            Live
          </Badge>
        </div>
        <p className="text-sm text-slate-400">
          AI-powered multi-agent analysis with real-time market insights
        </p>
      </div>
    </div>
  )
}