/* Home Base Dashboard
   Runs entirely in the browser. Data is stored in localStorage.
*/
(function () {
  const STORAGE_KEY = "homebase_v1";

  const DEFAULT_STATE = {
    settings: {
      title: "Home Base",
      subtitle: "A tiny personal homepage. A place to put links, notes, and “future me will thank me” stuff."
    },
    links: [
      { label: "Calendar", url: "https://calendar.google.com/" },
      { label: "Drive", url: "https://drive.google.com/" },
      { label: "Docs", url: "https://docs.google.com/" },
      { label: "Password manager", url: "https://bitwarden.com/" }
    ],
    houseNotes: "",
    projects: [],
    reading: [],
    meals: [
      { name: "Salmon bowls", ingredients: "salmon, rice, cucumber, avocado, soy sauce" },
      { name: "Chicken stir-fry", ingredients: "chicken, frozen stir-fry veggies, rice, sauce" },
      { name: "Taco night", ingredients: "tortillas, protein, salsa, cheese, lettuce" }
    ],
    mealHistory: [],
    weekly: {
      weekKey: "",  // computed
      checks: { calendar: false, money: false, food: false, house: false, people: false }
    }
  };

  
  // ---------- helpers ----------

    function getCsrfToken() {
    const m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute('content') : '';
  }

  async function apiGetState() {
    const res = await fetch('/api/house-ops/state', {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    // Could be null, {}, or a real object
    return await res.json();
  }

  async function apiSaveState(payload) {
    const res = await fetch('/api/house-ops/state', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }

  function safeParse(json) {
    try { return JSON.parse(json); } catch { return null; }
  }

  function deepMerge(base, incoming) {
    if (incoming == null || typeof incoming !== "object") return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    for (const k of Object.keys(incoming)) {
      const v = incoming[k];
      if (Array.isArray(v)) out[k] = v;
      else if (v && typeof v === "object" && base && typeof base[k] === "object") out[k] = deepMerge(base[k], v);
      else out[k] = v;
    }
    return out;
  }

  async function loadState() {
    
    let serverState = null;
    try {
      serverState = await apiGetState();
    } catch {
      serverState = null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : null;
    const merged = deepMerge(DEFAULT_STATE, parsed || {});
    merged.weekly = merged.weekly || DEFAULT_STATE.weekly;
    ensureWeeklyKey(merged);
    return merged;
  }
  let saveTimer = null;
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await apiSaveState(state);
      } catch {
        //fall back to local
      }
    }, 400);
  }

  function el(id) { return document.getElementById(id); }

  function formatDue(dueISO) {
    if (!dueISO) return "";
    const d = new Date(dueISO + "T00:00:00");
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function mondayKey(date = new Date()) {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0,10); // YYYY-MM-DD
  }

  function ensureWeeklyKey(s) {
    const key = mondayKey();
    if (s.weekly.weekKey !== key) {
      s.weekly.weekKey = key;
      s.weekly.checks = { calendar: false, money: false, food: false, house: false, people: false };
    }
  }

  function sanitizeUrl(url) {
    const u = (url || "").trim();
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    // allow mailto, tel
    if (/^(mailto:|tel:)/i.test(u)) return u;
    return "https://" + u;
  }

  // ---------- state ----------
  let state = null;

  // ---------- render ----------
  function renderTitle() {
    el("siteTitle").textContent = state.settings.title || DEFAULT_STATE.settings.title;
    el("siteSubtitle").textContent = state.settings.subtitle || DEFAULT_STATE.settings.subtitle;
    el("inputTitle").value = state.settings.title || "";
    el("inputSubtitle").value = state.settings.subtitle || "";
  }

  function renderLinks() {
    const ul = el("linksList");
    ul.innerHTML = "";
    for (const [i, link] of state.links.entries()) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = sanitizeUrl(link.url);
      a.textContent = link.label || link.url || "Link";
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      const del = document.createElement("button");
      del.className = "icon-btn";
      del.type = "button";
      del.textContent = "Remove";
      del.addEventListener("click", () => {
        state.links.splice(i, 1);
        saveState();
        renderLinks();
      });

      li.appendChild(a);
      li.appendChild(document.createTextNode(" "));
      li.appendChild(del);

      ul.appendChild(li);
    }
  }

  function renderHouseNotes() {
    el("houseNotes").value = state.houseNotes || "";
  }

  function itemRow({ title, meta, done, onToggle, onDelete, onOpen }) {
    const li = document.createElement("li");
    li.className = "item" + (done ? " done" : "");

    const left = document.createElement("div");
    left.className = "item-left";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!done;
    cb.addEventListener("change", () => onToggle(cb.checked));

    const text = document.createElement("div");
    text.className = "item-text";

    const t = document.createElement("div");
    t.className = "title";
    t.textContent = title;

    const m = document.createElement("div");
    m.className = "meta";
    m.textContent = meta || "";

    text.appendChild(t);
    if (meta) text.appendChild(m);

    left.appendChild(cb);
    left.appendChild(text);

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.gap = "8px";
    right.style.alignItems = "center";

    if (onOpen) {
      const open = document.createElement("button");
      open.className = "icon-btn";
      open.type = "button";
      open.textContent = "Open";
      open.addEventListener("click", onOpen);
      right.appendChild(open);
    }

    const del = document.createElement("button");
    del.className = "icon-btn";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", onDelete);

    right.appendChild(del);

    li.appendChild(left);
    li.appendChild(right);
    return li;
  }

  function renderProjects() {
    const ul = el("projectsList");
    ul.innerHTML = "";

    // show incomplete first
    const list = [...state.projects].sort((a,b) => (a.done === b.done) ? 0 : (a.done ? 1 : -1));
    list.forEach((p) => {
      const meta = p.due ? ("Due " + formatDue(p.due)) : "";
      ul.appendChild(itemRow({
        title: p.text || "Untitled project",
        meta,
        done: !!p.done,
        onToggle: (checked) => {
          const idx = state.projects.findIndex(x => x.id === p.id);
          if (idx >= 0) state.projects[idx].done = checked;
          saveState();
          renderProjects();
        },
        onDelete: () => {
          state.projects = state.projects.filter(x => x.id !== p.id);
          saveState();
          renderProjects();
        }
      }));
    });
  }

  function renderReading() {
    const ul = el("readingList");
    ul.innerHTML = "";

    const list = [...state.reading].sort((a,b) => (a.done === b.done) ? 0 : (a.done ? 1 : -1));
    list.forEach((r) => {
      const meta = r.url ? r.url : "";
      ul.appendChild(itemRow({
        title: r.title || "Untitled",
        meta: meta,
        done: !!r.done,
        onToggle: (checked) => {
          const idx = state.reading.findIndex(x => x.id === r.id);
          if (idx >= 0) state.reading[idx].done = checked;
          saveState();
          renderReading();
        },
        onDelete: () => {
          state.reading = state.reading.filter(x => x.id !== r.id);
          saveState();
          renderReading();
        },
        onOpen: r.url ? () => window.open(sanitizeUrl(r.url), "_blank", "noopener,noreferrer") : null
      }));
    });
  }

  function renderMeals() {
    const ul = el("mealsList");
    ul.innerHTML = "";
    state.meals.forEach((m) => {
      const li = document.createElement("li");
      li.className = "item";
      const left = document.createElement("div");
      left.className = "item-left";

      const label = document.createElement("div");
      label.className = "item-text";
      const t = document.createElement("div");
      t.className = "title";
      t.textContent = m.name || "Untitled meal";
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = (m.ingredients || "").trim();
      label.appendChild(t);
      if (m.ingredients) label.appendChild(meta);

      left.appendChild(document.createElement("div")); // spacer for alignment
      left.appendChild(label);

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.gap = "8px";

      const del = document.createElement("button");
      del.className = "icon-btn";
      del.type = "button";
      del.textContent = "Delete";
      del.addEventListener("click", () => {
        state.meals = state.meals.filter(x => x !== m);
        saveState();
        renderMeals();
      });

      right.appendChild(del);
      li.appendChild(left);
      li.appendChild(right);
      ul.appendChild(li);
    });
  }

  function setPickedMeal(meal) {
    if (!meal) {
      el("pickedMealTitle").textContent = "No pick yet.";
      el("pickedMealIngredients").textContent = "";
      el("mealHint").textContent = "";
      return;
    }
    el("pickedMealTitle").textContent = meal.name;
    el("pickedMealIngredients").textContent = (meal.ingredients || "").trim();
    el("mealHint").textContent = "Picked just now.";
  }

  function renderWeekly() {
    ensureWeeklyKey(state);
    document.querySelectorAll(".wk").forEach((cb) => {
      const k = cb.getAttribute("data-k");
      cb.checked = !!state.weekly.checks[k];
      cb.addEventListener("change", () => {
        state.weekly.checks[k] = cb.checked;
        saveState();
      }, { once: true });
    });
  }

  function renderAll() {
    renderTitle();
    renderLinks();
    renderHouseNotes();
    renderProjects();
    renderReading();
    renderMeals();
    renderWeekly();
    setPickedMeal(state.lastPickedMeal || null);
  }

  // ---------- events ----------
  let notesTimer = null;
  el("houseNotes").addEventListener("input", () => {
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      state.houseNotes = el("houseNotes").value;
      saveState();
    }, 250);
  });

  el("btnAddProject").addEventListener("click", () => {
    const text = el("projectText").value.trim();
    const due = el("projectDue").value || "";
    if (!text) return;

    state.projects.unshift({ id: crypto.randomUUID(), text, due, done: false });
    el("projectText").value = "";
    el("projectDue").value = "";
    saveState();
    renderProjects();
  });

  el("btnAddReading").addEventListener("click", () => {
    const title = el("readingTitle").value.trim();
    const url = el("readingUrl").value.trim();
    if (!title && !url) return;

    state.reading.unshift({ id: crypto.randomUUID(), title: title || url, url: url ? sanitizeUrl(url) : "", done: false });
    el("readingTitle").value = "";
    el("readingUrl").value = "";
    saveState();
    renderReading();
  });

  el("btnAddMeal").addEventListener("click", () => {
    const name = el("mealName").value.trim();
    const ingredients = el("mealIngredients").value.trim();
    if (!name) return;

    state.meals.unshift({ name, ingredients });
    el("mealName").value = "";
    el("mealIngredients").value = "";
    saveState();
    renderMeals();
  });

  el("btnPickMeal").addEventListener("click", () => {
    if (!state.meals.length) return;

    // pick something not used recently if possible
    const recent = new Set((state.mealHistory || []).slice(-5));
    const candidates = state.meals.filter(m => !recent.has(m.name));
    const pool = candidates.length ? candidates : state.meals;

    const picked = pool[Math.floor(Math.random() * pool.length)];
    state.lastPickedMeal = picked;
    state.mealHistory = [...(state.mealHistory || []), picked.name];
    saveState();
    setPickedMeal(picked);
  });

  el("btnCopyMeal").addEventListener("click", async () => {
    const picked = state.lastPickedMeal;
    if (!picked) return;
    const text = (picked.ingredients || "").trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      el("mealHint").textContent = "Ingredients copied.";
      setTimeout(() => { el("mealHint").textContent = ""; }, 1200);
    } catch {
      // fallback: select text
      el("mealHint").textContent = "Could not copy automatically. Select and copy manually.";
      setTimeout(() => { el("mealHint").textContent = ""; }, 2200);
    }
  });

  el("btnAddLink").addEventListener("click", () => {
    const label = el("newLinkLabel").value.trim();
    const url = el("newLinkUrl").value.trim();
    if (!label || !url) return;

    state.links.push({ label, url: sanitizeUrl(url) });
    el("newLinkLabel").value = "";
    el("newLinkUrl").value = "";
    saveState();
    renderLinks();
  });

  el("btnManageLinks").addEventListener("click", () => {
    const d = el("linksManager");
    d.open = true;
    d.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  el("inputTitle").addEventListener("input", () => {
    state.settings.title = el("inputTitle").value;
    saveState();
    renderTitle();
  });

  el("inputSubtitle").addEventListener("input", () => {
    state.settings.subtitle = el("inputSubtitle").value;
    saveState();
    renderTitle();
  });

  // Export/import/reset/print
  el("btnExport").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0,10);
    a.download = `homebase-export-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  });

  el("fileImport").addEventListener("change", async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const text = await file.text();
    const parsed = safeParse(text);
    if (!parsed) return;

    state = deepMerge(DEFAULT_STATE, parsed);
    ensureWeeklyKey(state);
    saveState();
    renderAll();
    ev.target.value = "";
  });

  el("btnReset").addEventListener("click", () => {
    const ok = confirm("Reset everything stored in this browser for this page? This cannot be undone.");
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    saveState();
    renderAll();
  });

  el("btnPrint").addEventListener("click", () => window.print());

  // ---------- boot ----------

  (async function boot() {
    state = await loadState();

    saveState();
    renderAll();
  })();
})();