import { createStore } from "./core/store.js";
import { STORAGE_KEY, DEFAULT_STATE } from "./core/defaultState.js";
import { apiGetState, apiSaveState } from "./core/api.js";

import { initLinks } from "./features/links.js";
import { initHouseNotes } from "./features/houseNotes.js";
import { initProjects } from "./features/projects.js";
import { initGolf } from "./features/golf.js";
import { initMeals } from "./features/meals.js";
import { initWeekly } from "./features/weekly.js";
import { initTools } from "./features/tools.js";

const userId = document.documentElement.dataset.userId || "guest";

// Per-user local cache key (prevents “User B sees User A’s localStorage”)
// Also lets us migrate the old global key one time.
const storageKey = `${STORAGE_KEY}:${userId}`;
const legacyStorageKeys = [STORAGE_KEY];

const store = createStore({
  storageKey,
  legacyStorageKeys,
  defaultState: DEFAULT_STATE,
  api: { get: apiGetState, save: apiSaveState }
});

const renders = [
  initLinks(store),
  initHouseNotes(store),
  initProjects(store),
  initGolf(store),
  initMeals(store),
  initWeekly(store),
  initTools(store),
];

function renderAll(){
  const state = store.get();
  for (const r of renders) r(state);
}

store.subscribe(renderAll);

await store.load();
renderAll();
