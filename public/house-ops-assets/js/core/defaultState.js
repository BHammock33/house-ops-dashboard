export const STORAGE_KEY = "homebase_v1";

export const DEFAULT_STATE = {
  settings: {
    title: "Home Base",
    subtitle: "A tiny personal homepage. A place to put links, notes, and “future me will thank me” stuff."
  },
  links: [
    { label: "Calendar", url: "https://calendar.google.com/" },
    { label: "Drive", url: "https://drive.google.com/" },
    { label: "Docs", url: "https://docs.google.com/" },
    { label: "Password manager", url: "https://bitwarden.com/" }
  ],
  houseNotes: "",
  projects: [],
  golf: {
    rounds: []
  },
  meals: [
    { id: crypto.randomUUID(), name: "Salmon bowls", ingredients: ["salmon", "rice", "cucumber", "avocado", "soy sauce"] },
    { id: crypto.randomUUID(), name: "Chicken stir-fry", ingredients: ["chicken", "frozen stir-fry veggies", "rice", "sauce"] },
    { id: crypto.randomUUID(), name: "Taco night", ingredients: ["tortillas", "protein", "salsa", "cheese", "lettuce"] }
  ],
  mealHistory: [],
  lastPickedMeal: null,
  weekly: {
    weekKey: "",
    items: [
      { id: "calendar", label: "Check the calendar" },
      { id: "money", label: "Money check-in" },
      { id: "food", label: "Food plan" },
      { id: "house", label: "House thing" },
      { id: "people", label: "Text someone back" }
    ],
    checks: {}
  }
};
