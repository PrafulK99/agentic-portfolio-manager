import { Card, Badge } from './common'
import { Lightbulb, TrendingUp } from 'lucide-react'

export interface AIExplanation {
  summary: string
  factors: string[]
  confidence: number
}

interface AIExplanationPanelProps {
  explanation: AIExplanation
}

export function AIExplanationPanel({ explanation }: AIExplanationPanelProps) {
  const confidencePercentage = Math.max(0, Math.min(100, explanation.confidence * 100))
  const confidenceVariant = confidencePercentage >= 75 ? 'success' : confidencePercentage >= 50 ? 'info' : 'warning'

  return (
    <Card className="p-5 border-blue-500/20 bg-blue-500/5 space-y-4 mt-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-50">AI Analysis Insight</h3>
          <p className="text-xs text-slate-500 mt-0.5">Model confidence and factors</p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Summary</p>
        <p className="text-sm text-slate-300 leading-relaxed">{explanation.summary}</p>
      </div>

      {/* Key Factors Section */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Key Factors</p>
        <div className="space-y-2">
          {explanation.factors.map((factor, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-300 leading-relaxed">{factor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Score Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confidence Score</p>
          <Badge variant={confidenceVariant} size="sm">
            {confidencePercentage.toFixed(0)}%
          </Badge>
        </div>
        <div className="h-2 rounded-full bg-slate-800/50 border border-slate-700/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-600 to-blue-400 transition-all duration-500"
            style={{ width: `${confidencePercentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {confidencePercentage >= 75
            ? 'High confidence in this recommendation'
            : confidencePercentage >= 50
              ? 'Moderate confidence, consider other factors'
              : 'Lower confidence, review carefully before acting'}
        </p>
      </div>
    </Card>
  )
}
