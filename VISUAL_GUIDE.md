# Visual Guide - Stock Price & Currency Fix

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  StockChart.tsx Component                                      │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │                                                                │    │
│  │  1. Renders chart for symbol: "FRA:MSF"                       │    │
│  │                                                                │    │
│  │  2. Calls: fetchStockChartData("FRA:MSF")                     │    │
│  │                                                                │    │
│  └────────────────┬─────────────────────────────────────────────┘    │
│                   │                                                     │
│                   ▼                                                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  stockChart.ts Service                                         │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │                                                                │    │
│  │  GET /api/chart/FRA:MSF                                        │    │
│  │           │                                                    │    │
│  │           ▼                                                    │    │
│  │  Receive JSON:                                                 │    │
│  │  {                                                             │    │
│  │    symbol: "FRA:MSF",                                          │    │
│  │    currency: "EUR",         ← NEW!                            │    │
│  │    current_price: 357.00,   ← NEW!                            │    │
│  │    data: [...]                                                 │    │
│  │  }                                                             │    │
│  │           │                                                    │    │
│  │           ▼                                                    │    │
│  │  Transform to StockDataWithCurrency                            │    │
│  │           │                                                    │    │
│  └─────────────┼────────────────────────────────────────────────┘    │
│                │                                                       │
│                ▼                                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Back to StockChart Component                                  │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │                                                                │    │
│  │  const currency = stockData.currency  // "EUR"               │    │
│  │  const currencySymbol = getCurrencySymbol("EUR")  // "€"     │    │
│  │  const currentPrice = stockData.currentPrice  // 357.00      │    │
│  │                                                                │    │
│  │  DISPLAY:                                                      │    │
│  │  ┌──────────────────────────────────────────────┐              │    │
│  │  │  FRA:MSF                                     │              │    │
│  │  │  30-Day Price History  [EUR]                 │              │    │
│  │  │                                              │              │    │
│  │  │  €357.00                                     │              │    │
│  │  │  +€12.50 (+3.62%)                            │              │    │
│  │  │  Data source: yfinance                       │              │    │
│  │  │                                              │              │    │
│  │  │  ┌──────────────────────────────────────┐   │              │    │
│  │  │  │ Chart with:                          │   │              │    │
│  │  │  │ Y-Axis: "Price (€)"                  │   │              │    │
│  │  │  │ Prices formatted: €357.00, €359.25   │   │              │    │
│  │  │  └──────────────────────────────────────┘   │              │    │
│  │  └──────────────────────────────────────────────┘              │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▲
                                   │
                                   │ Network Request
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
┌───────────────────────────────────────────────────────────────────────┐
│                       YOUR BACKEND API                               │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  GET /api/chart/{symbol}                                             │
│            │                                                         │
│            ▼                                                         │
│  ┌───────────────────────────────────────────────┐                   │
│  │  chart.py Handler                            │                   │
│  ├───────────────────────────────────────────────┤                   │
│  │                                               │                   │
│  │  1. Get symbol: "FRA:MSF"                     │                   │
│  │  2. Validate symbol                          │                   │
│  │  3. Call yfinance...                          │                   │
│  │                                               │                   │
│  └──────────────┬────────────────────────────────┘                   │
│                 │                                                    │
│                 ▼                                                    │
│  ┌───────────────────────────────────────────────┐                   │
│  │  yfinance API                                 │                   │
│  ├───────────────────────────────────────────────┤                   │
│  │                                               │                   │
│  │  ticker = yf.Ticker("FRA:MSF")               │                   │
│  │           │                                   │                   │
│  │           ▼                                   │                   │
│  │  history = ticker.history(period="1mo")     │                   │
│  │           │ 30 days of OHLCV data           │                   │
│  │           │                                   │                   │
│  │           ▼                                   │                   │
│  │  info = ticker.info                         │                   │
│  │         │ {currency: "EUR", ...}             │                   │
│  │         │ ← NEW EXTRACTION!                  │                   │
│  │         │                                     │                   │
│  │         ▼                                     │                   │
│  └──────────────┬────────────────────────────────┘                   │
│                 │                                                    │
│                 ▼                                                    │
│  ┌───────────────────────────────────────────────┐                   │
│  │  Back to chart.py                             │                   │
│  ├───────────────────────────────────────────────┤                   │
│  │                                               │                   │
│  │  currency = info.get("currency", "USD")     │                   │
│  │           = "EUR"                            │                   │
│  │                                               │                   │
│  │  current_price = history["Close"].iloc[-1]  │                   │
│  │                = 357.00                      │                   │
│  │                                               │                   │
│  │  Build response:                              │                   │
│  │  {                                            │                   │
│  │    symbol: "FRA:MSF",                        │                   │
│  │    currency: "EUR",        ← NEW!            │                   │
│  │    current_price: 357.00,  ← NEW!            │                   │
│  │    data: [                                    │                   │
│  │      {date: "2026-04-15", price: 350.25},   │                   │
│  │      {date: "2026-04-16", price: 352.75},   │                   │
│  │      ...                                      │                   │
│  │    ]                                          │                   │
│  │  }                                            │                   │
│  │                                               │                   │
│  │  Return to client                             │                   │
│  │                                               │                   │
│  └───────────────────────────────────────────────┘                   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Transformation

