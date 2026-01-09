## Backend Architecture

The backend is built using Node.js and Express, exposing a RESTful API that manages a stock watchlist.

- Data persistence is handled using a JSON file (`data/watchlist.json`) to simulate a database.
- The app can fetch live quotes using Yahoo Finance (server-side) with Alpha Vantage fallback.
- This approach allows rapid prototyping and optional API-key usage.
- The architecture supports easy migration to a real database or external stock API in future iterations.

### API Endpoints
- GET /api/watchlist
- POST /api/watchlist
- PUT /api/watchlist/:id
- DELETE /api/watchlist/:id

### Quotes Endpoint
- GET /api/quotes?symbols=AAPL,MSFT
	- If `symbols` is omitted, the current watchlist symbols are used.
	- Response: `{ symbols: ["AAPL"], quotes: [{ symbol, name, price, currency, change, changePercent, updatedAt, source }] }`

### Provider Configuration
- Default provider: Yahoo Finance via `yahoo-finance2` (no API key). Server-side only.
- Fallback provider: Alpha Vantage `GLOBAL_QUOTE` if Yahoo misses a symbol or fails.
	- Set environment variable `ALPHAVANTAGE_API_KEY` to enable fallback.
	- Free plan is rate-limited; consider adding caching.
- Caching: Simple in-memory cache with TTL (default 5 minutes). Configure via `QUOTES_TTL_MS`.

### SGX Tickers
- SGX symbols typically use the `.SI` suffix (e.g., `D05.SI`, `Z74.SI`, `O39.SI`, `U11.SI`).
- You can add these symbols to the watchlist or query them directly via `/api/quotes`.

### Frontend Behavior
- The UI loads the watchlist and then fetches live quotes via `/api/quotes` for those symbols.
- If a quote is available, price, currency, change and timestamp are shown with a "live" indicator; otherwise simulated prices are displayed.
