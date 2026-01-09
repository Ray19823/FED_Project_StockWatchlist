function isValidUrl(s) {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

function normalizeBase(s) {
  if (!s) return "";
  let v = String(s).trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  // drop trailing slash
  v = v.replace(/\/$/, "");
  return isValidUrl(v) ? v : "";
}

function getApiBase() {
  // Allow override via localStorage or global
  const ls = (typeof localStorage !== "undefined") ? localStorage.getItem("API_BASE") : "";
  if (ls && typeof ls === "string") {
    const norm = normalizeBase(ls);
    if (norm) return norm;
    try { localStorage.removeItem("API_BASE"); } catch {}
  }
  if (typeof window !== "undefined" && window.API_BASE && typeof window.API_BASE === "string") {
    const norm = normalizeBase(window.API_BASE);
    if (norm) return norm;
  }
  const host = (typeof location !== "undefined") ? location.hostname.toLowerCase() : "";
  // Local dev: use same origin
  if (host === "localhost" || host === "127.0.0.1") return "";
  // GitHub Pages: auto-default to your Render URL if present
  if (host.includes("ray19823.github.io")) {
    return "https://fed-project-stockwatchlist.onrender.com";
  }
  // Other static hosts: default empty (user sets Backend URL)
  return "";
}
let API_BASE = getApiBase();
function url(p) { return `${API_BASE}${p}`; }

// Elements
let currentLiveMode = true;
let currentFilter = "";
let lastItems = [];
const watchlistEl = document.getElementById("watchlist");
const watchlistSection = document.getElementById("watchlistSection");
const achievementsSection = document.getElementById("achievementsSection");
const tabWatchlist = document.getElementById("tabWatchlist");
const tabAchievements = document.getElementById("tabAchievements");
const symbolInput = document.getElementById("symbolInput");
const nameInput = document.getElementById("nameInput");
const notesInput = document.getElementById("notesInput");
const addBtn = document.getElementById("addBtn");
const refreshBtn = document.getElementById("refreshBtn");
const liveToggle = document.getElementById("liveToggle");
const autoToggle = document.getElementById("autoToggle");
const intervalSelect = document.getElementById("intervalSelect");
const forceFresh = document.getElementById("forceFresh");
const msg = document.getElementById("msg");
const statusEl = document.getElementById("status");
const badgesEl = document.getElementById("badges");
const streakCountEl = document.getElementById("streakCount");
const devAdvanceDayBtn = document.getElementById("devAdvanceDay");
const devResetAchBtn = document.getElementById("devResetAch");
const backendUrlInput = document.getElementById("backendUrl");
const saveBackendBtn = document.getElementById("saveBackend");
const searchInput = document.getElementById("search");
const formMsgEl = document.getElementById("formMsg");

// Toast (subtle)
const toast = document.createElement("div");
toast.className =
  "fixed top-4 right-4 z-50 hidden max-w-sm rounded-lg border bg-white px-4 py-3 shadow";
toast.setAttribute("role", "status");
toast.setAttribute("aria-live", "polite");
document.body.appendChild(toast);

function showToast(text, type = "info") {
  toast.textContent = text;
  toast.classList.remove("hidden");

  toast.classList.remove("border-gray-200", "border-green-200", "border-red-200");
  if (type === "success") {
    toast.classList.add("border-green-200");
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
  } else if (type === "error") {
    toast.classList.add("border-red-200");
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
  } else {
    toast.classList.add("border-gray-200");
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
  }

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 1700);
}

function setMsg(text = "") {
  if (!msg) return;
  msg.textContent = text;
  if (text) {
    msg.setAttribute("role", "status");
    msg.setAttribute("aria-live", "polite");
  } else {
    msg.removeAttribute("role");
    msg.removeAttribute("aria-live");
  }
}

// --- Achievements state ---
const LS_ACH = "achievements";
const LS_STREAK = "streak";
const LS_LAST = "lastRefreshDate";

function getAchievements() {
  try { return JSON.parse(localStorage.getItem(LS_ACH)) || {}; } catch { return {}; }
}
function setAchievements(obj) {
  localStorage.setItem(LS_ACH, JSON.stringify(obj || {}));
}
function unlock(id) {
  const ach = getAchievements();
  if (!ach[id]) ach[id] = { unlockedAt: new Date().toISOString() };
  setAchievements(ach);
  renderAchievements();
}
function getStreak() {
  return Number(localStorage.getItem(LS_STREAK) || 0);
}
function setStreak(n) {
  localStorage.setItem(LS_STREAK, String(n));
}
function getLastDate() {
  return localStorage.getItem(LS_LAST) || "";
}
function setLastDate(iso) {
  localStorage.setItem(LS_LAST, iso);
}
function sameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}
function yesterdayOf(iso) {
  const d = new Date(iso);
  d.setDate(d.getDate() + 1);
  const now = new Date();
  return sameDay(d.toISOString(), now.toISOString());
}
function bumpStreak() {
  const nowIso = new Date().toISOString();
  const last = getLastDate();
  let streak = getStreak();
  if (!last) streak = 1;
  else if (sameDay(last, nowIso)) {
    // same calendar day: do not double-count
  } else if (yesterdayOf(last)) {
    streak += 1;
  } else {
    streak = 1;
  }
  setStreak(streak);
  setLastDate(nowIso);
  if (streak >= 3) unlock("streak3");
  if (streak >= 7) unlock("streak7");
  if (streak >= 14) unlock("streak14");
}

