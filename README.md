## Backend Architecture

The backend is built using Node.js and Express, exposing a RESTful API that manages a stock watchlist.

- Data persistence is handled using a JSON file (`data/watchlist.json`) to simulate a database.
 - Data persistence is handled using a JSON file (`data/watchlist.json`) to simulate a database.
	 - For version control hygiene, do not commit personal data: `data/watchlist.json` is git-ignored.
	 - Use the provided `data/watchlist.example.json` (empty array) and copy it to `data/watchlist.json` locally.
	 - On first run without a file, the app will operate with an empty list and write to `data/watchlist.json` when items are added.
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
- I can add these symbols to the watchlist or query them directly via `/api/quotes`.

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

## Deliverables Checklist
- **Interactive App:** Live watchlist with add/edit/delete, simulated prices, and live quotes.
- **Figma Wireframes:** Low/hi fidelity specs linked above.
- **Tech Stack:** HTML/CSS (Tailwind CDN) + JavaScript frontend; Express 4 backend.
- **Front-end Interactivity:** Tabs, auto-refresh, live/simulated badges, achievements, toasts.
- **Source Management:** Git commits, history cleanup, .gitignore, example data.
- **APIs:** Yahoo Finance v3 with Alpha Vantage fallback; caching + nocache.
- **Design & Accessibility:** Skip link, roles/landmarks, labeled inputs, live regions.
- **Testing Plan:** See below.
- **Versioned Process:** README and commit history document progress.
- **Deployment:** Frontend on GitHub Pages; Backend on Render.

## Testing Plan
- **Watchlist CRUD:** Add, edit notes, delete; verify persistence locally and on Render.
- **Quotes:** Toggle Live vs Simulated; use `Force fresh` to bypass cache; verify price and timestamp.
- **Auto-refresh:** Enable and set interval; confirm periodic updates.
- **Achievements:** Add first item, update notes, use Dev:+1 day to simulate streak progression.
- **CORS & Pages:** On Pages, set Backend URL to the Render External URL, Save, then Refresh; confirm list loads and CRUD works.
- **Error Handling:** Try duplicate symbols; observe user-friendly errors.
- **Fallback API:** With Alpha Vantage key configured on Render, verify quotes still resolve when rate-limited.

## Connecting Pages to Backend
- Open: https://Ray19823.github.io/FED_Project_StockWatchlist/
- In the controls row, paste `https://fed-project-stockwatchlist.onrender.com` into “Backend URL (Render)”.
- Click Save, then Refresh. The watchlist should load from the backend.

## Alpha Vantage Key (Security)
- Do not commit keys to the repo. In Render → Environment, add `ALPHAVANTAGE_API_KEY` with my key.
- Redeploy the service to apply.



# Stock Watchlist

One or two paragraphs providing an overview of your project. Tell us about your project.

This web app lets retail investors quickly build a personal stock watchlist, view live quotes (with a safe fallback), and jot notes. It’s simple, fast, and privacy-conscious: the watchlist is stored locally on the backend JSON file during development and ignored in git; production uses a hosted backend. The UI is responsive, accessible, and polished, with Dark Mode and a Compact view for dense lists.

Essentially, this part is your sales pitch.

The app targets users who want reliable, low-friction tracking of SG and US equities without needing an account or complex tools. It’s optimized for GitHub Pages (frontend) + Render (backend) with robust CORS and a fallback quotes provider to keep data flowing.

## Design Process

Provide us insights about your design process, focusing on who this website is for, what they want to achieve and how your project helps them achieve these things.

- Audience: Retail investors and learners who need a lightweight tracker.
- Goals: Add/search symbols, see prices and change, write notes, and refresh automatically.
- Approach: Minimal UI with clear controls, accessibility basics, and reliable backend.

### User Stories

