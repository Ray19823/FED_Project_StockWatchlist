const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- CORS ---
const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ray19823.github.io",
];
const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowList = [...new Set([...defaultOrigins, ...extraOrigins])];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // same-origin or curl
      try {
        const ok =
          allowList.includes(origin) ||
          /\.github\.io$/.test(new URL(origin).hostname);
        return cb(null, ok);
      } catch {
        return cb(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
    credentials: false,
  })
);

const DATA_FILE = path.join(__dirname, "data", "watchlist.json");
const { getQuotes } = require(path.join(__dirname, "services", "quotes.js"));

// ---------- Helpers ----------
function readWatchlist() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // If file missing or invalid, fall back to empty list
    return [];
  }
}

function saveWatchlist(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

function simulatePrice(price) {
  // random change between -2% and +2%
  const change = (Math.random() * 0.04) - 0.02;
  const newPrice = price * (1 + change);
  return Math.round(newPrice * 100) / 100; // 2 dp
}

// ---------- Routes ----------
app.get("/api/health", (req, res) => res.json({ ok: true }));

// GET all watchlist items (with simulated price movement)
app.get("/api/watchlist", (req, res) => {
  const list = readWatchlist();

  const updated = list.map((item) => {
    const last = typeof item.lastPrice === "number" ? item.lastPrice : 100;
    return {
      ...item,
      lastPrice: simulatePrice(last),
      updatedAt: new Date().toISOString(),
    };
  });

  // Save simulated updates so refresh looks "live"
  saveWatchlist(updated);

  res.json(updated);
});

// GET quotes: /api/quotes?symbols=AAPL,MSFT or default to current watchlist symbols
app.get("/api/quotes", async (req, res) => {
  try {
    let symbols = [];
    const q = (req.query.symbols || "").trim();
    const noCache = String(req.query.nocache || "").toLowerCase();
    const noCacheFlag = noCache === "1" || noCache === "true";
    if (q) {
      symbols = q.split(",").map((s) => s.trim()).filter(Boolean);
    } else {
      const list = readWatchlist();
      symbols = list.map((x) => x.symbol).filter(Boolean);
    }

    const results = await getQuotes(symbols, { noCache: noCacheFlag });
    res.json({ symbols: symbols.map((s) => s.toUpperCase()), quotes: results });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quotes" });
  }
});

// POST add new stock
app.post("/api/watchlist", (req, res) => {
  const { symbol, name = "", notes = "" } = req.body;

  if (!symbol || typeof symbol !== "string" || !symbol.trim()) {
    return res.status(400).json({ error: "symbol is required" });
  }

  const list = readWatchlist();

  const normalizedSymbol = symbol.trim().toUpperCase();

  // prevent duplicates
  const exists = list.some((x) => x.symbol === normalizedSymbol);
  if (exists) {
    return res.status(409).json({ error: "symbol already exists in watchlist" });
  }

  const nextId = list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;

  const newItem = {
    id: nextId,
    symbol: normalizedSymbol,
    name: name.trim(),
    notes: notes.trim(),
    lastPrice: 100,
    updatedAt: new Date().toISOString(),
  };

  list.push(newItem);
  saveWatchlist(list);

  res.status(201).json(newItem);
});

// PUT update notes/name (and optional target fields later)
app.put("/api/watchlist/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const { name, notes } = req.body;

  const list = readWatchlist();
  const idx = list.findIndex((x) => x.id === id);

  if (idx === -1) return res.status(404).json({ error: "Item not found" });

  if (typeof name === "string") list[idx].name = name.trim();
  if (typeof notes === "string") list[idx].notes = notes.trim();

  list[idx].updatedAt = new Date().toISOString();

  saveWatchlist(list);
  res.json(list[idx]);
});

// DELETE remove item
app.delete("/api/watchlist/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const list = readWatchlist();
  const exists = list.some((x) => x.id === id);
  if (!exists) return res.status(404).json({ error: "Item not found" });

  const updated = list.filter((x) => x.id !== id);
  saveWatchlist(updated);

  res.json({ message: "Deleted successfully" });
});

// SPA-ish homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
