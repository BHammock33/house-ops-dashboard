import { safeParse, deepMerge, ensureWeeklyKey, parseIngredients, cloneState } from "./util.js";

export function createStore({ storageKey, legacyStorageKeys = [], defaultState, api }){
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
    try { await api.save(state); } catch { /* server down, keep local */ }
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
    merged.golf = (merged.golf && typeof merged.golf === "object") ? merged.golf : { rounds: [] };
    merged.golf.rounds = Array.isArray(merged.golf.rounds) ? merged.golf.rounds : [];

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
    // Server is the source of truth for Railway + multi-device.
    let serverOk = false;
    let serverState = null;

    try {
      serverState = await api.get(); // {state: ...} on backend, api.js returns the state or null
      serverOk = true;
    } catch {
      serverOk = false;
      serverState = null;
    }

    // 1) If the server has state, use it and overwrite local cache.
    if (serverState && typeof serverState === "object") {
      let merged = deepMerge(defaultState, serverState);
      merged = migrate(merged);

      state = merged;
      persistLocal();
      notify();
      return state;
    }

    // 2) Otherwise fall back to local cache (new key first, then legacy keys).
    const keysToTry = [storageKey, ...legacyStorageKeys];
    let usedKey = null;
    let localState = null;

    for (const k of keysToTry) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = safeParse(raw);
      if (parsed && typeof parsed === "object") {
        localState = parsed;
        usedKey = k;
        break;
      }
    }

    let merged = deepMerge(defaultState, localState || {});
    merged = migrate(merged);

    state = merged;
    persistLocal();
    notify();

    // 3) If server is reachable but empty, push local up so it becomes cross-device.
    if (serverOk) {
      try { await api.save(state); } catch { /* ignore */ }
    }

    // 4) If we loaded from a legacy key, remove it to prevent cross-user bleed.
    if (usedKey && legacyStorageKeys.includes(usedKey)) {
      try { localStorage.removeItem(usedKey); } catch { /* ignore */ }
    }

    return state;
  }

  return { load, get, set, update, subscribe, importState };
}