### Before Fix
```
┌──────────────────────────────────────┐
│        FRA: MSF                      │
│        30-Day Price History          │
│                                      │
│        $418.07            ← Wrong!   │
│        +$5.32 (+1.29%)               │
│                                      │
│        Price ($)          ← Always $ │
│        ▲                              │
│        │        ╱╲                    │
│    $420│      ╱  ╲                   │
│        │    ╱      ╲                  │
│    $400│  ╱          ╲               │
│        │╱──────────────╲             │
│        └──────────────→ │            │
│        Apr 15    Apr 30                │
│                                      │
└──────────────────────────────────────┘
```

### After Fix
```
┌──────────────────────────────────────┐
│  FRA:MSF               [EUR]          │
│  30-Day Price History                │
│                                      │
│  €357.00              ← Correct!     │
│  +€12.50 (+3.62%)                    │
│  Data source: yfinance               │
│                                      │
│  Price (€)           ← Dynamic!      │
│  ▲                                    │
│  │        ╱╲                          │
│€360│      ╱  ╲                       │
│  │    ╱      ╲                        │
│€340│  ╱          ╲                   │
│  │╱──────────────╲                   │
│  └──────────────→ │                  │
│  Apr 15    Apr 30                     │
│                                      │
└──────────────────────────────────────┘
```

---

## 💱 Currency Symbol Mapping

```
                     CURRENCY_SYMBOLS
                    ┌─────────────────┐
                    │   Mapping       │
                    ├─────────────────┤
USD ────────────►   │ "USD" → "$"     │
EUR ────────────►   │ "EUR" → "€"     │
GBP ────────────►   │ "GBP" → "£"     │
JPY ────────────►   │ "JPY" → "¥"     │
INR ────────────►   │ "INR" → "₹"     │
...17+ more...      │ ...             │
                    └─────────────────┘
                          ▲
                          │
                    formatPrice(value, currency)
                    getCurrencySymbol(currency)
```

---

## 🎯 Request/Response Cycle

### Scenario: User Views FRA:MSF

