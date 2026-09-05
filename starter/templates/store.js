/*
 * Sync store: in-memory cache mirrored to /api/data on the server.
 * Debounced writes, status events, and lastError capture for surfacing.
 *
 * If you're not using auth, just remove the Authorization header.
 * If you're using a shared passphrase, uncomment the base64 token setup.
 */

let cache = {};
let saveTimer = null;
let inflight = null;
let queuedSave = false;
let statusListeners = [];

export let lastError = null;

function notify(status) { for (const fn of statusListeners) fn(status); }
export function onStatus(fn) { statusListeners.push(fn); }

// Base64-encode the token so passphrases with spaces / punctuation survive
// the Authorization header (RFC 6750 Bearer doesn't allow spaces).
function tokenHeader() {
  const raw = localStorage.getItem('app:token');
  if (!raw) return null;
  const encoded = btoa(unescape(encodeURIComponent(raw)));
  return `Bearer ${encoded}`;
}
function withAuth(headers = {}) {
  const t = tokenHeader();
  return t ? { ...headers, Authorization: t } : headers;
}

export async function loadInitial() {
  notify('loading');
  lastError = null;
  let res;
  try { res = await fetch('/api/data', { headers: withAuth() }); }
  catch (err) {
    lastError = `Network error: ${err.message}`;
    notify('error');
    throw err;
  }
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch {}
    lastError = `HTTP ${res.status}: ${body.slice(0, 300)}`;
    notify('error');
    throw new Error('load failed');
  }
  try { cache = await res.json(); }
  catch (err) {
    lastError = `Bad JSON from server: ${err.message}`;
    notify('error');
    throw err;
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
  const body = JSON.stringify(cache);
  inflight = fetch('/api/data', {
    method: 'PUT',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body,
  })
    .then(res => {
      if (!res.ok) { notify('error'); lastError = `HTTP ${res.status} on save`; }
      else notify('saved');
    })
    .catch((err) => { lastError = `Network error: ${err.message}`; notify('error'); })
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
