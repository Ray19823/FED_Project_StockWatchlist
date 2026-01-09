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
