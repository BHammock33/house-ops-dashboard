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

function syncMaddieInputs(){
  const played = !!el("golfMaddiePlayed")?.checked;
  const score = el("golfScoreMaddie");
  const rating = el("golfRatingMaddie");

  if (!score || !rating) return;

  score.disabled = !played;
  rating.disabled = !played;

  if (!played){
    score.value = "";
    rating.value = "";
  }
}

function readPlayer(scoreId, ratingId){
  return {
    score: numOrNull(el(scoreId)?.value),
    rating: numOrNull(el(ratingId)?.value),
  };
}

function clearRoundInputs(){
  const ids = [
    "golfCourse",
    "golfPrice",
    "golfScoreJack",
    "golfRatingJack",
    "golfScoreMaddie",
    "golfRatingMaddie",
    "golfScoreBoys",
    "golfRatingBoys",
  ];
  for (const id of ids){
    const node = el(id);
    if (node) node.value = "";
  }
  // keep checkbox state as-is; just re-sync disables
  syncMaddieInputs();
}

function renderGolfRounds(state, store){
  const ul = el("golfRoundsList");
  if (!ul) return;

  ul.innerHTML = "";

  const rounds = [...(state.golf?.rounds || [])].sort((a, b) => {
    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  });

  for (const r of rounds){
    const li = document.createElement("li");
    li.className = "golf-round";

    // header
    const header = document.createElement("div");
    header.className = "golf-round-head";

    const title = document.createElement("div");
    title.className = "golf-round-title";
    title.textContent = r.course || "Untitled course";

    const meta = document.createElement("div");
    meta.className = "golf-round-meta";
    const parts = [];
    if (r.price != null) parts.push(money(r.price));
    parts.push(r.maddiePlayed ? "Maddie played" : "Maddie sat out");
    meta.textContent = parts.filter(Boolean).join(" • ");

    header.appendChild(title);
    header.appendChild(meta);

    // grid
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

    grid.appendChild(mkRow("Jack", r.players?.jack));
    grid.appendChild(mkRow("Maddie", r.players?.maddie));
    grid.appendChild(mkRow("The Boys", r.players?.boys));

    // actions
    const actions = document.createElement("div");
    actions.className = "golf-round-actions";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "icon-btn icon-btn-sm";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      store.update((s) => {
        s.golf = s.golf || { rounds: [] };
        s.golf.rounds = (s.golf.rounds || []).filter(x => x.id !== r.id);
        return s;
      });
    });

    actions.appendChild(del);

    li.appendChild(header);
    li.appendChild(grid);
    li.appendChild(actions);

    ul.appendChild(li);
  }
}

export function initGolfRounds(store){
  const btnAdd = el("btnAddGolfRound");
  const chk = el("golfMaddiePlayed");

  if (chk){
    chk.addEventListener("change", syncMaddieInputs);
    syncMaddieInputs();
  }

  if (btnAdd){
    btnAdd.addEventListener("click", () => {
      const course = (el("golfCourse")?.value || "").trim();
      const price = numOrNull(el("golfPrice")?.value);
      const maddiePlayed = !!el("golfMaddiePlayed")?.checked;

      if (!course) return;

      const jack = readPlayer("golfScoreJack", "golfRatingJack");
      const boys = readPlayer("golfScoreBoys", "golfRatingBoys");

      const maddie = maddiePlayed
        ? readPlayer("golfScoreMaddie", "golfRatingMaddie")
        : { score: null, rating: null };

      store.update((s) => {
        s.golf = s.golf || { rounds: [] };
        s.golf.rounds = Array.isArray(s.golf.rounds) ? s.golf.rounds : [];

        s.golf.rounds.unshift({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          course,
          price,
          maddiePlayed,
          players: { jack, maddie, boys },
        });

        return s;
      });

      clearRoundInputs();
    });
  }

  // render function
  return (state) => {
    syncMaddieInputs();
    renderGolfRounds(state, store);
  };
}