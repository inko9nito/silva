const GIS_SRC = 'https://accounts.google.com/gsi/client';

let clientId = null;
let idToken = null;
let expiresAt = 0;
let pending = [];
let profile = null;

async function loadConfig() {
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to load config');
  const cfg = await res.json();
  clientId = cfg.googleClientId;
  if (!clientId) throw new Error('Server is missing GOOGLE_CLIENT_ID');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

function parseJwt(jwt) {
  try {
    const [, b64] = jwt.split('.');
    const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch { return null; }
}

function handleCredential(credential) {
  idToken = credential;
  const payload = parseJwt(credential) || {};
  expiresAt = payload.exp ? (payload.exp * 1000) - 60_000 : Date.now() + 55 * 60_000;
  profile = {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
  const waiters = pending; pending = [];
  for (const w of waiters) w(credential);
}

let inited = false;
export async function initAuth() {
  if (inited) return;
  await loadConfig();
  await loadScript(GIS_SRC);
  google.accounts.id.initialize({
    client_id: clientId,
    auto_select: true,
    itp_support: true,
    use_fedcm_for_prompt: true,
    callback: (resp) => handleCredential(resp.credential),
  });
  inited = true;
}

export function renderSignInButton(container) {
  google.accounts.id.renderButton(container, {
    theme: 'filled_blue',
    size: 'large',
    text: 'signin_with',
    shape: 'pill',
    logo_alignment: 'center',
    width: Math.min(340, Math.floor(window.innerWidth - 80)),
  });
}

export function promptOneTap() {
  try { google.accounts.id.prompt(); } catch {}
}

export function currentProfile() { return profile; }

export function hasValidToken() {
  return !!idToken && Date.now() < expiresAt;
}

export async function getToken() {
  if (hasValidToken()) return idToken;
  return new Promise((resolve) => {
    pending.push(resolve);
    promptOneTap();
  });
}

export function signOut() {
  try { google.accounts.id.disableAutoSelect(); } catch {}
  idToken = null;
  expiresAt = 0;
  profile = null;
}
