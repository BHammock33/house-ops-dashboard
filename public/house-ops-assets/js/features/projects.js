import { el } from "../core/dom.js";
import { formatDue } from "../core/util.js";

function itemRow({ title, meta, done, onToggle, onDelete }){
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

  const del = document.createElement("button");
  del.className = "icon-btn icon-btn-sm";
  del.type = "button";
  del.textContent = "Delete";
  del.addEventListener("click", onDelete);

  li.appendChild(left);
  li.appendChild(del);
  return li;
}

export function initProjects(store){
  const btn = el("btnAddProject");
  if (btn){
    btn.addEventListener("click", () => {
      const text = (el("projectText")?.value || "").trim();
      const due = el("projectDue")?.value || "";
      if (!text) return;

      store.update((s) => {
        s.projects.unshift({ id: crypto.randomUUID(), text, due, done: false });
        return s;
      });

      el("projectText").value = "";
      el("projectDue").value = "";
    });
  }

  return function renderProjects(state){
    const ul = el("projectsList");
    if (!ul) return;
    ul.innerHTML = "";

    const list = [...state.projects].sort((a,b) => (a.done === b.done) ? 0 : (a.done ? 1 : -1));
    list.forEach((p) => {
      const meta = p.due ? ("Due " + formatDue(p.due)) : "";
      ul.appendChild(itemRow({
        title: p.text || "Untitled project",
        meta,
        done: !!p.done,
        onToggle: (checked) => {
          store.update((s) => {
            const idx = s.projects.findIndex(x => x.id === p.id);
            if (idx >= 0) s.projects[idx].done = checked;
            return s;
          });
        },
        onDelete: () => {
          store.update((s) => {
            s.projects = s.projects.filter(x => x.id !== p.id);
            return s;
          });
        }
      }));
    });
  };
}
