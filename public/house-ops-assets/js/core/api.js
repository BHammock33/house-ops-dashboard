function csrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute("content") : "";
}

function buildStateUrl(targetUserId) {
  const url = new URL("/house-ops/state", window.location.origin);
  if (targetUserId) {
    url.searchParams.set("user_id", targetUserId);
  }
  return url.toString();
}

export async function apiGetState(targetUserId = null) {
  const res = await fetch(buildStateUrl(targetUserId), {
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

export async function apiSaveState(state, targetUserId = null) {
  const res = await fetch(buildStateUrl(targetUserId), {
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
