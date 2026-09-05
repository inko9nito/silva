import { getToken } from './auth.js';

let cache = {};
let saveTimer = null;
let inflight = null;
let queuedSave = false;
let statusListeners = [];

function notify(status) { for (const fn of statusListeners) fn(status); }
export function onStatus(fn) { statusListeners.push(fn); }

export async function loadInitial() {
  notify('loading');
  const token = await getToken();
  const res = await fetch('/api/answers', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) { notify('unauth'); throw new Error('unauth'); }
  if (!res.ok) { notify('error'); throw new Error('load failed'); }
  cache = await res.json();
  notify('idle');
  return cache;
}

export function snapshot() { return cache; }
export function get(key) { return cache[key]; }
export function has(prefix) {
  for (const k of Object.keys(cache)) if (k.startsWith(prefix)) return true;
  return false;
}

export function set(key, value) {
  if (cache[key] === value) return;
  cache[key] = value;
  scheduleSave();
}

function scheduleSave() {
  notify('dirty');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 700);
}

async function flush() {
  if (inflight) { queuedSave = true; return; }
  notify('saving');
  const token = await getToken();
  const body = JSON.stringify(cache);
  inflight = fetch('/api/answers', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  })
    .then(res => {
      if (res.status === 401) notify('unauth');
      else if (!res.ok) notify('error');
      else notify('saved');
    })
    .catch(() => notify('error'))
    .finally(() => {
      inflight = null;
      if (queuedSave) { queuedSave = false; scheduleSave(); }
    });
  return inflight;
}

export async function forceFlush() {
  clearTimeout(saveTimer);
  return flush();
}
