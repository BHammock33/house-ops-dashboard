import { el } from "../core/dom.js";

export function initHouseNotes(store){
  const notes = el("houseNotes");
  if (!notes) return () => {};

  let t = null;
  notes.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      store.update((s) => {
        s.houseNotes = notes.value;
        return s;
      });
    }, 250);
  });

  return function renderHouseNotes(state){
    notes.value = state.houseNotes || "";
  };
}
