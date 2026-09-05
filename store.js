import { getToken } from './auth.js';

let cache = {};
let saveTimer = null;
let inflight = null;
let queuedSave = false;
let statusListeners = [];

function notify(status) { for (const fn of statusListeners) fn(status); }
export function onStatus(fn) { statusListeners.push(fn); }

export let lastError = null;

export async function loadInitial() {
  notify('loading');
  lastError = null;
  const token = await getToken();
  let res;
  try {
    res = await fetch('/api/answers', {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (netErr) {
    lastError = `Network error: ${netErr.message}`;
    notify('error');
    throw netErr;
  }
  if (res.status === 401) {
    lastError = 'Unauthorized (401).';
    notify('unauth');
    throw new Error('unauth');
  }
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch {}
    lastError = `HTTP ${res.status}: ${body.slice(0, 300)}`;
    notify('error');
    throw new Error('load failed');
  }
  try { cache = await res.json(); }
  catch (parseErr) {
    lastError = `Bad JSON from server: ${parseErr.message}`;
    notify('error');
    throw parseErr;
  }
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
