export function safeParse(json){
  try { return JSON.parse(json); } catch { return null; }
}

export function deepMerge(base, incoming){
  if (incoming == null || typeof incoming !== "object") return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(incoming)){
    const v = incoming[k];
    if (Array.isArray(v)) out[k] = v;
    else if (v && typeof v === "object" && base && typeof base[k] === "object") out[k] = deepMerge(base[k], v);
    else out[k] = v;
  }
  return out;
}

export function formatDue(dueISO){
  if (!dueISO) return "";
  const d = new Date(dueISO + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function mondayKey(date = new Date()){
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0,10);
}

export function ensureWeeklyKey(state, fallbackItems){
  const key = mondayKey();
  const weekly = state.weekly || {};
  const items = (weekly.items && weekly.items.length) ? weekly.items : (fallbackItems || []);
  let checks = weekly.checks || {};

  // If the key changed, wipe checks.
  if (weekly.weekKey !== key){
    checks = {};
    for (const it of items){
      checks[it.id] = false;
    }
  } else {
    // Ensure every item has a check entry
    for (const it of items){
      if (typeof checks[it.id] !== "boolean") checks[it.id] = false;
    }
  }

  state.weekly = { ...weekly, weekKey: key, items, checks };
}

export function sanitizeUrl(url){
  const u = (url || "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (/^(mailto:|tel:)/i.test(u)) return u;
  return "https://" + u;
}

export function parseIngredients(str){
  return (str || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

export function ingredientsToString(ings){
  if (!ings) return "";
  if (Array.isArray(ings)) return ings.join(", ");
  return String(ings);
}

export function cloneState(obj){
  if (typeof structuredClone === "function") return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}
