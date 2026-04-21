# Multi-Agent Workflow - Quick Start

## 🧪 Testing the Feature

### Step 1: Navigate to /analyze page
```
http://localhost:5173/analyze  (or your dev server URL)
```

### Step 2: Run an Analysis
1. Enter a stock symbol (e.g., `AAPL`, `MSFT`, `GOOGL`)
2. Enter an investment amount (e.g., `1000`)
3. Click **"Run Analysis"** button

### Step 3: Watch the Agents Work
You should see:
- **t=0ms**: "Data Agent" starts processing (spinning indicator)
- **t=400ms**: "Analysis Agent" joins (while Data Agent still running)
- **t=800ms**: "Risk Agent" joins 
- **t=1200ms**: "Strategy Agent" joins
- **t=2200ms**: All agents complete, results fade in smoothly

### Expected Timeline
```
0ms    ─ [Data ▓▓▓▓▓░░░░░░░░░░░░░░░░░░]
400ms  ─ [Analysis ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░]
800ms  ─ [Risk ▓▓▓▓░░░░░░░░░░░░░░░░░░]
1200ms ─ [Strategy ▓▓▓▓░░░░░░░░░░░░░░░░░]
2200ms ─ COMPLETE ✨
```

---

## 🎯 What to Look For

### Visual Feedback ✓
- [ ] Agents show spinning/pulsing indicators when processing
- [ ] Agent names are clear and distinct
- [ ] Status badges update (idle → processing → completed)
- [ ] Progress bars fill as agents work
- [ ] Colors change appropriately (gray → blue → green)

### Timing ✓
- [ ] Data Agent completes first (~1 second)
- [ ] Agents overlap (not sequential)
- [ ] Total time is ~2-2.5 seconds
- [ ] Results appear smoothly after all agents complete

### State Management ✓
- [ ] "Run Analysis" button shows spinner while analyzing
- [ ] Can't click button twice while analyzing
- [ ] Can click "New Analysis" to reset
- [ ] Empty state shows when no analysis has run

### Data Fetching ✓
- [ ] Results appear correctly after animation
- [ ] No double-fetching (async only runs once)
- [ ] Results match API response

---

## 🔧 Common Adjustments

### Make it Faster
In `Analyze.tsx`, reduce durations:
```typescript
const agentConfig: AgentConfig[] = [
  { id: 'data-agent', name: 'Data Agent', delay: 0, duration: 500, message: '' }, // Was 1000
  { id: 'analysis-agent', name: 'Analysis Agent', delay: 200, duration: 750, message: '' }, // Was 400, 1500
  // ...
];
```

### Make it Slower (More Dramatic)
```typescript
const agentConfig: AgentConfig[] = [
  { id: 'data-agent', name: 'Data Agent', delay: 0, duration: 2000, message: '' }, // 2s
  { id: 'analysis-agent', name: 'Analysis Agent', delay: 800, duration: 2500, message: '' },
  // ...
];
```

### Run Agents Purely Sequentially (No Overlap)
```typescript
const agentConfig: AgentConfig[] = [
  { id: 'data-agent', name: 'Data Agent', delay: 0, duration: 1000, message: '' },
  { id: 'analysis-agent', name: 'Analysis Agent', delay: 1000, duration: 1500, message: '' }, // Starts when first ends
  { id: 'risk-agent', name: 'Risk Agent', delay: 2500, duration: 1000, message: '' }, // And so on...
  { id: 'strategy-agent', name: 'Strategy Agent', delay: 3500, duration: 1000, message: '' },
];
```

### Change Agent Messages
```typescript
// In the agents array definition, inside Analyze.tsx:
{
  id: 'data-agent',
  name: 'Data Agent',
  icon: BarChart3,
  status: agentStatuses['data-agent'],
  message: 'Gathering market data and technical indicators' // ← Change this
}
```

---

## 🐛 Troubleshooting

### Results never appear
- Check browser console for errors
- Verify API endpoint is working (test with curl/Postman)
- Increase timeout if your API is slow:
  ```typescript
  setTimeout(() => {
    setShowResults(true);
    setIsAnalyzing(false);
  }, workflowTime + 1000); // Add extra buffer
  ```

### Agents don't animate
- Clear browser cache (Ctrl+Shift+Del)
- Check Tailwind is configured in `vite.config.ts`
- Verify `AgentStatusPanel.tsx` is imported correctly
- Look for console errors (F12 → Console tab)

### Button stays loading forever
- Check Redux DevTools or React DevTools to see state
- Verify `handleAnalyze` is being called
- Check network tab to see if API call completes
- Add console.log to debug:
  ```typescript
  console.log('isAnalyzing:', isAnalyzing);
  console.log('showResults:', showResults);
  console.log('result:', result);
  ```

### Timing seems off
- Timings are simulated (not real delays), so they're consistent
- If animation seems to run at different speeds, check CPU usage
- On slower machines, animations may appear jerky (normal for JS animations)

---

## 📱 Responsive Behavior

- **Mobile (< 768px)**: 1-column agent grid (still looks great!)
- **Tablet (768px - 1024px)**: 2-column grid
- **Desktop (> 1024px)**: 2-column agent grid, full results UI

Try resizing your browser to test.

---

## 🚀 Production Deployment

When ready to deploy:

1. **Test on slow connection** (DevTools → Network → 3G)
2. **Test on slow device** (DevTools → Performance, check for jank)
3. **Verify API endpoints** work with real data
4. **Consider timing**: Adjust durations if your API is slower/faster
5. **Monitor**: Add error tracking (Sentry, LogRocket) to catch issues

---

## 📞 Support

If something's not working:
1. Check browser console (F12 → Console)
2. Look at network tab to see API calls
3. Compare against `MULTI_AGENT_WORKFLOW.md` docs
4. Try reverting to default `agentConfig` values
5. Check that all imports are present in `Analyze.tsx`

Happy analyzing! 🎉
