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

  const sM = el("golfScoreMaddie");
  const rM = el("golfRatingMaddie");
  const sB = el("golfScoreBoys");
  const rB = el("golfRatingBoys");

  const maddieOn = partner === "maddie";

  if (rowM) rowM.style.display = maddieOn ? "" : "none";
  if (rowB) rowB.style.display = maddieOn ? "none" : "";

  if (sM) sM.disabled = !maddieOn;
  if (rM) rM.disabled = !maddieOn;
  if (sB) sB.disabled = maddieOn;
  if (rB) rB.disabled = maddieOn;

  // Optional: clear the hidden side so you do not accidentally save stale values
  if (!maddieOn){
    if (sM) sM.value = "";
    if (rM) rM.value = "";
  } else {
    if (sB) sB.value = "";
    if (rB) rB.value = "";
  }
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
    // keep this boolean if any older code relies on it
    maddiePlayed: partner === "maddie",
    players: {
      jack: { score: jack.score ?? null, rating: jack.rating ?? null },
      maddie: { score: maddie.score ?? null, rating: maddie.rating ?? null },
      boys: { score: boys.score ?? null, rating: boys.rating ?? null },
    },
  };
}
function applyScrollCap(listEl, maxItems = 5){
  if (!listEl) return;

  const kids = Array.from(listEl.children);

  // Reset first so measurements are correct
  listEl.classList.remove("is-scroll");
  listEl.style.maxHeight = "";

  if (kids.length <= maxItems) return;

  // Measure the visual height of the first N items (includes grid gaps automatically)
  const first = kids[0].getBoundingClientRect();
  const nth = kids[maxItems - 1].getBoundingClientRect();

  const height = Math.ceil((nth.bottom - first.top) + 2); // +2 for breathing room

  listEl.style.maxHeight = `${height}px`;
  listEl.classList.add("is-scroll");
}

function renderGolf(state, store){
  const ul = el("golfRoundsList");
  if (!ul) return;

  ul.innerHTML = "";

  const rounds = (state.golf?.rounds || [])
    .map(normalizeRound)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  rounds.forEach((r) => {
    const li = document.createElement("li");
    li.className = "golf-round";

    const details = document.createElement("details");
    details.className = "golf-round-details";

    const summary = document.createElement("summary");
    summary.className = "golf-round-summary";

    // Header row inside summary
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

    // Body (expanded content)
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
    });

    actions.appendChild(del);

    body.appendChild(grid);
    body.appendChild(actions);

    details.appendChild(summary); // summary must be first child
    details.appendChild(body);

    li.appendChild(details);
    ul.appendChild(li);
  });
   applyScrollCap(ul, 5);
}


export function initGolf(store){
  const btnAdd = el("btnAddGolfRound");

  // Toggle listeners
  const r1 = document.getElementById("golfPartnerMaddie");
  const r2 = document.getElementById("golfPartnerBoys");
  if (r1) r1.addEventListener("change", syncPartnerUI);
  if (r2) r2.addEventListener("change", syncPartnerUI);

  // Add round
  if (btnAdd){
    btnAdd.addEventListener("click", () => {
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

      store.update((s) => {
        s.golf = s.golf || { rounds: [] };

        const round = normalizeRound({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          course,
          price,
          partner,
          maddiePlayed: partner === "maddie",
          players: {
            jack,
            maddie,
            boys,
          },
        });

        s.golf.rounds.unshift(round);
        return s;
      });

      // Clear inputs after save
      el("golfCourse").value = "";
      el("golfPrice").value = "";
      el("golfScoreJack").value = "";
      el("golfRatingJack").value = "";

      el("golfScoreMaddie").value = "";
      el("golfRatingMaddie").value = "";
      el("golfScoreBoys").value = "";
      el("golfRatingBoys").value = "";

      syncPartnerUI();
    });
  }

  // Initial sync so the correct row is visible
  syncPartnerUI();

  // Return renderer
  return (state) => renderGolf(state, store);
}
