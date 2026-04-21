/**
 * Multi-Agent Workflow Simulator
 * Handles sequencing, timing, and state transitions for AI agents
 */

export interface AgentConfig {
  id: string;
  name: string;
  delay: number; // Time in ms before starting
  duration: number; // Time in ms to complete
  message: string;
}

export type AgentStatusMap = Record<string, 'idle' | 'processing' | 'completed'>;

/**
 * Simulates a multi-agent workflow with specified delays and durations
 * Calls the callback to update UI state as agents progress
 * 
 * @param agents - Configuration for each agent
 * @param onStatusUpdate - Callback fired when agent status changes
 * @returns Abort controller to cancel simulation if needed
 */
export function simulateMultiAgentWorkflow(
  agents: AgentConfig[],
  onStatusUpdate: (agentId: string, status: 'idle' | 'processing' | 'completed') => void
): AbortController {
  const controller = new AbortController();
  const timeoutIds: NodeJS.Timeout[] = [];

  // Sort agents by delay to process them in order
  const sortedAgents = [...agents].sort((a, b) => a.delay - b.delay);

  sortedAgents.forEach((agent) => {
    // Schedule agent to start processing
    const startTimeoutId = setTimeout(
      () => {
        if (!controller.signal.aborted) {
          onStatusUpdate(agent.id, 'processing');
        }
      },
      agent.delay,
      { signal: controller.signal }
    );
    timeoutIds.push(startTimeoutId);

    // Schedule agent to complete
    const completeTimeoutId = setTimeout(
      () => {
        if (!controller.signal.aborted) {
          onStatusUpdate(agent.id, 'completed');
        }
      },
      agent.delay + agent.duration,
      { signal: controller.signal }
    );
    timeoutIds.push(completeTimeoutId);
  });

  // Store cleanup function on controller for easy cancellation
  const originalAbort = controller.abort.bind(controller);
  controller.abort = function () {
    timeoutIds.forEach(clearTimeout);
    originalAbort();
  };

  return controller;
}

/**
 * Calculate when all agents will be complete
 */
export function getTotalWorkflowTime(agents: AgentConfig[]): number {
  let maxTime = 0;
  agents.forEach((agent) => {
    const agentEndTime = agent.delay + agent.duration;
    if (agentEndTime > maxTime) maxTime = agentEndTime;
  });
  return maxTime;
}

/**
 * Create initial agent status map (all idle)
 */
export function createInitialAgentStatus(agentIds: string[]): AgentStatusMap {
  return agentIds.reduce(
    (acc, id) => {
      acc[id] = 'idle';
      return acc;
    },
    {} as AgentStatusMap
  );
}
