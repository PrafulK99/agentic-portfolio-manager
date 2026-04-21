# Code Architecture & Data Flow

## 📊 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                         │
│                      (Analyze.tsx Component)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Input Form]  ──→  [Run Analysis Button]                      │
│      ↓                      ↓                                    │
│  symbol: "AAPL"      onClick: handleAnalyze()                  │
│  amount: "1000"                                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            AGENT STATUS PANEL (isAnalyzing=true)         │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  [Data Agent]        ◆ Processing    Progress 60% │  │  │
│  │  │  [Analysis Agent]    ◆ Processing    Progress 40% │  │  │
│  │  │  [Risk Agent]        ○ Waiting       Progress  0% │  │  │
│  │  │  [Strategy Agent]    ○ Waiting       Progress  0% │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓ (After ~2.2 seconds)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           RESULTS VIEW (showResults=true)                │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  [AAPL $150.25]  STRONG BUY - 92% Confidence      │  │  │
│  │  │  [Market Analysis] [Risk Assessment]               │  │  │
│  │  │  [Compliance Check] [AI Explanation]               │  │  │
│  │  │  [Execute] [New Analysis]                          │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

```
USER CLICKS "Run Analysis"
        ↓
    handleAnalyze()
        ↓
   ┌─────────────────────────────────────────────┐
   │  1. Reset State                            │
   │     - isAnalyzing = true                   │
   │     - showResults = false                  │
   │     - result = null                        │
   └─────────────────────────────────────────────┘
        ↓
   ┌─────────────────────────────────────────────┐
   │  2. Start Workflow Animation                │
   │     - Call simulateWorkflow()               │
   │     - simulateMultiAgentWorkflow(config)    │
   │     - Returns AbortController               │
   └─────────────────────────────────────────────┘
        ↓
   ┌─────────────────────────────────────────────┐
   │  3. Workflow Simulator Updates Agents       │
   │     t=0ms   : Data Agent → processing      │
   │     t=400ms : Analysis Agent → processing  │
   │     t=800ms : Risk Agent → processing      │
   │     t=1000ms: Data Agent → completed       │
   │     t=1200ms: Strategy Agent → processing  │
   │     t=1800ms: Risk Agent → completed       │
   │     t=1900ms: Analysis Agent → completed   │
   │     t=2200ms: Strategy Agent → completed   │
   └─────────────────────────────────────────────┘
        ↓
   ┌─────────────────────────────────────────────┐
   │  4. Fetch Analysis Data (parallel)          │
   │     - analyzeStock(symbol, amount)          │
   │     - API call returns result               │
   │     - setResult(data)                       │
   └─────────────────────────────────────────────┘
        ↓
   ┌─────────────────────────────────────────────┐
   │  5. Wait for Workflow to Complete           │
   │     - setTimeout(getTotalWorkflowTime())    │
   │     - ~2200ms                               │
   └─────────────────────────────────────────────┘
        ↓
   ┌─────────────────────────────────────────────┐
   │  6. Transition to Results View              │
   │     - showResults = true                    │
   │     - isAnalyzing = false                   │
   │     - Smooth fade-in animation              │
   └─────────────────────────────────────────────┘
        ↓
    UI DISPLAYS RESULTS
```

---

## 📦 Component Hierarchy

```
App (Router)
  ↓
/analyze Route
  ↓
Analyze.tsx (Main Page Component)
  ├─ Input Section
  │   ├─ Symbol Input
  │   └─ Amount Input
  ├─ AgentStatusPanel (Conditional: when isAnalyzing)
  │   ├─ AgentCard × 4
  │   │   ├─ Icon (Data, Analysis, Risk, Strategy)
  │   │   ├─ Status Badge (idle/processing/completed)
  │   │   ├─ Progress Bar
  │   │   └─ Spinner Animation
  │   └─ Status Bar (3 bouncing dots)
  └─ Results View (Conditional: when showResults)
      ├─ ResultSummaryCard
      ├─ MarketAnalysis Card
      ├─ RiskAssessment Card
      ├─ ComplianceCheck Card
      ├─ AIExplanation Card
      └─ Action Buttons (Execute, New Analysis)
```

---

## 🔌 File Dependencies

```
Analyze.tsx
  ├─ imports → AgentStatusPanel.tsx
  │   └─ imports → lucide-react (icons)
  ├─ imports → agentSimulator.ts
  │   └─ utility functions (pure, no deps)
  ├─ imports → common.tsx (Button, Badge)
  ├─ imports → api.ts (analyzeStock, executeTrade)
  └─ imports → lucide-react (icons)

AgentStatusPanel.tsx
  └─ imports → lucide-react (icons)

agentSimulator.ts
  └─ pure TypeScript (no external deps)
```

