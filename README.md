## Backend Architecture

The backend is built using Node.js and Express, exposing a RESTful API that manages a stock watchlist.

- Data persistence is handled using a JSON file (`data/watchlist.json`) to simulate a database.
 - Data persistence is handled using a JSON file (`data/watchlist.json`) to simulate a database.
	 - For version control hygiene, do not commit personal data: `data/watchlist.json` is git-ignored.
	 - Use the provided `data/watchlist.example.json` (empty array) and copy it to `data/watchlist.json` locally.
	 - On first run without a file, the app will operate with an empty list and write to `data/watchlist.json` when you add items.
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

### Live Refresh Controls
- Live Quotes: toggles between fetching live quotes vs. using simulated backend prices.
- Auto-refresh: when enabled, periodically refreshes using the selected interval (15s/30s/60s). This respects server caching.
- Force fresh (dev): sets `nocache=1` when calling `/api/quotes` to bypass the server cache. Use sparingly.
- Server cache TTL: configure via `QUOTES_TTL_MS` (default 5 minutes). Set `QUOTES_TTL_MS=0` during development to always fetch fresh quotes.

### Setup: Watchlist Data
- The app stores your watchlist in `data/watchlist.json` locally (git-ignored).
- To start fresh, copy the example file:
	- macOS/Linux: `cp data/watchlist.example.json data/watchlist.json`
	- Windows (PowerShell): `Copy-Item data/watchlist.example.json data/watchlist.json`
- Alternatively, just add a stock in the UI and the file will be created automatically.

## Submission Links 
- Figma Prototype: https://www.figma.com/design/4cflDpcaFhl7MQE4OiwQtI/FED-–-Stock-Watchlist-App?node-id=0-1&p=f&t=RV0dmdlZoJu9Bx1n-0
- GitHub Pages (Frontend): [https://Ray19823.github.io/FED_Project_StockWatchlist/]
- Live Backend (Server/Serverless): [https://fed-project-stockwatchlist.onrender.com]

 See design brief at [docs/design/figma-brief.md](docs/design/figma-brief.md) and hi-fi specs at
 [docs/design/hifi-desktop.md](docs/design/hifi-desktop.md) and [docs/design/hifi-mobile.md](docs/design/hifi-mobile.md). Achievements spec: [docs/design/achievements.md](docs/design/achievements.md).

## Deployment

### GitHub Pages (Frontend)
- Install tooling: `npm install --save-dev gh-pages`
- Add script: `deploy:pages` to publish the `public/` folder (already configured).
- Deploy: `npm run deploy:pages` — creates/updates the `gh-pages` branch.
- Settings → Pages: Source = `gh-pages` branch.
- On Ray19823.github.io, the app auto-uses the Render URL; can still override via the Backend URL field.

### Render (Backend)
- Render auto-detects Node apps. Use the included `render.yaml` or create a Web Service from the repo.
- Build: `npm ci`
- Start: `npm start`
- Environment variables:
	- `PORT` (provided by Render)
	- `QUOTES_TTL_MS` (e.g., `300000` default 5 minutes; `0` for dev)
	- `ALPHAVANTAGE_API_KEY` (optional fallback provider)
	- `CORS_ORIGINS` (include my GitHub Pages origin, e.g., `https://Ray19823.github.io`)

Once deployed, set CORS or use same-origin when front-end calls the backend.
