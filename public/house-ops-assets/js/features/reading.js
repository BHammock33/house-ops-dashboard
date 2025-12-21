import { el } from "../core/dom.js";
import { sanitizeUrl } from "../core/util.js";

function itemRow({ title, meta, done, onToggle, onDelete, onOpen }){
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

  if (onOpen){
    const open = document.createElement("button");
    open.className = "icon-btn icon-btn-sm";
    open.type = "button";
    open.textContent = "Open";
    open.addEventListener("click", onOpen);
    right.appendChild(open);
  }

  const del = document.createElement("button");
  del.className = "icon-btn icon-btn-sm";
  del.type = "button";
  del.textContent = "Delete";
  del.addEventListener("click", onDelete);

  right.appendChild(del);

  li.appendChild(left);
  li.appendChild(right);
  return li;
}

export function initReading(store){
  const btn = el("btnAddReading");
  if (btn){
    btn.addEventListener("click", () => {
      const title = (el("readingTitle")?.value || "").trim();
      const url = (el("readingUrl")?.value || "").trim();
      if (!title && !url) return;

      store.update((s) => {
        s.reading.unshift({
          id: crypto.randomUUID(),
          title: title || url,
          url: url ? sanitizeUrl(url) : "",
          done: false
        });
        return s;
      });

      el("readingTitle").value = "";
      el("readingUrl").value = "";
    });
  }

  return function renderReading(state){
    const ul = el("readingList");
    if (!ul) return;
    ul.innerHTML = "";

    const list = [...state.reading].sort((a,b) => (a.done === b.done) ? 0 : (a.done ? 1 : -1));
    list.forEach((r) => {
      ul.appendChild(itemRow({
        title: r.title || "Untitled",
        meta: r.url || "",
        done: !!r.done,
        onToggle: (checked) => {
          store.update((s) => {
            const idx = s.reading.findIndex(x => x.id === r.id);
            if (idx >= 0) s.reading[idx].done = checked;
            return s;
          });
        },
        onDelete: () => {
          store.update((s) => {
            s.reading = s.reading.filter(x => x.id !== r.id);
            return s;
          });
        },
        onOpen: r.url ? () => window.open(r.url, "_blank", "noopener,noreferrer") : null
      }));
    });
  };
}
