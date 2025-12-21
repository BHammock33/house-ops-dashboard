import { safeParse, deepMerge, ensureWeeklyKey, parseIngredients, cloneState } from "./util.js";

export function createStore({ storageKey, defaultState, api }){
  let state = cloneState(defaultState);
  let saveTimer = null;
  const subs = new Set();

  function notify(){
    for (const fn of subs) fn(state);
  }

  function get(){
    return state;
  }

  function persistLocal(){
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  async function persistServer(){
    try { await api.save(state); } catch { /* local-only fallback */ }
  }

  function save(){
    persistLocal();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistServer, 400);
  }

  function set(next){
    state = next;
    save();
    notify();
  }

  function update(fn){
    const draft = cloneState(state);
    const next = fn(draft) || draft;
    set(next);
  }

  function subscribe(fn){
    subs.add(fn);
    return () => subs.delete(fn);
  }

  function migrate(merged){
    // Ensure weekly structure and reset logic
    ensureWeeklyKey(merged, defaultState.weekly.items);

    // Meal migration: id + ingredients array
    merged.meals = (merged.meals || []).map((m) => {
      const id = m.id || crypto.randomUUID();
      const ingredients = Array.isArray(m.ingredients) ? m.ingredients : parseIngredients(m.ingredients);
      return { id, name: m.name || "Untitled meal", ingredients };
    });

    // Ensure arrays exist
    merged.projects = Array.isArray(merged.projects) ? merged.projects : [];
    merged.reading = Array.isArray(merged.reading) ? merged.reading : [];
    merged.links = Array.isArray(merged.links) ? merged.links : [];

    return merged;
  }

  function importState(data){
    let merged = deepMerge(defaultState, data || {});
    merged = migrate(merged);
    state = merged;
    save();
    notify();
  }

  async function load(){
    let serverState = null;
    try { serverState = await api.get(); } catch { serverState = null; }

    const raw = localStorage.getItem(storageKey);
    const localState = raw ? safeParse(raw) : null;

    let merged = deepMerge(defaultState, serverState || {});
    merged = deepMerge(merged, localState || {});
    merged = migrate(merged);

    state = merged;
    persistLocal();
    notify();
    return state;
  }

  return { load, get, set, update, subscribe, importState };
}
