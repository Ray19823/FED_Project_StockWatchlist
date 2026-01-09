const API = "/api/watchlist";

// Elements
const watchlistEl = document.getElementById("watchlist");
const symbolInput = document.getElementById("symbolInput");
const nameInput = document.getElementById("nameInput");
const notesInput = document.getElementById("notesInput");
const addBtn = document.getElementById("addBtn");
const refreshBtn = document.getElementById("refreshBtn");
const msg = document.getElementById("msg");

// Toast (subtle)
const toast = document.createElement("div");
toast.className =
  "fixed top-4 right-4 z-50 hidden max-w-sm rounded-lg border bg-white px-4 py-3 shadow";
document.body.appendChild(toast);

function showToast(text, type = "info") {
  toast.textContent = text;
  toast.classList.remove("hidden");

  toast.classList.remove("border-gray-200", "border-green-200", "border-red-200");
  if (type === "success") toast.classList.add("border-green-200");
  else if (type === "error") toast.classList.add("border-red-200");
  else toast.classList.add("border-gray-200");

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 1700);
}

function setMsg(text = "") {
  msg.textContent = text;
}

// --- API Helpers ---
async function apiGet() {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Failed to load watchlist");
  return res.json();
}

async function apiPost(payload) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add stock");
  return data;
}

async function apiPut(id, payload) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update stock");
  return data;
}

async function apiDelete(id) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete stock");
  return data;
}

// --- Rendering ---
function render(items) {
  watchlistEl.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "text-gray-500";
    empty.textContent = "No stocks yet. Add one above.";
    watchlistEl.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "border rounded p-4 bg-gray-50";

    // Header row
    const top = document.createElement("div");
    top.className = "flex items-start justify-between gap-3";

    const left = document.createElement("div");

    // Symbol + name
    const title = document.createElement("div");
    title.className = "text-lg font-semibold";
    title.textContent = `${item.symbol}${item.name ? " — " + item.name : ""}`;

    // Price + timestamp (simulated)
    const meta = document.createElement("div");
    meta.className = "text-sm text-gray-600 mt-1";
    const price = typeof item.lastPrice === "number" ? item.lastPrice.toFixed(2) : "—";
    const time = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "";
    meta.textContent = `Price: $${price}${time ? " • Updated: " + time : ""}`;

    left.appendChild(title);
    left.appendChild(meta);

    // Buttons
    const btns = document.createElement("div");
    btns.className = "flex gap-2 shrink-0";

    const editBtn = document.createElement("button");
    editBtn.className =
      "border border-blue-500 text-blue-600 px-3 py-1 rounded hover:bg-blue-50";
    editBtn.textContent = "Edit Notes";

    const delBtn = document.createElement("button");
    delBtn.className =
      "border border-red-500 text-red-600 px-3 py-1 rounded hover:bg-red-50";
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
    notesEdit.className = "w-full border rounded px-3 py-2";
    notesEdit.value = item.notes || "";
    notesEdit.placeholder = "Update notes...";

    const saveBtn = document.createElement("button");
    saveBtn.className = "bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "border px-3 py-2 rounded hover:bg-gray-50";
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

// --- Load/Refresh ---
async function load() {
  setMsg("Loading...");
  try {
    const items = await apiGet();
    render(items);
    setMsg("");
  } catch (e) {
    setMsg("Failed to load watchlist.");
    showToast(e.message, "error");
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
    await load();
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    addBtn.disabled = false;
    refreshBtn.disabled = false;
  }
});

// Refresh prices (GET triggers simulation in backend)
refreshBtn.addEventListener("click", async () => {
  showToast("Refreshing prices...");
  await load();
});

load();