---

## 🎭 State Machine Transitions

```
                    ┌─────────────────────┐
                    │   INITIAL STATE     │
                    │ isAnalyzing: false  │
                    │ showResults: false  │
                    │ result: null        │
                    └──────────┬──────────┘
                               │
                        User clicks "Run Analysis"
                               ↓
                    ┌──────────────────────────┐
                    │  ANALYZING STATE         │
                    │ isAnalyzing: true        │
                    │ showResults: false       │
                    │ result: (fetching...)    │
                    │                          │
                    │ → Agents animate         │
                    │ → Data fetches parallel  │
                    └──────────┬───────────────┘
                               │
                        After workflow completes
                        + data received
                               ↓
                    ┌──────────────────────────┐
                    │  RESULTS STATE           │
                    │ isAnalyzing: false       │
                    │ showResults: true        │
                    │ result: (populated)      │
                    │                          │
                    │ → Results fade in        │
                    │ → Buttons become active  │
                    └──────────┬───────────────┘
                               │
                        User clicks "Execute"
                        or "New Analysis"
                               ↓
                    ┌──────────────────────────┐
                    │ EXECUTION or RESET STATE │
                    └──────────────────────────┘
```

---

## 💾 State Variables Deep Dive

### Core State in Analyze.tsx

```typescript
// Form inputs
const [symbol, setSymbol] = useState<string>('');      // Stock ticker
const [amount, setAmount] = useState<string>('');      // Investment amount

// Workflow control
const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);    // Animation running?
const [showResults, setShowResults] = useState<boolean>(false);    // Show result UI?

// Data storage
const [result, setResult] = useState<AnalysisResult | null>(null); // API response
const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({
  'data-agent': 'idle',
  'analysis-agent': 'idle',
  'risk-agent': 'idle',
  'strategy-agent': 'idle',
});

// UI feedback
const [executing, setExecuting] = useState<boolean>(false);        // Trade running?
const [error, setError] = useState<string>('');                    // Error messages
const [successMsg, setSuccessMsg] = useState<string>('');          // Success messages

// Cleanup reference
const workflowControllerRef = useRef<AbortController | null>(null);
```

### Agent Status Type

```typescript
type AgentStatus = 'idle' | 'processing' | 'completed';

interface Agent {
  id: string;                              // Unique identifier
  name: string;                            // Display name
  icon: React.ElementType;                 // Lucide icon
  status: AgentStatus;                     // Current state
  message?: string;                        // Optional description
}
```

### Agent Config Type

```typescript
interface AgentConfig {
  id: string;       // Unique identifier
  name: string;     // Display name
  delay: number;    // Milliseconds before starting
  duration: number; // Milliseconds to complete
  message: string;  // Optional message
}

// Example:
const agentConfig: AgentConfig[] = [
  {
    id: 'data-agent',
    name: 'Data Agent',
    delay: 0,
    duration: 1000,
    message: 'Gathering market data and technical indicators'
  },
  // ... more agents
];
```

---

## ⏳ Timing & Scheduling

### How Delays Work

```typescript
// In simulateMultiAgentWorkflow:
sortedAgents.forEach((agent) => {
  // Start: Agent transitions to 'processing'
  setTimeout(
    () => onStatusUpdate(agent.id, 'processing'),
    agent.delay                           // Wait this long before starting
  );

  // Complete: Agent transitions to 'completed'
  setTimeout(
    () => onStatusUpdate(agent.id, 'completed'),
    agent.delay + agent.duration          // Wait delay + duration before completing
  );
});

// Example: Data Agent (delay=0, duration=1000)
// ├─ t=0ms:    starts processing
// └─ t=1000ms: completes (0 + 1000)

// Example: Analysis Agent (delay=400, duration=1500)
// ├─ t=400ms:   starts processing
// └─ t=1900ms:  completes (400 + 1500)
```

### Total Time Calculation

```typescript
function getTotalWorkflowTime(agents: AgentConfig[]): number {
  let maxTime = 0;
  agents.forEach((agent) => {
    const agentEndTime = agent.delay + agent.duration;
    if (agentEndTime > maxTime) maxTime = agentEndTime;
  });
  return maxTime;  // Returns highest end time
}

// Example:
// Data: 0 + 1000 = 1000
// Analysis: 400 + 1500 = 1900
// Risk: 800 + 1000 = 1800
// Strategy: 1200 + 1000 = 2200 ← MAX!
// Result: 2200ms total
```

---

## 🎨 Animation Timeline

