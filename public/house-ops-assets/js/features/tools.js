import { el } from "../core/dom.js";
import { safeParse } from "../core/util.js";

export function initTools(store){
  const btnExport = el("btnExport");
  if (btnExport){
    btnExport.addEventListener("click", () => {
      const state = store.get();
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
  }

  const fileImport = el("fileImport");
  if (fileImport){
    fileImport.addEventListener("change", async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const text = await file.text();
      const parsed = safeParse(text);
      if (!parsed) return;

      store.importState(parsed);
      ev.target.value = "";
    });
  }

  const btnReset = el("btnReset");
  if (btnReset){
    btnReset.addEventListener("click", () => {
      const ok = confirm("Reset everything stored in this browser for this page? This cannot be undone.");
      if (!ok) return;
      localStorage.removeItem("homebase_v1");
      location.reload();
    });
  }

  const btnPrint = el("btnPrint");
  if (btnPrint){
    btnPrint.addEventListener("click", () => window.print());
  }

  return () => {};
}
