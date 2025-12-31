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

const root = document.documentElement;
const viewingUserId = root.dataset.userId || "guest";
const isAdmin = root.dataset.isAdmin === "1";

function initThemePicker() {
  const STORAGE_KEY = "houseOpsTheme";
  const select = document.getElementById("themeSelect");
  if (!select) return;

  const applyTheme = (theme) => {
    if (!theme || theme === "default") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem(STORAGE_KEY);
      select.value = "default";
      return;
    }
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    select.value = theme;
  };

  // Load saved theme on page load
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved || "default");

  // Persist on change
  select.addEventListener("change", (e) => {
    applyTheme(e.target.value);
  });
}

// Call this once when your page boots
initThemePicker();

// Per-user local cache key (prevents “User B sees User A’s localStorage”)
// Also lets us migrate the old global key one time.
const storageKey = `${STORAGE_KEY}:${viewingUserId}`;
const legacyStorageKeys = [STORAGE_KEY];

const apiUserId = isAdmin ? viewingUserId : null;

const store = createStore({
  storageKey,
  legacyStorageKeys,
  defaultState: DEFAULT_STATE,
  api: {
    get: () => apiGetState(apiUserId),
    save: (state) => apiSaveState(state, apiUserId),
  }
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