```
t=0ms   ┌─────────────────────────────────────────────┐
        │ Page renders, form visible                  │
        └─────────────────────────────────────────────┘

t=0ms+  ┌─────────────────────────────────────────────┐
        │ [Run Analysis] button clicked               │
        │ handleAnalyze() executes                    │
        │ isAnalyzing = true                          │
        └─────────────────────────────────────────────┘

t=16ms  ┌─────────────────────────────────────────────┐
        │ React re-renders                            │
        │ AgentStatusPanel appears (fade-in)          │
        │ simulateWorkflow() starts                   │
        └─────────────────────────────────────────────┘

t=0ms   ┌─────────────────────────────────────────────┐
        │ DATA AGENT starts spinning                  │
        │ API call sent (analyzeStock)                │
        └─────────────────────────────────────────────┘

t=400ms ┌─────────────────────────────────────────────┐
        │ DATA AGENT (still processing)               │
        │ ANALYSIS AGENT starts spinning              │
        └─────────────────────────────────────────────┘

t=800ms ┌─────────────────────────────────────────────┐
        │ DATA AGENT (still processing)               │
        │ ANALYSIS AGENT (still processing)           │
        │ RISK AGENT starts spinning                  │
        └─────────────────────────────────────────────┘

t=1000ms┌─────────────────────────────────────────────┐
        │ DATA AGENT completes ✓ (green checkmark)    │
        │ ANALYSIS AGENT (still processing)           │
        │ RISK AGENT (still processing)               │
        └─────────────────────────────────────────────┘

t=1200ms┌─────────────────────────────────────────────┐
        │ DATA AGENT ✓                                │
        │ ANALYSIS AGENT (still processing)           │
        │ RISK AGENT (still processing)               │
        │ STRATEGY AGENT starts spinning              │
        └─────────────────────────────────────────────┘

t=1800ms┌─────────────────────────────────────────────┐
        │ DATA AGENT ✓                                │
        │ ANALYSIS AGENT (still processing)           │
        │ RISK AGENT completes ✓                      │
        │ STRATEGY AGENT (still processing)           │
        └─────────────────────────────────────────────┘

t=1900ms┌─────────────────────────────────────────────┐
        │ DATA AGENT ✓                                │
        │ ANALYSIS AGENT completes ✓                  │
        │ RISK AGENT ✓                                │
        │ STRATEGY AGENT (still processing)           │
        │ API response received                       │
        └─────────────────────────────────────────────┘

t=2200ms┌─────────────────────────────────────────────┐
        │ ALL AGENTS COMPLETE ✓                       │
        │ getTotalWorkflowTime() triggers transition  │
        │ showResults = true                          │
        │ isAnalyzing = false                         │
        └─────────────────────────────────────────────┘

t=2200ms┌─────────────────────────────────────────────┐
        │ React re-renders                            │
        │ AgentStatusPanel fades out                  │
        │ Results fade in (slide-in-from-bottom-4)    │
        │ User sees full analysis                     │
        └─────────────────────────────────────────────┘
```

---

## 🔄 Event Loop

The React event loop during analysis:

```
Initial Render (App Mounts)
  ↓
User enters "AAPL", "1000"
  ↓
Click "Run Analysis"
  ↓
[Event: onClick] → handleAnalyze()
  ├─ e.preventDefault()
  ├─ Reset state
  ├─ Call simulateWorkflow()
  ├─ Call analyzeStock() (async)
  ↓
[Scheduler] React.useState updates
  ├─ isAnalyzing = true
  ├─ agentStatuses = {...}
  ↓
[RENDER PHASE]
  ├─ AgentStatusPanel component renders
  ├─ Agent cards render with animations
  ├─ Tailwind classes apply (animate-pulse, animate-spin)
  ├─ CSS animations start
  ↓
[Effect Phase]
  ├─ useEffect cleanup (none here, but cleanup runs)
  ↓
[setTimeout callbacks fire] (from simulateMultiAgentWorkflow)
  ├─ t=0ms: onStatusUpdate('data-agent', 'processing')
  ├─ t=400ms: onStatusUpdate('analysis-agent', 'processing')
  ├─ ...
  ├─ t=2200ms: onStatusUpdate('strategy-agent', 'completed')
  ↓
[setState updates] → React re-renders agents
  ├─ Green checkmarks appear as agents complete
  ├─ CSS transitions applied (duration-300)
  ↓
[API response returns] → analyzeStock completes
  ├─ setResult(data)
  ↓
[setTimeout at 2200ms fires]
  ├─ setShowResults(true)
  ├─ setIsAnalyzing(false)
  ↓
[React re-renders]
  ├─ AgentStatusPanel component unmounts (fade-out)
  ├─ Results component mounts (fade-in)
  ↓
User sees final analysis results
```

---

This is the complete architecture! 🎉
