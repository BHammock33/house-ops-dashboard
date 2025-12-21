import { el } from "../core/dom.js";
import { parseIngredients, ingredientsToString } from "../core/util.js";

const openEditors = new Set();

function setPickedMeal(meal){
  if (!meal){
    el("pickedMealTitle").textContent = "No pick yet.";
    el("pickedMealIngredients").textContent = "";
    el("mealHint").textContent = "";
    return;
  }
  el("pickedMealTitle").textContent = meal.name;
  el("pickedMealIngredients").textContent = ingredientsToString(meal.ingredients);
  el("mealHint").textContent = "Picked just now.";
}

export function initMeals(store){
  const btnAdd = el("btnAddMeal");
  if (btnAdd){
    btnAdd.addEventListener("click", () => {
      const name = (el("mealName")?.value || "").trim();
      const ingredientsRaw = (el("mealIngredients")?.value || "").trim();
      if (!name) return;

      store.update((s) => {
        s.meals.unshift({
          id: crypto.randomUUID(),
          name,
          ingredients: parseIngredients(ingredientsRaw),
        });
        return s;
      });

      el("mealName").value = "";
      el("mealIngredients").value = "";
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

      store.update((s) => {
        s.lastPickedMeal = picked;
        s.mealHistory = [...(s.mealHistory || []), picked.name];
        return s;
      });

      setPickedMeal(picked);
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

  return function renderMeals(state){
    const ul = el("mealsList");
    if (!ul) return;
    ul.innerHTML = "";

    state.meals.forEach((meal) => {
      const li = document.createElement("li");
      li.className = "item";

      const left = document.createElement("div");
      left.className = "item-left";

      const textWrap = document.createElement("div");
      textWrap.className = "item-text";

      const title = document.createElement("div");
      title.className = "title";
      title.textContent = meal.name || "Untitled meal";

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
        x.addEventListener("click", () => {
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

      textWrap.appendChild(title);
      textWrap.appendChild(chips);

      left.appendChild(textWrap);

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.gap = "8px";
      right.style.alignItems = "center";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "icon-btn icon-btn-sm";
      editBtn.textContent = openEditors.has(meal.id) ? "Done" : "Edit";
      editBtn.addEventListener("click", () => {
        if (openEditors.has(meal.id)) openEditors.delete(meal.id);
        else openEditors.add(meal.id);
        renderMeals(store.get());
      });

      const del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn icon-btn-sm";
      del.textContent = "Delete";
      del.addEventListener("click", () => {
        store.update((s) => {
          s.meals = s.meals.filter((m) => m.id !== meal.id);
          return s;
        });
      });

      right.appendChild(editBtn);
      right.appendChild(del);

      li.appendChild(left);
      li.appendChild(right);

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

        addBtn.addEventListener("click", addIngredient);
        ingInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter"){
            e.preventDefault();
            addIngredient();
          }
        });

        const csvBtn = document.createElement("button");
        csvBtn.type = "button";
        csvBtn.className = "icon-btn icon-btn-sm";
        csvBtn.textContent = "Edit CSV";
        csvBtn.addEventListener("click", () => {
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

        li.appendChild(editor);
      }

      ul.appendChild(li);
    });

    setPickedMeal(state.lastPickedMeal || null);
  };
}
