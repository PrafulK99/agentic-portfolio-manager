# Code Changes - Before & After Reference

## Backend: chart.py

### ChartResponse Model

**BEFORE:**
```python
class ChartResponse(BaseModel):
    """Chart data response."""
    symbol: str = Field(..., description="Stock ticker symbol")
    data: list[ChartDataPoint] = Field(..., description="Historical price data points")
    status: Literal["success"] = Field(default="success", description="Response status")
```

**AFTER:**
```python
class ChartResponse(BaseModel):
    """Chart data response with currency information."""
    symbol: str = Field(..., description="Stock ticker symbol")
    currency: str = Field(default="USD", description="Currency code (e.g., USD, EUR, INR)")
    current_price: float = Field(..., description="Most recent closing price")
    data: list[ChartDataPoint] = Field(..., description="Historical price data points")
    status: Literal["success"] = Field(default="success", description="Response status")
```

### Get Chart Data Endpoint

**BEFORE:**
```python
try:
    # Fetch 30 days of historical data
    ticker = yf.Ticker(symbol_upper)
    history = ticker.history(period="1mo")
    
    # ... validation ...
    
    # Convert to chart data points
    data_points: list[ChartDataPoint] = []
    for date, row in history.iterrows():
        close_price = float(row["Close"])
        date_str = date.strftime("%Y-%m-%d")
        data_points.append(ChartDataPoint(date=date_str, price=close_price))
    
    # Return response
    return ChartResponse(
        symbol=symbol_upper,
        data=data_points,
    )
```

**AFTER:**
```python
try:
    # Fetch ticker object to get metadata (currency)
    ticker = yf.Ticker(symbol_upper)
    
    # Fetch 30 days of historical data
    history = ticker.history(period="1mo")
    
    # ... validation ...
    
    # Extract currency from ticker info (default to USD if not available)
    currency = "USD"
    try:
        info = ticker.info
        if isinstance(info, dict) and "currency" in info:
            currency = info.get("currency", "USD").upper()
    except Exception:
        pass
    
    # Convert to chart data points
    data_points: list[ChartDataPoint] = []
    for date, row in history.iterrows():
        close_price = float(row["Close"])
        date_str = date.strftime("%Y-%m-%d")
        data_points.append(ChartDataPoint(date=date_str, price=close_price))
    
    # Get current price (last available data point)
    current_price = float(history["Close"].iloc[-1]) if not history.empty else 0.0
    
    # Return response with currency information
    return ChartResponse(
        symbol=symbol_upper,
        currency=currency,
        current_price=current_price,
        data=data_points,
    )
```

---

## Frontend: stockChart.ts

### File Structure

**BEFORE:**
```typescript
interface StockDataPoint {
  date: string
  close: number
}

export async function fetchStockChartData(symbol: string): Promise<StockDataPoint[]> {
  // ... returns array
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}
```

**AFTER:**
```typescript
interface StockDataPoint {
  date: string
  close: number
}

interface StockDataWithCurrency {
  symbol: string
  currency: string
  currentPrice: number
  data: StockDataPoint[]
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
  // ... 13+ more currencies
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency
}

export async function fetchStockChartData(symbol: string): Promise<StockDataWithCurrency> {
  // ... returns object with currency
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency)
  const formatted = price.toFixed(2)
  
  if (['JPY', 'CNY'].includes(currency)) {
    return `${formatted} ${symbol}`
  }
  
  return `${symbol}${formatted}`
}

export function formatPriceChange(
  change: number, 
  changePercent: number,
  currency: string = 'USD'
): string {
  const symbol = getCurrencySymbol(currency)
  const sign = change >= 0 ? '+' : ''
  const formatted = Math.abs(change).toFixed(2)
  
  if (['JPY', 'CNY'].includes(currency)) {
    return `${sign}${formatted} ${symbol} (${sign}${changePercent.toFixed(2)}%)`
  }
  
  return `${sign}${symbol}${formatted} (${sign}${changePercent.toFixed(2)}%)`
}
```

---

## Frontend: StockChart.tsx Component

### Imports

**BEFORE:**
```typescript
import { fetchStockChartData, calculatePriceChange, formatPrice } from '../services/stockChart'
```

**AFTER:**
```typescript
import { 
  fetchStockChartData, 
  calculatePriceChange, 
  formatPrice,
  formatPriceChange,
  getCurrencySymbol,
  type StockDataWithCurrency
} from '../services/stockChart'
```

### State

**BEFORE:**
```typescript
const [data, setData] = useState<ChartData[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

**AFTER:**
```typescript
const [stockData, setStockData] = useState<StockDataWithCurrency | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

### useEffect Hook

**BEFORE:**
```typescript
useEffect(() => {
  const loadChartData = async () => {
    setLoading(true)
    setError(null)
    try {
      const chartData = await fetchStockChartData(symbol)
      if (chartData.length === 0) {
        setError('No data available')
      } else {
        setData(chartData)
      }
    } catch (err) {
      setError('Failed to load chart data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  loadChartData()
}, [symbol])
```

