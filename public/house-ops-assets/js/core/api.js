function getCsrfToken(){
  const m = document.querySelector('meta[name="csrf-token"]');
  return m ? m.getAttribute('content') : '';
}

export async function apiGetState(){
  const res = await fetch('/api/house-ops/state', {
    credentials: 'same-origin',
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function apiSaveState(payload){
  const res = await fetch('/api/house-ops/state', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify(payload),
  });
  return res.ok;
}
