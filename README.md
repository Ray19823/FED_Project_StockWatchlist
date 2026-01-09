## Backend Architecture

The backend is built using Node.js and Express, exposing a RESTful API that manages a stock watchlist.

- Data persistence is handled using a JSON file (`data/watchlist.json`) to simulate a database.
- This approach allows rapid prototyping without reliance on third-party APIs or API keys.
- The architecture supports easy migration to a real database or external stock API in future iterations.

### API Endpoints
- GET /api/watchlist
- POST /api/watchlist
- PUT /api/watchlist/:id
- DELETE /api/watchlist/:id
