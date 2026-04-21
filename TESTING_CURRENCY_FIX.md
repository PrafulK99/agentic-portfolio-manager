# Stock Price Fix - Quick Testing Guide

## 🚀 Quick Start

### Step 1: Backend Running?
```bash
cd backend
uvicorn app.main:app --reload
```
Should see: `Uvicorn running on http://127.0.0.1:8000`

### Step 2: Frontend Running?
```bash
cd frontend
npm run dev
```
Should see: `Local: http://localhost:5173`

### Step 3: Test the Fix

#### Test 1: Locate StockChart Component
Find any page that displays a stock chart:
- Portfolio Detail page (click on a holding)
- Holdings Table with chart column
- Any ticker display

#### Test 2: International Ticker (EUR)
1. Navigate to component displaying "FRA:MSF" or similar international ticker
2. **Verify:**
   - ✅ Price shows with € symbol (e.g., "€357.00")
   - ✅ NOT showing "$418.07"
   - ✅ Currency badge shows "EUR"
   - ✅ Y-axis label shows "Price (€)"
   - ✅ "Data source: yfinance" shown below price

#### Test 3: US Ticker (USD)
1. Search for or navigate to "AAPL" or similar US stock
2. **Verify:**
   - ✅ Price shows with $ symbol (e.g., "$150.25")
   - ✅ Currency badge shows "USD"
   - ✅ Y-axis label shows "Price ($)"

#### Test 4: Chart Data Accuracy
1. Open FRA:MSF chart
2. Compare with Google Finance or Yahoo Finance:
   - Price on your dashboard
   - Price on external source
   - Should match (within a few minutes delay is normal)

#### Test 5: Error Handling
1. Try an invalid ticker: "INVALID_TICKER_XXXXX"
2. **Verify:**
   - ✅ Shows error message
   - ✅ Shows helpful text: "Please check the symbol and try again"
   - ✅ No console errors (check F12 → Console)

---

## 🔍 Debugging Checklist

### If Price Still Shows Wrong

**Check 1: Backend returning currency?**
```bash
# In another terminal, test the API directly
curl http://127.0.0.1:8000/api/chart/FRA:MSF
```

**Expected response:**
```json
{
  "symbol": "FRA:MSF",
  "currency": "EUR",      ← Should NOT be "USD"
  "current_price": 357.0,
  "data": [...]
}
```

**Check 2: Frontend receiving currency?**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page with chart
4. Find request to `/api/chart/FRA:MSF`
5. Click it and check Response
6. Verify currency field is present and correct

**Check 3: Component using new type?**
1. In StockChart.tsx, verify import:
```typescript
import { 
  fetchStockChartData,
  type StockDataWithCurrency  // ← Should have this
} from '../services/stockChart'
```

2. Verify state:
```typescript
const [stockData, setStockData] = useState<StockDataWithCurrency | null>(null)
// NOT: const [data, setData] = useState<ChartData[]>([])
```

---

## 📊 Test Tickers by Currency

| Ticker | Currency | Exchange | Region |
|--------|----------|----------|--------|
| AAPL | USD | NASDAQ | USA |
| FRA:MSF | EUR | Frankfurt | Germany |
| GBPU.L | GBP | FTSE | UK |
| RELIANCE.NS | INR | NSE | India |
| 0700.HK | HKD | HKEX | Hong Kong |
| 005930.KS | KRW | KSX | South Korea |

**How to test:**
1. In your app, change the ticker to one from this table
2. Verify price displays with correct currency symbol
3. Verify currency badge shows correct code

---

## 🐛 Common Issues & Solutions

### Issue: Still Showing $ for Everything

**Solution:**
1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache:
   - DevTools (F12) → Application → Clear storage → Clear all
   - Then refresh
3. Check backend is actually running:
   ```bash
   curl http://127.0.0.1:8000/api/health
   ```

### Issue: "Unable to load chart data"

**Solution:**
1. Check backend error logs:
   - Should show in terminal running uvicorn
   - Look for Python exceptions
2. Verify ticker format is correct:
   - Some tickers need exchange prefix: `FRA:MSF` not just `MSF`
   - yfinance docs: https://finance.yahoo.com
3. Check API response manually:
   ```bash
   curl "http://127.0.0.1:8000/api/chart/FRA:MSF"
   ```

