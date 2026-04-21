import { BarChart3, Brain, Shield, Zap, CheckCircle, Clock } from 'lucide-react';

export type AgentStatus = 'idle' | 'processing' | 'completed';

export interface Agent {
  id: string;
  name: string;
  icon: React.ElementType;
  status: AgentStatus;
  message?: string;
}

interface AgentStatusPanelProps {
  agents: Agent[];
  isProcessing: boolean;
}

/**
 * Renders a single agent status card with animated state transitions
 */
function AgentCard({ agent }: { agent: Agent }) {
  const statusConfig = {
    idle: {
      textColor: 'text-slate-500',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/20',
      icon: 'text-slate-400',
    },
    processing: {
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      icon: 'text-blue-400',
    },
    completed: {
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      icon: 'text-emerald-400',
    },
  };

  const config = statusConfig[agent.status];
  const Icon = agent.icon;

  return (
    <div
      className={`p-5 rounded-2xl bg-white/[0.05] border ${config.borderColor} backdrop-blur-sm transition-all duration-300 ${config.bgColor}`}
    >
      {/* Agent Header with Icon and Status */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          {agent.status === 'completed' ? (
            <div className={`w-10 h-10 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center transition-all duration-300`}>
              <CheckCircle className={`w-6 h-6 ${config.icon}`} />
            </div>
          ) : agent.status === 'processing' ? (
            <div className={`w-10 h-10 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center relative transition-all duration-300`}>
              <Icon className={`w-6 h-6 ${config.icon} animate-pulse`} />
              {/* Animated spinning ring */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent border-t-blue-400 border-r-blue-400/50 animate-spin opacity-40" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center transition-all duration-300`}>
              <Clock className={`w-6 h-6 ${config.icon}`} />
            </div>
          )}
        </div>

        {/* Agent Name and Status Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">{agent.name}</h3>
          <p className={`text-xs font-medium ${config.textColor} transition-colors duration-300`}>
            {agent.status === 'idle' && 'Waiting to start'}
            {agent.status === 'processing' && 'Processing...'}
            {agent.status === 'completed' && 'Complete'}
          </p>
          {agent.message && (
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{agent.message}</p>
          )}
        </div>

        {/* Status Badge */}
        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${config.bgColor} ${config.textColor} transition-all duration-300 flex-shrink-0`}>
          {agent.status === 'completed' ? '✓' : agent.status === 'processing' ? '◆' : '○'}
        </div>
      </div>

      {/* Progress Indicator */}
      {agent.status !== 'idle' && (
        <div className="relative h-1.5 rounded-full bg-slate-800/50 border border-white/10 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${
              agent.status === 'completed'
                ? 'from-emerald-500 to-emerald-600'
                : 'from-blue-500 to-purple-500'
            } rounded-full transition-all duration-500`}
            style={{ width: agent.status === 'completed' ? '100%' : '60%' }}
          />
          {agent.status === 'processing' && (
            <div className="absolute inset-0 animate-pulse rounded-full" />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Agent Status Panel - Shows multi-agent workflow progression
 */
export function AgentStatusPanel({ agents, isProcessing }: AgentStatusPanelProps) {
  const allCompleted = agents.every((a) => a.status === 'completed');
  const processingCount = agents.filter((a) => a.status === 'processing').length;

  return (
    <div className="space-y-6">
      {/* Header with Processing Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {allCompleted ? '✨ Analysis Complete' : '🚀 Agents Processing'}
          </h2>
          {isProcessing && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-semibold text-blue-400">
                {processingCount} {processingCount === 1 ? 'agent' : 'agents'} working
              </span>
            </div>
          )}
        </div>
        <p className="text-slate-400">
          {allCompleted
            ? 'All agents have completed their analysis'
            : 'Multiple AI agents are collaborating to analyze your request'}
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Bottom Status Bar */}
      {isProcessing && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-200" />
            </div>
            <p className="text-sm text-slate-300 font-medium">
              Agents are collaborating in real-time...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentStatusPanel;