```
FRONTEND                           BACKEND                    YFINANCE
──────────────────────────────────────────────────────────────────────

1. User views chart
   for "FRA:MSF"
        │
        ├─ useEffect triggers
        │  fetchStockChartData("FRA:MSF")
        │
        ├─ Loading state: "Fetching market data..."
        │
        ├──────────────────────────────────────────────►
                GET /api/chart/FRA:MSF
                                                     
                                       └─ Receives "FRA:MSF"
                                       │
                                       ├─ yf.Ticker("FRA:MSF")
                                       │
                                       ├──────────────────────────►
                                                  Fetch data
                                       │◄──────────────────────────
                                       │  Returns:
                                       │  - history: 30 days prices
                                       │  - info: {currency: "EUR"}
                                       │
                                       ├─ Extract: currency = "EUR"
                                       ├─ Extract: current_price = 357.00
                                       ├─ Format: data points
                                       │
                                       └─ Build response

        ◄──────────────────────────────────────────────────────────
        Response JSON with:
        {
          symbol: "FRA:MSF",
          currency: "EUR",          ← Key!
          current_price: 357.00,    ← Key!
          data: [...]
        }
        │
        ├─ Parse response
        ├─ Set stockData state
        ├─ Update loading = false
        │
        ├─ Render with:
        │  - currencySymbol = getCurrencySymbol("EUR") = "€"
        │  - formatPrice(357.00, "EUR") = "€357.00"
        │  - formatPrice(5.00, "EUR") = "€5.00"
        │
        └─ Display to user:
           €357.00 (Correct!)
           
```

---

## 🔀 Type Flow

```
API Response (JSON)
│
├─ symbol: string
├─ currency: string       ← NEW
├─ current_price: number  ← NEW
└─ data: ChartDataPoint[]

       ▼ (Transform in service)

StockDataWithCurrency (TypeScript)
│
├─ symbol: string
├─ currency: string       ← Used for formatting
├─ currentPrice: number   ← Used for display
└─ data: StockDataPoint[]

       ▼ (Passed to component)

StockChart Component
│
├─ Uses: currency
├─ Uses: currentPrice
├─ Uses: data
└─ Uses: getCurrencySymbol(currency)

       ▼ (Rendered on screen)

User Sees: €357.00
           ^^^^^^
           Correct!
```

---

## 🔌 Integration Points

```
┌─────────────────────────────────┐
│   Existing Components Using      │
│   StockChart Component           │
├─────────────────────────────────┤
│                                 │
│  • Portfolio Detail Page         │
│  • Holdings Table                │
│  • Any ticker display            │
│                                 │
│  ✅ All work with new code      │
│  ✅ No changes needed            │
│                                 │
└─────────────────────────────────┘
        ▲
        │ Uses
        │
┌─────────────────────────────────┐
│   StockChart Component           │
│   (UPDATED)                     │
├─────────────────────────────────┤
│                                 │
│  Imports from:                  │
│  • stockChart.ts (UPDATED)      │
│    - fetchStockChartData()      │
│    - formatPrice()              │
│    - getCurrencySymbol()        │
│                                 │
└─────────────────────────────────┘
        ▲
        │ Uses
        │
┌─────────────────────────────────┐
│   stockChart.ts Service         │
│   (UPDATED)                     │
├─────────────────────────────────┤
│                                 │
│  Calls:                         │
│  • GET /api/chart/{symbol}      │
│                                 │
└─────────────────────────────────┘
        ▲
        │ Calls
        │
┌─────────────────────────────────┐
│   Backend API                   │
│   chart.py (UPDATED)            │
├─────────────────────────────────┤
│                                 │
│  Uses:                          │
│  • yfinance.Ticker()            │
│  • ticker.info (currency)       │
│  • ticker.history() (data)      │
│                                 │
└─────────────────────────────────┘
```

---

## ✨ Key Improvements

```
OLD                          NEW
───────────────────────────────────────────
Hardcoded "$"        ──►     Dynamic "€", "$", "£", "₹"
Always USD           ──►     Actual currency from API
No currency info     ──►     Currency code in response
No data source       ──►     "Data source: yfinance"
Generic error msg    ──►     Helpful error messages
Int'l tickers broken ──►     FRA:, NSE:, HK:, etc. work
```

---

That's the complete picture! 🎉