### Issue: Y-axis Still Shows "Price ($)"

**Solution:**
1. Verify component was saved and reloaded
2. Check import in StockChart.tsx:
   ```typescript
   import { getCurrencySymbol } from '../services/stockChart'
   ```
3. Check Y-axis label line:
   ```typescript
   label={{ value: `Price (${currencySymbol})`, angle: -90, position: 'insideLeft' }}
   ```
   Should use `currencySymbol` variable, NOT hardcoded "$"

### Issue: Chart Shows But Price/Currency Badge Missing

**Solution:**
1. Check if `stockData` is null:
   - Add console.log before render:
   ```typescript
   console.log('stockData:', stockData)
   ```
2. Verify destructuring is correct:
   ```typescript
   const currency = stockData?.currency || 'USD'
   const currentPrice = stockData?.currentPrice || 0
   ```

---

## 📱 Testing on Different Screen Sizes

- **Mobile (< 640px):** Chart should still be readable, price visible
- **Tablet (640px - 1024px):** Full chart display, all details visible
- **Desktop (> 1024px):** Maximum detail and spacing

---

## ✅ Acceptance Criteria

Your fix is working correctly if:

1. ✅ **Correct Price:**
   - FRA:MSF shows ~€357 (not $418)
   - Matches external sources (Google Finance, Yahoo)

2. ✅ **Correct Currency:**
   - Symbol changes based on currency (€, $, £, ₹, etc.)
   - Currency badge shows code (EUR, USD, GBP, INR, etc.)
   - NOT hardcoded to USD

3. ✅ **Correct Chart:**
   - Y-axis label includes currency symbol
   - Data points match real market data
   - Historical data is 30 days

4. ✅ **Good UX:**
   - Data source attributed ("Data source: yfinance")
   - Loading state shows "Fetching market data..."
   - Error messages are helpful
   - No console errors

5. ✅ **Works Internationally:**
   - At least 3 different currencies tested
   - Symbols in different exchanges work (NYSE, Frankfurt, NSE, etc.)

---

## 🎯 What Changed

| Component | Before | After |
|-----------|--------|-------|
| Backend Response | No currency | Currency included |
| Frontend Service | Returns array | Returns object with currency |
| Format Function | Hardcoded $ | Dynamic currency symbol |
| Chart Display | Always USD | Actual currency |
| Y-Axis Label | "Price ($)" | "Price (EUR)" etc |

---

## 💡 Pro Tips

1. **Test with yfinance directly:**
   ```python
   import yfinance as yf
   msf = yf.Ticker("FRA:MSF")
   print(msf.info.get("currency"))  # Should print "EUR"
   ```

2. **Monitor in DevTools:**
   - Network tab → Filter by "chart" → See API responses
   - Console tab → See any errors

3. **Compare with external sources:**
   - Google Finance: https://www.google.com/finance/quote/FRA:MSF
   - Yahoo Finance: https://finance.yahoo.com/quote/0700.HK
   - Bloomberg: https://www.bloomberg.com/quote/MSF:GR

---

## 🚀 Deploy Checklist

- [ ] Backend chart endpoint updated with currency
- [ ] Frontend service returns StockDataWithCurrency
- [ ] StockChart component uses new type
- [ ] Currency symbols mapping includes needed currencies
- [ ] Tested with at least 3 international tickers
- [ ] Error handling works gracefully
- [ ] No console errors on successful load
- [ ] Performance acceptable (< 5s total load time)
- [ ] Data accuracy verified with external sources
- [ ] Documentation updated

---

## 📞 Still Having Issues?

1. **Check the error message:** Is it from backend or frontend?
   - Backend: Look in uvicorn terminal logs
   - Frontend: Check browser DevTools Console (F12)

2. **Isolate the problem:**
   - Test API directly with curl
   - Test component in isolation
   - Check browser cache

3. **Verify the fix was applied:**
   - Search for "StockDataWithCurrency" in StockChart.tsx
   - Should find it in state declaration and import
   - If not found, file wasn't saved properly

4. **Restart everything:**
   - Kill uvicorn (Ctrl+C)
   - Kill dev server (Ctrl+C)
   - Clear browser cache
   - Restart both servers

Happy testing! 🎉
