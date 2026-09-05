/*
 * {{APP_NAME}} — router + iOS-style nav stack.
 *
 * The pattern:
 * - Hash-based routing (works from file:// and needs no server rewrites).
 * - Each route builds a full-height ".screen" DOM node.
 * - swapScreens() animates the transition based on route-depth change.
 * - Deeper route = forward push. Shallower = back pop. Same depth,
 *   different key = treated as forward (settings, sibling chapters, etc.).
 * - Each screen scrolls independently, so scroll position is preserved
 *   when the previous layer comes back.
 */

import * as store from './store.js';

/* ----- Router ----------------------------------------------------------- */

function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  if (!h) return { name: 'home' };
  const parts = h.split('/').filter(Boolean);
  // Extend this with your app's routes:
  if (parts[0] === 'settings') return { name: 'settings' };
  // if (parts[0] === 'item' && parts[1]) return { name: 'item', id: parts[1] };
  return { name: 'home' };
}

function routeKey(route) {
  if (route.name === 'home') return 'home';
  if (route.name === 'settings') return 'settings';
  // Extend with your routes; keys must be unique per screen.
  return route.name;
}

function routeDepth(route) {
  if (route.name === 'home') return 0;
  if (route.name === 'settings') return 1;
  // Extend: give each route a depth in its natural hierarchy.
  return 0;
}

function nav(path) { location.hash = path; }

/* ----- DOM helpers ------------------------------------------------------ */

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, '');
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    n.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
  }
  return n;
}

function topbar(title, backTo, rightSlot) {
  return el('div', { class: 'topbar' },
    backTo != null
      ? el('button', { class: 'back', onclick: () => nav(backTo) }, '‹ Back')
      : el('span', { class: 'spacer' }),
    el('h1', {}, title, el('span', { class: 'saved-tag' }, 'Saved')),
    rightSlot || el('span', { class: 'spacer' }),
  );
}

function newScreen() { return el('div', { class: 'screen' }); }

/* ----- Save-status indicator (hooks into store events) ------------------ */

let savedTimer = null;
store.onStatus((s) => {
  const tag = document.querySelector('.saved-tag');
  if (!tag) return;
  tag.classList.remove('on', 'saving', 'error');
  if (s === 'saving' || s === 'dirty') { tag.textContent = 'Saving…'; tag.classList.add('on', 'saving'); }
  else if (s === 'saved') { tag.textContent = 'Saved'; tag.classList.add('on'); clearTimeout(savedTimer); savedTimer = setTimeout(() => tag.classList.remove('on'), 900); }
  else if (s === 'error') { tag.textContent = 'Save error'; tag.classList.add('on', 'error'); }
});

/* ----- Transition engine ------------------------------------------------ */

let currentKey = null;
let currentDepth = -1;

function swapScreens(newScreen, direction) {
  const root = document.getElementById('app');
  const olds = Array.from(root.querySelectorAll('.screen'));

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (direction === 'none' || olds.length === 0 || reduce) {
    root.innerHTML = '';
    root.append(newScreen);
    return;
  }

  newScreen.setAttribute('data-slide', direction === 'forward' ? 'right' : 'left');
  root.append(newScreen);
  // eslint-disable-next-line no-unused-expressions
  newScreen.offsetHeight; // reflow so the initial transform is committed

  requestAnimationFrame(() => {
    newScreen.classList.add('animate');
    newScreen.setAttribute('data-slide', 'center');
    for (const old of olds) {
      old.classList.add('animate');
      old.setAttribute('data-slide', direction === 'forward' ? 'left' : 'right');
    }
  });

  let done = false;
  const cleanup = () => {
    if (done) return; done = true;
    for (const old of olds) old.remove();
    newScreen.classList.remove('animate');
    newScreen.removeAttribute('data-slide');
  };
  newScreen.addEventListener('transitionend', cleanup, { once: true });
  setTimeout(cleanup, 500);
}

/* ----- Render ----------------------------------------------------------- */

function render() {
  const route = parseRoute();
  const key = routeKey(route);
  const depth = routeDepth(route);

  let screen;
  if (route.name === 'home') screen = renderHome();
  else if (route.name === 'settings') screen = renderSettings();
  // Extend with your routes.

  if (!screen) return;

  let direction = 'none';
  if (currentKey !== null && key !== currentKey) {
    direction = depth < currentDepth ? 'back' : 'forward';
  }
  swapScreens(screen, direction);
  currentKey = key;
  currentDepth = depth;
}

/* ----- Screens (replace with your app's) -------------------------------- */

function renderHome() {
  const s = newScreen();
  s.append(
    topbar('{{APP_NAME}}', null,
      el('button', { class: 'back', onclick: () => nav('#/settings') }, '⚙︎'),
    ),
    el('div', { class: 'content' },
      el('h2', { style: 'font-size:26px;margin:16px 0 8px;letter-spacing:-0.02em;' }, 'Welcome'),
      el('p', { style: 'color:var(--ink-soft);' }, 'Replace this with your home screen.'),
    ),
  );
  return s;
}

function renderSettings() {
  const s = newScreen();
  s.append(
    topbar('Settings', '/'),
    el('div', { class: 'content' },
      el('button', {
        class: 'btn',
        onclick: async () => { await store.forceFlush(); },
      }, 'Sync now'),
    ),
  );
  return s;
}

/* ----- Boot ------------------------------------------------------------- */

function renderSplash(state, onRetry) {
  const root = document.getElementById('app');
  root.innerHTML = '';
  const inner = el('div', { style: 'text-align:center;max-width:320px;' });
  inner.append(
    el('h1', { style: 'font-size:22px;margin-bottom:8px;' }, '{{APP_NAME}}'),
    state === 'loading'
      ? el('p', { style: 'color:var(--ink-soft);' }, 'Loading…')
      : el('div', {},
          el('p', { style: 'color:var(--ink-soft);' }, 'Couldn\'t reach the server. Your saved answers are safe — just try again.'),
          store.lastError
            ? el('pre', { style: 'text-align:left;background:var(--surface-alt);padding:10px;border-radius:8px;font-size:12px;overflow:auto;margin-top:12px;' }, store.lastError)
            : null,
          el('button', { class: 'btn primary', style: 'margin-top:12px;', onclick: onRetry }, 'Retry'),
        ),
  );
  root.append(el('div', { class: 'screen', style: 'display:grid;place-items:center;padding:24px;' }, inner));
}

let hashBound = false;
async function boot() {
  renderSplash('loading');
  try { await store.loadInitial(); }
  catch { renderSplash('error', boot); return; }
  if (!hashBound) {
    window.addEventListener('hashchange', render);
    hashBound = true;
  }
  render();
}

boot();
