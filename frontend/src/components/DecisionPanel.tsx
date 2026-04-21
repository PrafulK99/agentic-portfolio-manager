import { useState } from 'react'
import { analyzeStock, executeTrade } from '../services/api'
import { AIExplanationPanel, type AIExplanation } from './AIExplanationPanel'
import { Input, Button } from './common'
import { Zap, BarChart3, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react'

interface DecisionPanelProps {
  onTradeSuccess?: () => Promise<void> | void
}

export function DecisionPanel({ onTradeSuccess }: DecisionPanelProps) {
  const [symbol, setSymbol] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [explanation, setExplanation] = useState<AIExplanation | null>(null)

  const validateInputs = () => {
    if (!symbol || !amount) {
      setErrorMessage('Please fill in all fields')
      return null
    }
    const inputSymbol = symbol.trim().toUpperCase()
    const inputAmount = Number(amount)
    if (!inputSymbol || Number.isNaN(inputAmount) || inputAmount <= 0) {
      setErrorMessage('Please enter a valid symbol and amount')
      return null
    }
    return { inputSymbol, inputAmount }
  }

  const handleAnalyze = async () => {
    const validated = validateInputs()
    if (!validated) return
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    try {
      const response = await analyzeStock(validated.inputSymbol, validated.inputAmount)
      setExplanation(response.decision.explanation)
      setSuccessMessage(`Analysis complete · Recommendation: ${response.decision.decision}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to analyze stock')
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async () => {
    const validated = validateInputs()
    if (!validated) return
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    try {
      const response = await executeTrade(validated.inputSymbol, validated.inputAmount)
      setExplanation(response.decision.explanation)
      if (onTradeSuccess) await onTradeSuccess()
      setSuccessMessage(response.message || 'Trade executed successfully')
      setSymbol('')
      setAmount('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to execute trade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* ── Header ────────────────────────────────────── */}
      <div className="space-y-2 pb-4 border-b border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-sm font-semibold text-slate-50">Execute Trade</h2>
        </div>
        <p className="text-xs text-slate-500 pl-10">AI-analyzed recommendations</p>
      </div>

      {/* ── Form Inputs ────────────────────────────────── */}
      <div className="space-y-4">
        <Input
          label="Stock Symbol"
          value={symbol}
          onChange={(val) => setSymbol(val.toUpperCase())}
          placeholder="e.g. AAPL, MSFT, GOOGL"
          type="text"
          disabled={loading}
          icon={<BarChart3 className="w-4 h-4 text-slate-600" />}
        />

        <Input
          label="Investment Amount (USD)"
          value={amount}
          onChange={setAmount}
          placeholder="1000"
          type="number"
          disabled={loading}
          icon={<span className="text-slate-600 font-medium">$</span>}
        />
      </div>

      {/* ── Action Buttons ────────────────────────────── */}
      <div className="space-y-2.5">
        <Button
          onClick={handleExecute}
          disabled={loading}
          variant="primary"
          size="md"
          className="w-full"
          isLoading={loading}
          icon={!loading && <Zap className="w-4 h-4" />}
        >
          {loading ? 'Processing...' : 'Execute Trade'}
        </Button>

        <Button
          onClick={handleAnalyze}
          disabled={loading}
          variant="secondary"
          size="md"
          className="w-full"
          isLoading={loading}
          icon={!loading && <BarChart3 className="w-4 h-4" />}
        >
          {loading ? 'Analyzing...' : 'Analyze Only'}
        </Button>
      </div>

      {/* ── Status Messages ───────────────────────────── */}
      {successMessage && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-emerald-300 leading-relaxed">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-red-300 leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* ── Tip Banner ────────────────────────────────── */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/30">
        <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Run analysis first to see AI recommendations with confidence scores, then execute when ready.
        </p>
      </div>

      {/* ── AI Explanation Panel ──────────────────────── */}
      {explanation && <AIExplanationPanel explanation={explanation} />}
    </div>
  )
}