**AFTER:**
```typescript
useEffect(() => {
  const loadChartData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStockChartData(symbol)
      if (data.data.length === 0) {
        setError('No data available for this symbol')
      } else {
        setStockData(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (symbol) {
    loadChartData()
  }
}, [symbol])
```

### Loading State

**BEFORE:**
```typescript
<p className="text-gray-600 text-sm">Loading chart data...</p>
```

**AFTER:**
```typescript
<p className="text-gray-600 text-sm">Fetching market data...</p>
```

### Error State

**BEFORE:**
```typescript
if (error || data.length === 0) {
  return (
    <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <p className="text-gray-600 text-sm">{error || 'Unable to load chart data'}</p>
        </div>
      </div>
    </Card>
  )
}
```

**AFTER:**
```typescript
if (error || !stockData || stockData.data.length === 0) {
  return (
    <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <p className="text-gray-600 text-sm font-semibold mb-2">{error || 'Unable to load chart data'}</p>
          <p className="text-gray-500 text-xs">Please check the symbol and try again</p>
        </div>
      </div>
    </Card>
  )
}
```

### Header Section

**BEFORE:**
```typescript
const priceChange = calculatePriceChange(data)
const isPositive = priceChange.change >= 0
const currentPrice = data[data.length - 1].close

return (
  <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
    <div className="mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{symbol}</h3>
          <p className="text-gray-600 text-sm">30-Day Price History</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{formatPrice(currentPrice)}</p>
          <p className={`text-sm font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{formatPrice(priceChange.change)} ({isPositive ? '+' : ''}{priceChange.changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>
    </div>
```

**AFTER:**
```typescript
const chartData = stockData.data
const priceChange = calculatePriceChange(chartData)
const isPositive = priceChange.change >= 0
const currentPrice = stockData.currentPrice
const currency = stockData.currency
const currencySymbol = getCurrencySymbol(currency)

return (
  <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
    <div className="mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{stockData.symbol}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600 text-sm">30-Day Price History</p>
            <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded">
              {currency}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(currentPrice, currency)}
          </p>
          <p className={`text-sm font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPriceChange(priceChange.change, priceChange.changePercent, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-2">Data source: yfinance</p>
        </div>
      </div>
    </div>
```

### Y-Axis Label

**BEFORE:**
```typescript
<YAxis
  tick={{ fontSize: 12, fill: '#6b7280' }}
  domain={['dataMin - 5', 'dataMax + 5']}
  label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
/>
```

**AFTER:**
```typescript
<YAxis
  tick={{ fontSize: 12, fill: '#6b7280' }}
  domain={['dataMin - 5', 'dataMax + 5']}
  label={{ value: `Price (${currencySymbol})`, angle: -90, position: 'insideLeft' }}
/>
```

### Tooltip Formatter

**BEFORE:**
```typescript
<Tooltip
  contentStyle={{ /* ... */ }}
  formatter={(value: number) => formatPrice(value)}
  labelFormatter={(label: string) => `Date: ${label}`}
/>
```

**AFTER:**
```typescript
<Tooltip
  contentStyle={{ /* ... */ }}
  formatter={(value: number) => formatPrice(value, currency)}
  labelFormatter={(label: string) => `Date: ${label}`}
/>
```

### Chart Data Passed

**BEFORE:**
```typescript
<LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
  {/* ... */}
  <XAxis
    dataKey="date"
    tick={{ fontSize: 12, fill: '#6b7280' }}
    style={{ overflow: 'visible' }}
    interval={Math.floor(data.length / 5)}
  />
```

**AFTER:**
```typescript
<LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
  {/* ... */}
  <XAxis
    dataKey="date"
    tick={{ fontSize: 12, fill: '#6b7280' }}
    style={{ overflow: 'visible' }}
    interval={Math.floor(chartData.length / 5)}
  />
```

### Line Legend

**BEFORE:**
```typescript
<Line
  type="monotone"
  dataKey="close"
  stroke="#2563eb"
  strokeWidth={2}
  dot={false}
  activeDot={{ r: 6 }}
  name="Close Price"
  isAnimationActive={true}
/>
```

**AFTER:**
```typescript
<Line
  type="monotone"
  dataKey="close"
  stroke="#2563eb"
  strokeWidth={2}
  dot={false}
  activeDot={{ r: 6 }}
  name={`Close Price (${currencySymbol})`}
  isAnimationActive={true}
/>
```

---

## Summary

**Total Changes:**
- 1 backend file: +15 lines (currency extraction)
- 1 frontend service file: +80 lines (new types, functions, mapping)
- 1 frontend component file: ~40 lines modified (use new type + formatting)

**Key Additions:**
- Currency symbol mapping (17 currencies)
- New `StockDataWithCurrency` interface
- New utility functions (`getCurrencySymbol`, `formatPriceChange`)
- Currency badge display
- Data source attribution

**Backward Compatibility:**
- ✅ Falls back to USD if currency unavailable
- ✅ No breaking changes to existing code
- ✅ All error cases handled gracefully