function renderAchievements() {
  if (!badgesEl || !streakCountEl) return;
  const ach = getAchievements();
  streakCountEl.textContent = String(getStreak());
  const defs = [
    { id: "firstItem", title: "First Watchlist Item" },
    { id: "noteTaker", title: "Note Taker" },
    { id: "streak3", title: "3-Day Streak" },
    { id: "streak7", title: "7-Day Streak" },
    { id: "streak14", title: "14-Day Streak" },
  ];
  badgesEl.innerHTML = defs.map(d => {
    const unlocked = !!ach[d.id];
    const status = unlocked ? `Unlocked • ${new Date(ach[d.id].unlockedAt).toLocaleDateString()}` : "Locked";
    const clr = unlocked ? "text-green-600 border-green-200" : "text-gray-600 border-gray-200";
    return `<div class=\"rounded border ${clr} p-4\"><div class=\"font-semibold\">${d.title}</div><div class=\"text-sm mt-1\">${status}</div></div>`;
  }).join("");
}

// --- API Helpers ---
async function apiGet() {
  const res = await fetch(url("/api/watchlist"));
  if (!res.ok) throw new Error("Failed to load watchlist");
  return res.json();
}

async function apiPost(payload) {
  const res = await fetch(url("/api/watchlist"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add stock");
  return data;
}

async function apiPut(id, payload) {
  const res = await fetch(url(`/api/watchlist/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update stock");
  return data;
}

async function apiDelete(id) {
  const res = await fetch(url(`/api/watchlist/${id}`), { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete stock");
  return data;
}

// --- Rendering ---
function render(items) {
  watchlistEl.innerHTML = "";

  const qfilter = (currentFilter || "").toLowerCase();
  const filtered = qfilter
    ? items.filter((it) =>
        (it.symbol || "").toLowerCase().includes(qfilter) || (it.name || "").toLowerCase().includes(qfilter)
      )
    : items;

  if (!filtered.length) {
    const empty = document.createElement("li");
    empty.className = "text-slate-500";
    empty.textContent = qfilter ? "No matches. Try another search." : "No stocks yet. Add one above.";
    watchlistEl.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const q = item._quote || null;
    const hasLive = !!q && typeof q.price === "number";
    const li = document.createElement("li");
    li.className = "rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition";

    // Header row
    const top = document.createElement("div");
    top.className = "flex items-start justify-between gap-3";

    const left = document.createElement("div");

    // Symbol + name
    const title = document.createElement("div");
    title.className = "text-lg font-semibold";
    title.textContent = `${item.symbol}${item.name ? " — " + item.name : ""}`;

    // Price + timestamp (live preferred)
    const meta = document.createElement("div");
    meta.className = "text-sm text-gray-600 mt-1";
    const priceNum = hasLive ? q.price : (typeof item.lastPrice === "number" ? item.lastPrice : null);
    const currency = hasLive ? (q.currency || "") : "";
    const priceTxt = priceNum != null ? priceNum.toFixed(2) : "—";
    const timeIso = hasLive ? q.updatedAt : item.updatedAt;
    const time = timeIso ? new Date(timeIso).toLocaleString() : "";
    const change = hasLive ? q.change : null;
    const changePct = hasLive ? q.changePercent : null;

    const changeColor = change != null && changePct != null
      ? (change >= 0 ? "text-green-600" : "text-red-600")
      : "text-gray-600";

    meta.innerHTML = `
      <span>Price: ${currency ? `<span>${currency}</span>` : ""} <span class="font-medium">${priceTxt}</span></span>
      ${change != null && changePct != null ? `
        <span class="mx-1">•</span>
        <span class="${changeColor}">${change.toFixed(2)} (${changePct.toFixed(2)}%)</span>
      ` : ""}
      ${time ? `<span class="mx-1">•</span><span>Updated: ${time}</span>` : ""}
      ${hasLive ? `<span class="ml-2 inline-block text-xs text-blue-600">live</span>` : ""}
      ${!currentLiveMode ? `<span class="ml-2 inline-block text-xs text-gray-600">simulated</span>` : ""}
    `;

    left.appendChild(title);
    left.appendChild(meta);

    // Buttons
    const btns = document.createElement("div");
    btns.className = "flex gap-2 shrink-0";

    const editBtn = document.createElement("button");
    editBtn.className = "px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 transition text-slate-700";
    editBtn.textContent = "Edit Notes";

    const delBtn = document.createElement("button");
    delBtn.className = "px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 transition text-red-600";
    delBtn.textContent = "Delete";

    btns.appendChild(editBtn);
    btns.appendChild(delBtn);

    top.appendChild(left);
    top.appendChild(btns);

    // Notes view
    const notesView = document.createElement("div");
    notesView.className = "mt-3 text-sm";
    notesView.innerHTML = `<span class="font-medium">Notes:</span> <span class="text-gray-700">${escapeHtml(
      item.notes || "(none)"
    )}</span>`;

    // Inline edit area (hidden)
    const editRow = document.createElement("div");
    editRow.className = "hidden mt-3 flex items-center gap-2";

    const notesEdit = document.createElement("input");
    notesEdit.className = "w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200";
    notesEdit.value = item.notes || "";
    notesEdit.placeholder = "Update notes...";

    const saveBtn = document.createElement("button");
    saveBtn.className = "h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:bg-slate-950 transition px-3";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 transition";
    cancelBtn.textContent = "Cancel";

    editRow.appendChild(notesEdit);
    editRow.appendChild(saveBtn);
    editRow.appendChild(cancelBtn);

    // --- Handlers ---
    editBtn.onclick = () => {
      editRow.classList.remove("hidden");
      notesEdit.focus();
      notesEdit.select();
    };

    cancelBtn.onclick = () => {
      notesEdit.value = item.notes || "";
      editRow.classList.add("hidden");
    };

    saveBtn.onclick = async () => {
      const newNotes = notesEdit.value.trim();

      saveBtn.disabled = true;
      cancelBtn.disabled = true;
      editBtn.disabled = true;
      delBtn.disabled = true;

      try {
        await apiPut(item.id, { notes: newNotes });
        showToast("Notes updated!", "success");
        unlock("noteTaker");
        await load();
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        saveBtn.disabled = false;
        cancelBtn.disabled = false;
        editBtn.disabled = false;
        delBtn.disabled = false;
      }
    };

    delBtn.onclick = async () => {
      const ok = confirm(`Delete ${item.symbol} from watchlist?`);
      if (!ok) return;

      delBtn.disabled = true;
      editBtn.disabled = true;

      try {
        await apiDelete(item.id);
        showToast("Deleted!", "success");
        await load();
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        delBtn.disabled = false;
        editBtn.disabled = false;
      }
    };

    li.appendChild(top);
    li.appendChild(notesView);
    li.appendChild(editRow);
    watchlistEl.appendChild(li);
  });
}

// Escape to avoid HTML injection in notes display
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

let autoTimer = null;

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function startAuto() {
  stopAuto();
  if (!autoToggle.checked) return;
  const ms = Number(intervalSelect.value || 30000);
  autoTimer = setInterval(() => refresh(), ms);
}

// --- Load/Refresh ---
async function load({ live = true, nocache = false } = {}) {
  setMsg("Loading...");
  currentLiveMode = !!live;
  const mainEl = document.getElementById("mainContent");
  if (mainEl) mainEl.setAttribute("aria-busy", "true");
  try {
    const items = await apiGet();
    lastItems = items;
    if (!live) {
      render(items);
    } else {
      const symbols = items.map((x) => x.symbol).filter(Boolean);
      let quotes = [];
      try {
        if (symbols.length) {
          const qs = new URLSearchParams({ symbols: symbols.join(",") });
          if (nocache) qs.set("nocache", "1");
          const res = await fetch(url(`/api/quotes?${qs.toString()}`));
          if (res.ok) {
            const data = await res.json();
            quotes = Array.isArray(data.quotes) ? data.quotes : [];
          }
        }
      } catch (e) {
        // Ignore quote fetch errors; fallback to simulated prices
      }
      const bySym = new Map(quotes.map((q) => [q.symbol, q]));
      const merged = items.map((it) => ({ ...it, _quote: bySym.get(it.symbol) }));
      render(merged);
    }
    setMsg("");
    if (statusEl) {
      const now = new Date();
      statusEl.textContent = `Last refresh: ${now.toLocaleTimeString()}`;
    }
  } catch (e) {
    setMsg("Failed to load watchlist.");
    showToast(e.message, "error");
  } finally {
    const mainEl2 = document.getElementById("mainContent");
    if (mainEl2) mainEl2.setAttribute("aria-busy", "false");
  }
}

// --- Add Stock ---
addBtn.addEventListener("click", async () => {
  const symbol = symbolInput.value.trim();
  const name = nameInput.value.trim();
  const notes = notesInput.value.trim();

  if (!symbol) {
    showToast("Symbol is required (e.g., AAPL)", "error");
    symbolInput.focus();
    return;
  }

  addBtn.disabled = true;
  refreshBtn.disabled = true;

  try {
    await apiPost({ symbol, name, notes });
    symbolInput.value = "";
    nameInput.value = "";
    notesInput.value = "";
    showToast("Added to watchlist!", "success");
    if (formMsgEl) {
      formMsgEl.textContent = "Added!";
      formMsgEl.classList.remove("hidden");
      clearTimeout(formMsgEl._t);
      formMsgEl._t = setTimeout(() => formMsgEl.classList.add("hidden"), 1500);
    }
    unlock("firstItem");
    await load();
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    addBtn.disabled = false;
    refreshBtn.disabled = false;
  }
});

// Refresh prices (GET triggers simulation in backend)
function refresh() {
  const live = !!liveToggle.checked;
  const nocache = !!forceFresh.checked;
  showToast(live ? "Refreshing live quotes..." : "Refreshing simulated...");
  bumpStreak();
  renderAchievements();
  return load({ live, nocache });
}

refreshBtn.addEventListener("click", refresh);

autoToggle.addEventListener("change", () => {
  startAuto();
});
intervalSelect.addEventListener("change", () => {
  startAuto();
});
liveToggle.addEventListener("change", () => {
  // On mode change, refresh immediately to reflect UI
  refresh();
});
forceFresh.addEventListener("change", () => {
  // Force fresh is dev; refresh now if toggled
  if (autoToggle.checked) startAuto();
});

// Initial load in live mode
load({ live: true, nocache: false });

// --- Tabs ---
function showTab(tab) {
  if (!watchlistSection || !achievementsSection) return;
  if (tab === "achievements") {
    achievementsSection.classList.remove("hidden");
    watchlistSection.classList.add("hidden");
    tabAchievements?.classList.add("bg-blue-600","text-white");
    tabAchievements?.classList.remove("border");
    tabWatchlist?.classList.remove("bg-blue-600","text-white");
    tabWatchlist?.classList.add("border");
    tabAchievements?.setAttribute("aria-selected", "true");
    tabWatchlist?.setAttribute("aria-selected", "false");
    renderAchievements();
  } else {
    watchlistSection.classList.remove("hidden");
    achievementsSection.classList.add("hidden");
    tabWatchlist?.classList.add("bg-blue-600","text-white");
    tabWatchlist?.classList.remove("border");
    tabAchievements?.classList.remove("bg-blue-600","text-white");
    tabAchievements?.classList.add("border");
    tabWatchlist?.setAttribute("aria-selected", "true");
    tabAchievements?.setAttribute("aria-selected", "false");
  }
}

tabWatchlist?.addEventListener("click", () => showTab("watchlist"));
tabAchievements?.addEventListener("click", () => showTab("achievements"));
showTab("watchlist");

// --- Dev controls ---
devAdvanceDayBtn?.addEventListener("click", () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  setLastDate(yesterday.toISOString());
  bumpStreak();
  renderAchievements();
  showToast("Simulated next day: streak updated", "success");
});

devResetAchBtn?.addEventListener("click", () => {
  localStorage.removeItem(LS_ACH);
  localStorage.removeItem(LS_STREAK);
  localStorage.removeItem(LS_LAST);
  renderAchievements();
  showToast("Achievements reset", "success");
});

// --- Backend URL controls ---
function syncBackendInput() {
  if (!backendUrlInput) return;
  backendUrlInput.value = API_BASE || "";
  if (!API_BASE && location.hostname.toLowerCase().includes("github.io")) {
    showToast("Tip: set Backend URL (Render) for live site", "info");
  }
}
syncBackendInput();
saveBackendBtn?.addEventListener("click", () => {
  let val = (backendUrlInput?.value || "").trim();
  const norm = normalizeBase(val);
  if (!norm) {
    showToast("Enter a valid URL, e.g. https://fed-project-stockwatchlist.onrender.com", "error");
    return;
  }
  API_BASE = norm;
  try { localStorage.setItem("API_BASE", API_BASE); } catch {}
  if (backendUrlInput) backendUrlInput.value = API_BASE;
  showToast("Backend URL saved", "success");
  refresh();
});

// --- Search filter ---
searchInput?.addEventListener("input", () => {
  currentFilter = searchInput.value.trim();
  render(lastItems.length ? lastItems : []);
});