- As a watchlist user, I want to add SG/US stock symbols so that I can track their prices.
- As a data-conscious user, I want live quotes with a fallback so that I still see prices if the primary feed is rate-limited.
- As a GitHub Pages user, I want to set the backend URL so that I can connect to my hosted API.
- As a returning user, I want auto-refresh and interval control so that I can keep prices up-to-date without manual clicks.
- As an accessibility-focused user, I want keyboard navigation and status messages so that I can operate the app without a mouse.
- As a preference-driven user, I want Dark Mode and Compact view so that I can optimize readability and density.

### Wireframes / Mockups / Diagrams

- Hi-fi UI mockups and interaction specs (Figma/XD): include your share URL or export PDFs in a docs folder.
- Suggestion: place assets under `docs/wireframes/` and link here.

## Features

Describe different parts of your project and what each does.

- Watchlist CRUD: Add, edit notes, delete symbols; fast inline edits.
- Quotes: Live via Yahoo Finance v3 with Alpha Vantage fallback; caching prevents over-fetching.
- Controls: Live toggle, auto-refresh, interval selection; force-fresh for debugging.
- Search: Filter by symbol/name; instant feedback when empty.
- Preferences: Dark Mode toggle; Compact rows for higher density.
- Health badges: Show Alpha key status; auto-refresh every 5 minutes.
- Accessibility: Skip link, ARIA roles/live regions, focus/labels.

### Existing Features

- Feature 1 (Watchlist CRUD) — allows users to manage their stocks by filling symbol/name and notes.
- Feature 2 (Quotes) — allows users to see prices/changes with a resilient fallback using TTL caching.
- Feature 3 (Controls) — allows users to customize live/auto refresh behavior including interval.
- Feature 4 (Search) — allows users to quickly locate entries in large lists.
- Feature 5 (Preferences) — allows users to toggle Dark Mode and Compact view.
- Feature 6 (Health badges) — allows users to confirm backend Alpha key status.

### Features Left to Implement

- Density slider: granular control over row height and typography.
- Export/import watchlist: JSON or CSV for portability.
- Sorting: by symbol, price, change.
- Multi-currency display options and formatting preferences.

## Technologies Used

Mention languages, frameworks, libraries, and tools.

- Node.js / Express 4 — backend server and REST APIs (https://expressjs.com/)
- CORS — secure cross-origin access between Pages and Render (https://www.npmjs.com/package/cors)
- Yahoo Finance 2 (v3 client) — primary quotes feed (https://github.com/gadicc/node-yahoo-finance2)
- Alpha Vantage — fallback quotes (https://www.alphavantage.co/)
- Tailwind CSS — rapid, consistent UI styling (https://tailwindcss.com/)
- gh-pages — deploy static frontend to GitHub Pages (https://www.npmjs.com/package/gh-pages)
- Render — host the backend service (https://render.com/)

## Testing

For scenarios not automated, test user stories manually:

- Watchlist:
  - Add a symbol with name and notes, verify it appears.
  - Edit notes inline, verify persistence.
  - Delete a symbol, verify removal.
- Quotes:
  - Toggle Live on and refresh; verify price/change and timestamps.
  - Include an invalid symbol; verify fallback source appears.
- Backend URL control:
  - On GitHub Pages, set the Render URL; verify successful health and quotes.
- Health badges:
  - Verify Alpha key status changes color/text; confirm periodic refresh.
- Cross-browser/responsive:
  - Test Chrome/Safari/Firefox, desktop/mobile widths for layout and focus states.

Interesting issues:
- URL normalization fixes on Pages (auto-prepend https://, strip trailing slash, ignore invalid saved values).
- CORS allow-list adjustments to support *.github.io and specific Pages origin.

If this section grows long, consider moving into `docs/testing.md` and link here.

## Credits

### Content
- Stock names and data sourced via Yahoo Finance; fallback via Alpha Vantage.

### Media
- No external media included beyond UI icons and styles.

### Acknowledgements
- Inspiration from common trading dashboards and lightweight watchlist tools.
- Accessibility ideas informed by WAI-ARIA Authoring Practices.
