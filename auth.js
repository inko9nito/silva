const LS_KEY = 'silva:passphrase';

let cached = null;
let pending = [];

function readSaved() {
  try { return localStorage.getItem(LS_KEY) || null; }
  catch { return null; }
}

export async function initAuth() {
  cached = readSaved();
}

export function hasValidToken() {
  return !!(cached || readSaved());
}

export async function getToken() {
  cached = cached || readSaved();
  if (cached) return cached;
  return new Promise((resolve) => { pending.push(resolve); });
}

export function currentProfile() {
  return null;
}

export function signOut() {
  try { localStorage.removeItem(LS_KEY); } catch {}
  cached = null;
}

export function submitPassphrase(pw) {
  cached = pw;
  try { localStorage.setItem(LS_KEY, pw); } catch {}
  const waiters = pending; pending = [];
  for (const r of waiters) r(pw);
}

export async function verifyPassphrase(pw) {
  try {
    const res = await fetch('/api/answers', {
      method: 'GET',
      headers: { Authorization: `Bearer ${pw}` },
    });
    return res.ok;
  } catch { return false; }
}

export function markInvalid() {
  try { localStorage.removeItem(LS_KEY); } catch {}
  cached = null;
}
