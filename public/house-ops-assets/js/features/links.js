import { el } from "../core/dom.js";
import { sanitizeUrl } from "../core/util.js";

export function initLinks(store){
  const btnManage = el("btnManageLinks");
  const linksManager = el("linksManager");

  if (btnManage && linksManager){
    btnManage.addEventListener("click", () => {
      linksManager.open = true;
      linksManager.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  const add = el("btnAddLink");
  if (add){
    add.addEventListener("click", () => {
      const label = (el("newLinkLabel")?.value || "").trim();
      const url = (el("newLinkUrl")?.value || "").trim();
      if (!label || !url) return;

      store.update((s) => {
        s.links.push({ label, url: sanitizeUrl(url) });
        return s;
      });

      el("newLinkLabel").value = "";
      el("newLinkUrl").value = "";
    });
  }

  const title = el("inputTitle");
  if (title){
    title.addEventListener("input", () => {
      store.update((s) => {
        s.settings.title = title.value;
        return s;
      });
    });
  }

  const subtitle = el("inputSubtitle");
  if (subtitle){
    subtitle.addEventListener("input", () => {
      store.update((s) => {
        s.settings.subtitle = subtitle.value;
        return s;
      });
    });
  }

  return function renderLinks(state){
    el("siteTitle").textContent = state.settings.title || "Home Base";
    el("siteSubtitle").textContent = state.settings.subtitle || "";

    if (title) title.value = state.settings.title || "";
    if (subtitle) subtitle.value = state.settings.subtitle || "";

    const ul = el("linksList");
    if (!ul) return;
    ul.innerHTML = "";

    state.links.forEach((link, i) => {
    const li = document.createElement("li");
      // Use the same “pill row” styling as Projects (so the Remove button is inside the pill)
      li.className = "item";

      const left = document.createElement("div");
      left.className = "item-left";

      const a = document.createElement("a");
      a.href = sanitizeUrl(link.url);
      a.textContent = link.label || link.url || "Link";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "title quick-link"; // title font + our quick-link hover underline

      const del = document.createElement("button");
      del.className = "icon-btn icon-btn-sm"; // matches the small Delete button vibe
      del.type = "button";
      del.textContent = "Remove";
      del.addEventListener("click", () => {
        store.update((s) => {
          s.links.splice(i, 1);
          return s;
        });
      });

      left.appendChild(a);
      li.appendChild(left);
      li.appendChild(del);
      ul.appendChild(li);
    });
  };
}
