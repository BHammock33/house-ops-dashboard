import { el } from "../core/dom.js";

function money(n){
  if (n == null || n === "") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return "";
  return `$${num.toFixed(2)}`;
}

function numOrNull(v){
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

function getPartnerChoice(){
  const maddie = document.getElementById("golfPartnerMaddie");
  if (maddie?.checked) return "maddie";
  return "boys";
}

function syncPartnerUI(){
  const partner = getPartnerChoice();
  const rowM = el("golfRowMaddie");
  const rowB = el("golfRowBoys");
  if (rowM) rowM.style.display = partner === "maddie" ? "grid" : "none";
  if (rowB) rowB.style.display = partner === "boys" ? "grid" : "none";
}

function normalizeRound(r){
  // Back-compat: if old data used maddiePlayed, translate it.
  const partner =
    r?.partner ||
    (r?.maddiePlayed === false ? "boys" : "maddie");

  const id = r?.id || crypto.randomUUID();
  const createdAt = r?.createdAt || new Date().toISOString();

  const players = r?.players || {};
  const jack = players.jack || r?.jack || {};
  const maddie = players.maddie || {};
  const boys = players.boys || {};

  return {
    id,
    createdAt,
    course: r?.course || "",
    price: r?.price ?? null,
    partner,
    players: {
      jack: {
        score: jack.score ?? null,
        rating: jack.rating ?? null,
      },
      maddie: {
        score: maddie.score ?? null,
        rating: maddie.rating ?? null,
      },
      boys: {
        score: boys.score ?? null,
        rating: boys.rating ?? null,
      },
    },
  };
}

function applyScrollCap(listEl, maxItems = 5){
  if (!listEl) return;

  const kids = Array.from(listEl.children);

  listEl.classList.remove("is-scroll");
  listEl.style.maxHeight = "";

  if (kids.length <= maxItems) return;

  const first = kids[0].getBoundingClientRect();
  const nth = kids[maxItems - 1].getBoundingClientRect();
  const height = Math.ceil((nth.bottom - first.top) + 2);

  listEl.style.maxHeight = `${height}px`;
  listEl.classList.add("is-scroll");
}

const openRounds = new Set();

export function initGolf(store){
  const btnToggle = el("btnAddGolfRound");
  const panel = el("golfAdd");
  const btnSave = el("btnSaveGolfRound");

  // Toggle listeners
  const r1 = document.getElementById("golfPartnerMaddie");
  const r2 = document.getElementById("golfPartnerBoys");
  if (r1) r1.addEventListener("change", syncPartnerUI);
  if (r2) r2.addEventListener("change", syncPartnerUI);

  // Open/close the add-round panel
  if (btnToggle && panel){
    const setLabel = () => { btnToggle.textContent = panel.classList.contains("is-open") ? "Cancel" : "Add round"; };
    setLabel();

    btnToggle.addEventListener("click", () => {
      panel.classList.toggle("is-open");
      setLabel();
      if (panel.classList.contains("is-open")){
        syncPartnerUI();
        el("golfCourse")?.focus?.();
      }
    });
  }

  // Save round
  if (btnSave){
    btnSave.addEventListener("click", () => {
      const course = (el("golfCourse")?.value || "").trim();
      const price = numOrNull(el("golfPrice")?.value);
      const partner = getPartnerChoice();

      const jack = {
        score: numOrNull(el("golfScoreJack")?.value),
        rating: numOrNull(el("golfRatingJack")?.value),
      };

      const maddie = {
        score: numOrNull(el("golfScoreMaddie")?.value),
        rating: numOrNull(el("golfRatingMaddie")?.value),
      };

      const boys = {
        score: numOrNull(el("golfScoreBoys")?.value),
        rating: numOrNull(el("golfRatingBoys")?.value),
      };

      if (!course) return;

      const newId = crypto.randomUUID();

      store.update((s) => {
        s.golf = s.golf || { rounds: [] };

        const round = normalizeRound({
          id: newId,
          createdAt: new Date().toISOString(),
          course,
          price,
          partner,
          maddiePlayed: partner === "maddie",
          players: { jack, maddie, boys },
        });

        s.golf.rounds.unshift(round);
        return s;
      });

      // Keep the newly-added round open (optional but nice)
      openRounds.clear();
      openRounds.add(newId);

      // Clear inputs
      el("golfScoreJack").value = "";
      el("golfRatingJack").value = "";
      el("golfScoreMaddie").value = "";
      el("golfRatingMaddie").value = "";
      el("golfScoreBoys").value = "";
      el("golfRatingBoys").value = "";

      // Close panel after save
      if (panel) panel.classList.remove("is-open");
      if (btnToggle) btnToggle.textContent = "Add round";

      syncPartnerUI();
    });
  }

  // Initial sync so the correct row is visible
  syncPartnerUI();

  // Return renderer
  return (state) => renderGolf(state, store);
}

function renderGolf(state, store){
  const ul = el("golfRoundsList");
  if (!ul) return;

  ul.innerHTML = "";

  const toTime = (isoLike) => {
    const t = Date.parse(isoLike);
    return Number.isFinite(t) ? t : 0;
  };

  const rounds = (state.golf?.rounds || [])
    .map(normalizeRound)
    // Newest first (top of list)
    .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));

  // Persist "The Boys" heat per streak segment, even after a Maddie round.
  // We calculate streak position in chronological order (oldest -> newest),
  // then apply the precomputed level during render (which is newest -> oldest).
  const boysLevelById = new Map();
  let boysRunIndex = 0;

  const chrono = [...rounds].sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt));
  for (const r of chrono){
    if (r.partner === "boys"){
      // First boys round in a run: level 0 (base). Second: 1. Third: 2. Fourth+: 3.
      boysLevelById.set(r.id, Math.min(boysRunIndex, 3));
      boysRunIndex += 1;
    } else {
      boysRunIndex = 0;
    }
  }

  rounds.forEach((r) => {
    const boysLevel = r.partner === "boys" ? (boysLevelById.get(r.id) ?? 0) : null;

    const li = document.createElement("li");
    li.className = "golf-round";

    // Apply warning classes to both the <li> and the <details>.
    // Level 0 is intentionally "base" styling, so we only add classes for 1+.
    if (boysLevel != null){
      li.dataset.boysLevel = String(boysLevel);
      if (boysLevel > 0) li.classList.add(`boys-streak-${boysLevel}`);
    }

    const details = document.createElement("details");
    details.className = "golf-round-details";
    details.open = openRounds.has(r.id);

    if (boysLevel != null){
      details.dataset.boysLevel = String(boysLevel);
      if (boysLevel > 0) details.classList.add(`boys-streak-${boysLevel}`);
    }

    details.addEventListener("toggle", () => {
      if (details.open) openRounds.add(r.id);
      else openRounds.delete(r.id);
    });

    const summary = document.createElement("summary");
    summary.className = "golf-round-summary";

    const header = document.createElement("div");
    header.className = "golf-round-head";

    const left = document.createElement("div");
    left.className = "golf-round-title";
    left.textContent = r.course || "Untitled course";

    const rightWrap = document.createElement("div");
    rightWrap.className = "golf-round-summary-right";

    const right = document.createElement("div");
    right.className = "golf-round-meta";
    const parts = [];
    if (r.price != null) parts.push(money(r.price));
    parts.push(r.partner === "maddie" ? "Maddie" : "The Boys");
    right.textContent = parts.filter(Boolean).join(" • ");

    const chev = document.createElement("span");
    chev.className = "golf-chevron";
    chev.setAttribute("aria-hidden", "true");
    chev.textContent = "▾";

    rightWrap.appendChild(right);
    rightWrap.appendChild(chev);

    header.appendChild(left);
    header.appendChild(rightWrap);

    summary.appendChild(header);

    // Body
    const body = document.createElement("div");
    body.className = "golf-round-body";

    const grid = document.createElement("div");
    grid.className = "golf-round-grid";

    const headRow = document.createElement("div");
    headRow.className = "golf-round-row golf-round-row-head";
    headRow.innerHTML = `
      <div class="meta">Golfer</div>
      <div class="meta">Score</div>
      <div class="meta">Rating</div>
    `;
    grid.appendChild(headRow);

    const mkRow = (name, p) => {
      const row = document.createElement("div");
      row.className = "golf-round-row";

      const n = document.createElement("div");
      n.className = "golf-name";
      n.textContent = name;

      const score = document.createElement("div");
      score.className = "golf-val";
      score.textContent = p?.score ?? "";

      const rating = document.createElement("div");
      rating.className = "golf-val";
      rating.textContent = p?.rating ?? "";

      row.appendChild(n);
      row.appendChild(score);
      row.appendChild(rating);
      return row;
    };

    grid.appendChild(mkRow("Jack", r.players.jack));
    if (r.partner === "maddie"){
      grid.appendChild(mkRow("Maddie", r.players.maddie));
    } else {
      grid.appendChild(mkRow("The Boys", r.players.boys));
    }

    const actions = document.createElement("div");
    actions.className = "golf-round-actions";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "icon-btn icon-btn-sm";
    del.textContent = "Delete";
    del.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      store.update((s) => {
        s.golf = s.golf || { rounds: [] };
        s.golf.rounds = (s.golf.rounds || []).filter(x => x.id !== r.id);
        return s;
      });
      openRounds.delete(r.id);
    });

    actions.appendChild(del);

    body.appendChild(grid);
    body.appendChild(actions);

    details.appendChild(summary);
    details.appendChild(body);

    li.appendChild(details);
    ul.appendChild(li);
  });

  applyScrollCap(ul, 5);
}