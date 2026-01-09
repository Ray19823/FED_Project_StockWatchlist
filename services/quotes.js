const fs = require("fs");
const path = require("path");

// Simple in-memory cache with TTL per symbol
const CACHE = new Map(); // key: symbol, value: { data, expiresAt }
const DEFAULT_TTL_MS = Number(process.env.QUOTES_TTL_MS || 5 * 60 * 1000); // 5 minutes

// Attempt to load yahoo-finance2 lazily so the app still runs without it
let yahooFinance = null;
try {
  // eslint-disable-next-line global-require
  const yf = require("yahoo-finance2");
  // v3 requires instantiation
  const YahooFinanceClass = yf.YahooFinance || yf.default;
  yahooFinance = new YahooFinanceClass();
} catch (_) {
  yahooFinance = null;
}

const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY || "";

function now() {
  return Date.now();
}

function getFromCache(symbol) {
  const entry = CACHE.get(symbol);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    CACHE.delete(symbol);
    return null;
  }
  return entry.data;
}

function setCache(symbol, data, ttlMs = DEFAULT_TTL_MS) {
  CACHE.set(symbol, { data, expiresAt: now() + ttlMs });
}

function normalizeYahooQuote(q) {
  if (!q) return null;
  const price =
    q.regularMarketPrice ?? q.postMarketPrice ?? q.preMarketPrice ?? null;
  const ts = q.regularMarketTime || q.postMarketTime || q.preMarketTime || null;
  return {
    symbol: (q.symbol || "").toUpperCase(),
    name: q.longName || q.shortName || q.displayName || "",
    price: typeof price === "number" ? price : null,
    currency: q.currency || null,
    change: q.regularMarketChange ?? null,
    changePercent: q.regularMarketChangePercent ?? null,
    updatedAt: ts
      ? (typeof ts === "number" ? new Date(ts * 1000).toISOString() : new Date(ts).toISOString())
      : new Date().toISOString(),
    source: "yahoo",
  };
}

function normalizeAlphaVantageQuote(raw, symbol) {
  const gq = raw && (raw["Global Quote"] || raw["GlobalQuote"] || raw.globalQuote);
  if (!gq) return null;
  const priceStr = gq["05. price"] || gq.price || gq["price"]; 
  const prevStr = gq["08. previous close"] || gq.previousClose;
  const changeStr = gq["09. change"] || gq.change;
  const pctStr = gq["10. change percent"] || gq.changePercent;
  const price = priceStr != null ? Number(priceStr) : null;
  const change = changeStr != null ? Number(changeStr) : (price != null && prevStr != null ? price - Number(prevStr) : null);
  const changePercent = pctStr ? Number(String(pctStr).replace("%", "")) : (price != null && prevStr != null ? ((price - Number(prevStr)) / Number(prevStr)) * 100 : null);
  return {
    symbol: (gq["01. symbol"] || gq.symbol || symbol || "").toUpperCase(),
    name: "",
    price: Number.isFinite(price) ? price : null,
    currency: null,
    change: Number.isFinite(change) ? change : null,
    changePercent: Number.isFinite(changePercent) ? changePercent : null,
    updatedAt: new Date().toISOString(),
    source: "alphavantage",
  };
}

async function fetchYahoo(symbols) {
  if (!yahooFinance) return [];
  try {
    // yahoo-finance2 accepts array or string
    const result = await yahooFinance.quote(symbols);
    const list = Array.isArray(result) ? result : [result];
    return list.filter(Boolean).map(normalizeYahooQuote).filter(Boolean);
  } catch (err) {
    return [];
  }
}

async function fetchAlphaVantage(symbol) {
  if (!ALPHAVANTAGE_API_KEY) return null;
  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "GLOBAL_QUOTE");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("apikey", ALPHAVANTAGE_API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  return normalizeAlphaVantageQuote(data, symbol);
}

async function getQuotesRaw(symbols) {
  const unique = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)));
  if (unique.length === 0) return [];

  // 1) Try cache
  const out = [];
  const toFetch = [];
  for (const s of unique) {
    const cached = getFromCache(s);
    if (cached) out.push(cached);
    else toFetch.push(s);
  }

  // 2) Try Yahoo for remaining
  const yahooResults = await fetchYahoo(toFetch);
  const got = new Set();
  for (const q of yahooResults) {
    setCache(q.symbol, q);
    out.push(q);
    got.add(q.symbol);
  }

  // 3) Fallback to Alpha Vantage for missing
  const stillMissing = toFetch.filter((s) => !got.has(s));
  for (const s of stillMissing) {
    try {
      const q = await fetchAlphaVantage(s);
      if (q) {
        setCache(s, q);
        out.push(q);
      }
    } catch (_) {
      // ignore
    }
  }

  // Return in the order of input uniques
  const bySymbol = new Map(out.map((q) => [q.symbol, q]));
  return unique.map((s) => bySymbol.get(s) || { symbol: s, error: "not_found" });
}

async function getQuotes(symbolsOrString) {
  const syms = Array.isArray(symbolsOrString)
    ? symbolsOrString
    : String(symbolsOrString || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  return getQuotesRaw(syms);
}

module.exports = {
  getQuotes,
};
