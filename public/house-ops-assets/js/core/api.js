function csrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute("content") : "";
}

export async function apiGetState() {
  const res = await fetch("/house-ops/state", {
    method: "GET",
    credentials: "same-origin",
    headers: {
      "Accept": "application/json",
    }
  });

  if (!res.ok) throw new Error(`Load failed: ${res.status}`);

  const data = await res.json();
  return data.state; // can be null
}

export async function apiSaveState(state) {
  const res = await fetch("/house-ops/state", {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken(),
    },
    body: JSON.stringify({ state }),
  });

  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return true;
}

