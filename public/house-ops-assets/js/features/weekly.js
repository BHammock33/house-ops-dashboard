import { el } from "../core/dom.js";

export function initWeekly(store){
  const btnAdd = el("btnAddWeekly");
  if (btnAdd){
    btnAdd.addEventListener("click", () => {
      const label = (el("newWeeklyLabel")?.value || "").trim();
      if (!label) return;

      store.update((s) => {
        const id = crypto.randomUUID();
        s.weekly.items.push({ id, label });
        s.weekly.checks[id] = false;
        return s;
      });

      el("newWeeklyLabel").value = "";
    });
  }

  return function renderWeekly(state){
    const weeklyList = el("weeklyList");
    if (!weeklyList) return;

    weeklyList.innerHTML = "";
    const items = (state.weekly && state.weekly.items) ? state.weekly.items : [];
    const checks = (state.weekly && state.weekly.checks) ? state.weekly.checks : {};

    items.forEach((it) => {
      const row = document.createElement("div");
      row.className = "week-row";

      const left = document.createElement("label");
      left.className = "week-left";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "wk";
      cb.checked = !!checks[it.id];
      cb.addEventListener("change", () => {
        store.update((s) => {
          s.weekly.checks[it.id] = cb.checked;
          return s;
        });
      });

      const span = document.createElement("span");
      span.className = "week-label";
      span.textContent = it.label;

      left.appendChild(cb);
      left.appendChild(span);

      row.appendChild(left);
      weeklyList.appendChild(row);
    });

    // Editor list
    const editor = el("weeklyItemsEditor");
    if (!editor) return;
    editor.innerHTML = "";

    items.forEach((it) => {
      const r = document.createElement("div");
      r.className = "row";

      const input = document.createElement("input");
      input.type = "text";
      input.value = it.label;

      const del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn icon-btn-sm";
      del.textContent = "Remove";
      del.addEventListener("click", () => {
        store.update((s) => {
          s.weekly.items = s.weekly.items.filter(x => x.id !== it.id);
          delete s.weekly.checks[it.id];
          return s;
        });
      });

      input.addEventListener("change", () => {
        const v = input.value.trim();
        if (!v) return;
        store.update((s) => {
          const found = s.weekly.items.find(x => x.id === it.id);
          if (found) found.label = v;
          return s;
        });
      });

      r.appendChild(input);
      r.appendChild(del);
      editor.appendChild(r);
    });
  };
}
