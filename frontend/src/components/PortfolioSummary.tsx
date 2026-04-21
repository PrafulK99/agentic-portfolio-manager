import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react'
import { Card, Badge } from './common'

interface PortfolioMetrics {
  total_investment: number
  current_value: number
  total_profit_loss: number
}

interface PortfolioSummaryProps {
  metrics: PortfolioMetrics
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

// ─── Premium Metric Card ──────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  change?: number
  accent?: 'neutral' | 'positive' | 'negative'
  icon?: React.ReactNode
}

function MetricCard({ label, value, sub, change, accent = 'neutral', icon }: MetricCardProps) {
  const accentClasses = {
    neutral: 'border-slate-700/50',
    positive: 'border-emerald-500/20 bg-emerald-500/5',
    negative: 'border-red-500/20 bg-red-500/5',
  }

  const changeColor = {
    neutral: 'text-slate-400',
    positive: 'text-emerald-400',
    negative: 'text-red-400',
  }

  const Icon = change === undefined 
    ? null 
    : change >= 0 
      ? TrendingUp 
      : TrendingDown

  return (
    <Card className={`p-5 border ${accentClasses[accent]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <div className="space-y-2">
            <p className="text-2xl lg:text-3xl font-bold text-slate-50 truncate">{value}</p>
            {(sub || change !== undefined) && (
              <div className="flex items-center gap-2">
                {change !== undefined && Icon && (
                  <Icon className={`w-3.5 h-3.5 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                )}
                <Badge 
                  variant={accent === 'positive' ? 'success' : accent === 'negative' ? 'danger' : 'default'} 
                  size="sm"
                  className={changeColor[accent]}
                >
                  {sub || formatPercent(change || 0)}
                </Badge>
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-500 shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Return Visualization Bar ────────────────────────────────────────────────

function ReturnBar({ invested, current }: { invested: number; current: number }) {
  if (invested <= 0) return null

  const isGain = current >= invested
  const diff = Math.abs(current - invested)
  const returnPct = ((current - invested) / invested) * 100
  const barFill = Math.min((diff / invested) * 100, 100)

  return (
    <Card className="p-5 border-slate-700/50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-50">Total Return vs. Cost Basis</p>
          <Badge 
            variant={isGain ? 'success' : 'danger'} 
            size="sm"
          >
            {formatPercent(returnPct)}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-slate-800/50 border border-slate-700/50 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isGain
                  ? 'bg-linear-to-r from-emerald-600 to-emerald-400'
                  : 'bg-linear-to-r from-red-600 to-red-400'
              }`}
              style={{ width: `${barFill}%` }}
            />
          </div>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="space-y-1">
            <p className="text-slate-400 font-medium">Cost Basis</p>
            <p className="font-semibold text-slate-50">{formatCurrency(invested)}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-slate-400 font-medium">Current Value</p>
            <p className="font-semibold text-slate-50">{formatCurrency(current)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── Portfolio Summary ────────────────────────────────────────────────────────

export function PortfolioSummary({ metrics }: PortfolioSummaryProps) {
  const { total_investment, current_value, total_profit_loss } = metrics

  const gainPct = total_investment
    ? (total_profit_loss / total_investment) * 100
    : 0
  const isGain = total_profit_loss >= 0

  return (
    <div className="space-y-4">
      {/* Top row: 3 metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Invested"
          value={formatCurrency(total_investment)}
          accent="neutral"
          icon={<DollarSign className="w-5 h-5" />}
        />

        <MetricCard
          label="Current Value"
          value={formatCurrency(current_value)}
          accent="neutral"
          icon={<Target className="w-5 h-5" />}
        />

        <MetricCard
          label="Total Return"
          value={`${isGain ? '+' : '−'}${formatCurrency(Math.abs(total_profit_loss))}`}
          change={gainPct}
          accent={isGain ? 'positive' : 'negative'}
          icon={
            isGain ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )
          }
        />
      </div>

      {/* Bottom: Return visualization */}
      <ReturnBar invested={total_investment} current={current_value} />
    </div>
  )
}