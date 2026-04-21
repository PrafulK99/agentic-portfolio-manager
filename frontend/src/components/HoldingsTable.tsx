import { Link } from 'react-router-dom'
import { Badge } from './common'
import { TrendingUp, TrendingDown } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface HoldingsTableProps {
  holdings: Holding[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '$0.00'
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function calcAllocation(value: number, total: number): number {
  return total > 0 ? value / total : 0
}

// ─── Allocation Bar ───────────────────────────────────────────────────────────

function AllocationBar({ value }: { value: number }) {
  const pct = Math.min(value * 100, 100)
  return (
    <div className="flex items-center justify-end gap-2.5">
      <div className="w-20 h-1.5 rounded-full bg-slate-800/50 border border-slate-700/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-linear-to-r from-blue-600 to-blue-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-500 w-10 text-right font-medium">
        {pct.toFixed(1)}%
      </span>
    </div>
  )
}

// ─── P/L Cell ─────────────────────────────────────────────────────────────────

function PLCell({ profitLoss, gainPct }: { profitLoss: number; gainPct: number }) {
  const isPositive = profitLoss >= 0
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? '+' : '−'}{formatCurrency(Math.abs(profitLoss))}
      </span>
      <Badge 
        variant={isPositive ? 'success' : 'danger'} 
        size="sm"
        className="text-xs"
      >
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(gainPct).toFixed(2)}%
      </Badge>
    </div>
  )
}

// ─── Symbol Chip ──────────────────────────────────────────────────────────────

function SymbolChip({ symbol }: { symbol: string }) {
  return (
    <Link
      to={`/portfolio/${symbol}`}
      className="
        inline-flex items-center px-3 py-1.5 rounded-lg
        text-xs font-bold tracking-wide
        bg-blue-500/10 border border-blue-500/20
        text-blue-300 hover:text-blue-200
        hover:bg-blue-500/20 hover:border-blue-500/30
        transition-all duration-150 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-blue-500/50
      "
    >
      {symbol}
    </Link>
  )
}

// ─── Column Header ────────────────────────────────────────────────────────────

function Th({ children, align = 'right' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={`py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${align === 'left' ? 'text-left' : 'text-right'}`}>
      {children}
    </th>
  )
}

// ─── HoldingsTable ────────────────────────────────────────────────────────────

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-800/20 py-16 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
          </svg>
        </div>
        <p className="text-sm text-slate-400">No holdings yet. Add your first position to get started.</p>
      </div>
    )
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0)

  return (
    <div className="overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-screen">
          <thead>
            <tr className="border-b border-slate-700/30 bg-slate-900/50">
              <Th align="left">Asset</Th>
              <Th>Quantity</Th>
              <Th>Entry Price</Th>
              <Th>Current Price</Th>
              <Th>Return</Th>
              <Th>Allocation</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-700/20">
            {holdings.map((h, i) => {
              const allocation = calcAllocation(h.current_value, totalValue)

              return (
                <tr
                  key={`${h.symbol}-${i}`}
                  className="transition-all duration-150 hover:bg-slate-800/30"
                >
                  {/* Asset */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-2">
                      <SymbolChip symbol={h.symbol} />
                      {h.name && (
                        <span className="text-xs text-slate-500 truncate max-w-md">
                          {h.name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="py-4 px-4 text-right text-sm font-medium tabular-nums text-slate-300">
                    {h.quantity % 1 === 0 ? h.quantity.toLocaleString() : h.quantity.toFixed(4)}
                  </td>

                  {/* Entry Price */}
                  <td className="py-4 px-4 text-right text-sm tabular-nums text-slate-500">
                    {formatCurrency(h.avg_buy_price)}
                  </td>

                  {/* Current Price */}
                  <td className="py-4 px-4 text-right text-sm font-semibold tabular-nums text-slate-50">
                    {formatCurrency(h.current_price)}
                  </td>

                  {/* Return */}
                  <td className="py-4 px-4">
                    <PLCell profitLoss={h.profit_loss} gainPct={h.profit_loss_pct} />
                  </td>

                  {/* Allocation */}
                  <td className="py-4 px-4">
                    <AllocationBar value={allocation} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/30 bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">
          {holdings.length} position{holdings.length !== 1 ? 's' : ''}
        </span>
        <span>Click symbol to view details</span>
      </div>
    </div>
  )
}