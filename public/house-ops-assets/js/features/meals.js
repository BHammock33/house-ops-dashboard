import { el } from "../core/dom.js";
import { parseIngredients, ingredientsToString } from "../core/util.js";

const openMeals = new Set();

const openEditors = new Set();

function setPickedMeal(meal){
  const titleEl = el("pickedMealTitle");
  const ingEl = el("pickedMealIngredients");
  const hintEl = el("mealHint");

  // If the markup isn't present (or page differs), don't crash render
  if (!titleEl || !ingEl ) return;

  if (!meal){
    titleEl.textContent = "No pick yet.";
    ingEl.textContent = "";
    if(hintEl) hintEl.textContent = "";
    return;
  }

  titleEl.textContent = meal.name ?? "Meal";
  ingEl.textContent = ingredientsToString(meal.ingredients || []);
}

export function initMeals(store){
  const mealNameInput = el("mealName");
  const mealIngredientsInput = el("mealIngredients");

 const btnAdd = el("btnAddMeal");
if (btnAdd){
  btnAdd.addEventListener("click", () => {
    const nameEl = el("mealName");
    const ingEl = el("mealIngredients");

    const name = (nameEl?.value ?? "").trim();
    const ingredients = parseIngredients(ingEl?.value ?? "");

    if (!name) return;

    store.update((s) => {
      s.meals = Array.isArray(s.meals) ? s.meals : [];
      s.meals.push({
        id: crypto.randomUUID(),
        name,
        ingredients,
      });
      return s;
    });

    // ✅ clear AFTER state update + any immediate render effects
    requestAnimationFrame(() => {
      const n = el("mealName");
      const i = el("mealIngredients");
      if (n) n.value = "";
      if (i) i.value = "";
      n?.focus?.();
    });
  });
}


  const btnPick = el("btnPickMeal");
  if (btnPick){
    btnPick.addEventListener("click", () => {
      const state = store.get();
      if (!state.meals.length) return;

      const recent = new Set((state.mealHistory || []).slice(-5));
      const candidates = state.meals.filter(m => !recent.has(m.name));
      const pool = candidates.length ? candidates : state.meals;

      const picked = pool[Math.floor(Math.random() * pool.length)];

      openMeals.clear();
      openMeals.add(picked.id);
      openEditors.clear();

      store.update((s) => {
        s.lastPickedMeal = picked;
        s.mealHistory = [...(s.mealHistory || []), picked.name];
        return s;
      });

      setPickedMeal(picked);

      requestAnimationFrame(() => {
      const ul = el("mealsList");
      const target = ul?.querySelector(`details.meal-details[data-meal-id="${picked.id}"]`);
      target?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    });
  }

  const btnCopy = el("btnCopyMeal");
  if (btnCopy){
    btnCopy.addEventListener("click", async () => {
      const picked = store.get().lastPickedMeal;
      if (!picked) return;

      const text = ingredientsToString(picked.ingredients).trim();
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        el("mealHint").textContent = "Ingredients copied.";
        setTimeout(() => { el("mealHint").textContent = ""; }, 1200);
      } catch {
        el("mealHint").textContent = "Could not copy automatically. Select and copy manually.";
        setTimeout(() => { el("mealHint").textContent = ""; }, 2200);
      }
    });
  }
function applyScrollCap(listEl, maxItems = 5){
  if (!listEl) return;

  const kids = Array.from(listEl.children);

  listEl.classList.remove("is-scroll");
  listEl.style.maxHeight = "";

  if (kids.length <= maxItems) return;

  const first = kids[0].getBoundingClientRect();
  const nth = kids[maxItems - 1].getBoundingClientRect();

  const height = Math.ceil((nth.bottom - first.top) + 2);

  listEl.style.maxHeight = `${height}px`;
  listEl.classList.add("is-scroll");
}


  return function renderMeals(state){
    const ul = el("mealsList");
    if (!ul) return;
    ul.innerHTML = "";

    state.meals.forEach((meal) => {
      const li = document.createElement("li");
      li.className = "meal-item";

      // Collapsible wrapper
      const details = document.createElement("details");
      details.className = "meal-details";
      details.dataset.mealId = meal.id;
      details.open = openMeals.has(meal.id);

      details.addEventListener("toggle", () => {
        if (details.open) openMeals.add(meal.id);
        else openMeals.delete(meal.id);
      });

      const summary = document.createElement("summary");
      summary.className = "meal-summary";

      const summaryHead = document.createElement("div");
      summaryHead.className = "meal-summary-head";

      const title = document.createElement("div");
      title.className = "title";
      title.textContent = meal.name || "Untitled meal";

      const chevron = document.createElement("span");
      chevron.className = "meal-chevron";
      chevron.textContent = "▾";
      chevron.setAttribute("aria-hidden", "true");

      summaryHead.appendChild(title);
      summaryHead.appendChild(chevron);
      summary.appendChild(summaryHead);

      const body = document.createElement("div");
      body.className = "meal-body";

      // Existing chips UI (unchanged behavior)
      const chips = document.createElement("div");
      chips.className = "meal-chips";

      (meal.ingredients || []).forEach((ing) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = ing;

        const x = document.createElement("button");
        x.type = "button";
        x.className = "chip-x";
        x.textContent = "×";
        x.title = "Remove ingredient";
        x.addEventListener("click", (e) => {
          // Prevent toggling the <details> when clicking the X
          e.preventDefault();
          e.stopPropagation();

          store.update((s) => {
            const m = s.meals.find(x => x.id === meal.id);
            if (!m) return s;
            m.ingredients = (m.ingredients || []).filter((v) => v !== ing);
            return s;
          });
        });

        chip.appendChild(x);
        chips.appendChild(chip);
      });

      body.appendChild(chips);

      // Actions row (same buttons, same behavior)
      const actions = document.createElement("div");
      actions.className = "meal-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "icon-btn icon-btn-sm";
      editBtn.textContent = openEditors.has(meal.id) ? "Done" : "Edit";
      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (openEditors.has(meal.id)) openEditors.delete(meal.id);
        else openEditors.add(meal.id);

        // Keep your existing pattern: rerender immediately
        renderMeals(store.get());
      });

      const del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn icon-btn-sm";
      del.textContent = "Delete";
      del.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        store.update((s) => {
          s.meals = s.meals.filter((m) => m.id !== meal.id);
          return s;
        });

        // Clean up UI-only state
        openMeals.delete(meal.id);
        openEditors.delete(meal.id);
      });

      actions.appendChild(editBtn);
      actions.appendChild(del);
      body.appendChild(actions);

      // Existing editor UI (unchanged behavior)
      if (openEditors.has(meal.id)){
        const editor = document.createElement("div");
        editor.className = "meal-editor";

        const ingInput = document.createElement("input");
        ingInput.type = "text";
        ingInput.placeholder = "Add ingredient (press Enter)";
        ingInput.className = "meal-editor-input";

        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "icon-btn icon-btn-sm";
        addBtn.textContent = "Add";

        const addIngredient = () => {
          const v = ingInput.value.trim();
          if (!v) return;
          store.update((s) => {
            const m = s.meals.find(x => x.id === meal.id);
            if (!m) return s;
            m.ingredients = Array.isArray(m.ingredients) ? m.ingredients : [];
            m.ingredients.push(v);
            return s;
          });
          ingInput.value = "";
        };

        addBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          addIngredient();
        });

        ingInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter"){
            e.preventDefault();
            e.stopPropagation();
            addIngredient();
          }
        });

        const csvBtn = document.createElement("button");
        csvBtn.type = "button";
        csvBtn.className = "icon-btn icon-btn-sm";
        csvBtn.textContent = "Edit CSV";
        csvBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const current = ingredientsToString(meal.ingredients);
          const next = prompt("Edit ingredients (comma-separated):", current);
          if (next === null) return;
          store.update((s) => {
            const m = s.meals.find(x => x.id === meal.id);
            if (!m) return s;
            m.ingredients = parseIngredients(next);
            return s;
          });
        });

        editor.appendChild(ingInput);
        editor.appendChild(addBtn);
        editor.appendChild(csvBtn);

        body.appendChild(editor);
      }

      details.appendChild(summary);
      details.appendChild(body);

      li.appendChild(details);
      ul.appendChild(li);
    });
    applyScrollCap(ul, 5);
    setPickedMeal(state.lastPickedMeal || null);
  };
}
