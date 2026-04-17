import { Card } from './common'

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

  return (
    <Card className="mt-5 p-5 border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <h3 className="text-lg font-semibold text-gray-900">AI Recommendation Insight</h3>

      <div className="mt-4 space-y-4">
        <section>
          <p className="text-xs uppercase tracking-wide text-gray-500">Summary</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{explanation.summary}</p>
        </section>

        <section>
          <p className="text-xs uppercase tracking-wide text-gray-500">Key Factors</p>
          <ul className="mt-2 space-y-2">
            {explanation.factors.map((factor) => (
              <li
                key={factor}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-800"
              >
                {factor}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="text-xs uppercase tracking-wide text-gray-500">Confidence Score</p>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
            <span>Model confidence</span>
            <span className="font-semibold text-gray-900">{confidencePercentage.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${confidencePercentage}%` }}
            />
          </div>
        </section>
      </div>
    </Card>
  )
}
