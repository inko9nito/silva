import { chapters } from './data/index.js';
import { initAuth, currentProfile, signOut, hasValidToken, submitPassphrase, verifyPassphrase, markInvalid } from './auth.js';
import * as store from './store.js';

/* ----- Save indicator ----- */
let saveTimer = null;
function updateSavedTag(status) {
  const tag = document.querySelector('.saved-tag');
  if (!tag) return;
  tag.classList.remove('on', 'saving', 'error');
  if (status === 'saving' || status === 'dirty') {
    tag.textContent = 'Saving…';
    tag.classList.add('on', 'saving');
  } else if (status === 'saved') {
    tag.textContent = 'Saved';
    tag.classList.add('on');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => tag.classList.remove('on'), 900);
  } else if (status === 'error') {
    tag.textContent = 'Save error';
    tag.classList.add('on', 'error');
  } else if (status === 'unauth') {
    tag.textContent = 'Sign in again';
    tag.classList.add('on', 'error');
  }
}
store.onStatus(updateSavedTag);

/* ----- Router ----- */
function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  if (!h) return { name: 'home' };
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'settings') return { name: 'settings' };
  if (parts[0] === 'ch' && parts[1]) {
    const chapter = chapters.find(c => c.id === parts[1]);
    if (!chapter) return { name: 'home' };
    if (parts[2] === 's' && parts[3]) {
      const section = chapter.sections.find(s => s.id === parts[3]);
      if (section) return { name: 'section', chapter, section };
    }
    return { name: 'chapter', chapter };
  }
  return { name: 'home' };
}
function nav(path) { location.hash = path; }

/* ----- DOM helpers ----- */
const app = document.getElementById('app');

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

/* ----- Sign-in screen ----- */
async function renderSignIn(errorMsg) {
  const root = document.getElementById('app') || app;
  root.innerHTML = '';
  const errBox = el('div', { class: 'signin-err' }, errorMsg || '');
  if (!errorMsg) errBox.style.visibility = 'hidden';
  const input = el('input', {
    type: 'password',
    inputmode: 'text',
    autocomplete: 'current-password',
    autocapitalize: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    placeholder: 'Passphrase',
    class: 'pw-input',
  });
  const submit = el('button', { class: 'pw-submit', type: 'submit' }, 'Unlock');
  const form = el('form', {
    class: 'pw-form',
    onsubmit: async (e) => {
      e.preventDefault();
      const pw = input.value.trim();
      if (!pw) return;
      submit.disabled = true;
      submit.textContent = 'Checking…';
      const ok = await verifyPassphrase(pw);
      if (ok) {
        submitPassphrase(pw);
      } else {
        submit.disabled = false;
        submit.textContent = 'Unlock';
        errBox.textContent = 'Incorrect passphrase.';
        errBox.style.visibility = 'visible';
        input.select();
      }
    },
  }, input, submit);
  root.append(
    el('div', { class: 'signin' },
      el('div', { class: 'signin-inner' },
        el('div', { class: 'signin-mark' }, '☯'),
        el('h1', {}, 'Silva Companion'),
        el('p', {}, 'Enter your passphrase.'),
        form,
        errBox,
      ),
    ),
  );
  setTimeout(() => input.focus(), 50);
}

/* ----- Render ----- */
function render() {
  const route = parseRoute();
  const root = document.getElementById('app');
  root.innerHTML = '';
  if (route.name === 'home') renderHome();
  else if (route.name === 'chapter') renderChapter(route.chapter);
  else if (route.name === 'section') renderSection(route.chapter, route.section);
  else if (route.name === 'settings') renderSettings();
  window.scrollTo(0, 0);
}

function renderHome() {
  const profile = currentProfile();
  const settings = el('button', {
    class: 'back settings-btn',
    onclick: () => nav('#/settings'),
  }, profile?.picture
    ? el('img', { class: 'avatar', src: profile.picture, alt: '' })
    : document.createTextNode('⚙︎'));
  const content = el('div', { class: 'content' });
  const main = chapters.filter(c => !c.reference);
  const refs = chapters.filter(c => c.reference);
  content.append(
    el('div', { class: 'hero' },
      el('h2', {}, 'Silva Life System'),
      el('p', {}, profile?.name ? `Welcome back, ${profile.name.split(' ')[0]}.` : 'A companion workbook for the course.')
    ),
    el('div', { class: 'section-label' }, 'Chapters'),
    el('div', { class: 'chapter-list' }, ...main.map(chapterCard)),
    refs.length ? el('div', { class: 'section-label' }, 'Reference') : null,
    refs.length ? el('div', { class: 'chapter-list' }, ...refs.map(chapterCard)) : null,
  );
  document.getElementById('app').append(topbar('Silva Companion', null, settings), content);
}

function chapterProgress(chapter) {
  const total = chapter.sections.length;
  const done = chapter.sections.filter(s => store.has(`${chapter.id}:${s.id}:`)).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

function chapterCard(chapter) {
  const p = chapterProgress(chapter);
  return el('a', { class: 'chapter-card', href: `#/ch/${chapter.id}` },
    el('div', { class: 'num' }, chapter.reference ? 'Reference' : `Chapter ${chapter.number}`),
    el('div', { class: 'title' }, chapter.title),
    el('div', { class: 'meta' },
      el('div', { class: 'progress' }, el('span', { style: `width:${p.pct}%` })),
      el('span', {}, `${p.done}/${p.total}`)
    )
  );
}

function renderChapter(chapter) {
  const content = el('div', { class: 'content' });
  content.append(
    el('div', { class: 'hero' },
      el('div', { class: 'section-label', style: 'margin: 0 0 4px' },
        chapter.reference ? 'Reference' : `Chapter ${chapter.number}`),
      el('h2', {}, chapter.title),
      chapter.subtitle ? el('p', {}, chapter.subtitle) : null,
    ),
    el('div', { class: 'section-label' }, 'Sections'),
    el('div', { class: 'section-list' }, ...chapter.sections.map((s, i) => sectionCard(chapter, s, i)))
  );
  document.getElementById('app').append(topbar(chapter.title, '/'), content);
}

function sectionCard(chapter, section, idx) {
  const done = store.has(`${chapter.id}:${section.id}:`);
  return el('a', {
    class: `section-card${done ? ' done' : ''}`,
    href: `#/ch/${chapter.id}/s/${section.id}`,
  },
    el('div', { class: 'idx' }, done ? '✓' : String(idx + 1)),
    el('div', { class: 'body' },
      section.kicker ? el('div', { class: 'kicker' }, section.kicker) : null,
      el('div', { class: 'name' }, section.title),
    ),
    el('div', { class: 'chev' }, '›'),
  );
}

function renderSection(chapter, section) {
  const content = el('div', { class: 'content' });
  for (const block of section.blocks) {
    content.append(renderBlock(chapter, section, block));
  }
  document.getElementById('app').append(
    topbar(section.title, `#/ch/${chapter.id}`),
    content,
    sectionNav(chapter, section),
  );
}

function sectionNav(chapter, section) {
  const idx = chapter.sections.findIndex(s => s.id === section.id);
  const prev = chapter.sections[idx - 1];
  const next = chapter.sections[idx + 1];
  return el('div', { class: 'nav-footer' },
    el('button', {
      onclick: () => nav(prev ? `#/ch/${chapter.id}/s/${prev.id}` : `#/ch/${chapter.id}`),
    }, prev ? '‹ Prev' : 'Chapter'),
    el('button', {
      class: 'primary',
      disabled: !next,
      onclick: () => next && nav(`#/ch/${chapter.id}/s/${next.id}`),
    }, next ? 'Next section ›' : 'End of chapter'),
  );
}

function renderSettings() {
  const profile = currentProfile();
  const content = el('div', { class: 'content' });
  content.append(
    el('div', { class: 'hero' }, el('h2', {}, 'Settings')),
    el('div', { class: 'section-label' }, 'Account'),
    el('div', { class: 'setting-card' },
      profile?.picture ? el('img', { class: 'avatar big', src: profile.picture, alt: '' }) : null,
      el('div', {},
        el('div', { class: 'name' }, profile?.name || 'Signed in'),
        el('div', { class: 'sub' }, profile?.email || ''),
      ),
    ),
    el('button', {
      class: 'danger-btn',
      onclick: async () => {
        signOut();
        location.hash = '#/';
        await renderSignIn();
      },
    }, 'Sign out'),
    el('div', { class: 'section-label' }, 'Sync'),
    el('div', { class: 'setting-card small' },
      el('div', {}, 'Your answers sync to Netlify Blobs, keyed to your Google email.'),
    ),
    el('button', {
      class: 'plain-btn',
      onclick: async () => {
        await store.forceFlush();
      },
    }, 'Sync now'),
    el('div', { class: 'section-label' }, 'Export'),
    el('button', {
      class: 'plain-btn',
      onclick: () => {
        const blob = new Blob([JSON.stringify(store.snapshot(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'silva-answers.json';
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
    }, 'Download JSON backup'),
  );
  document.getElementById('app').append(topbar('Settings', '/'), content);
}

/* ----- Blocks ----- */
function renderBlock(chapter, section, block) {
  switch (block.type) {
    case 'exercise-header': return el('div', { class: 'exercise-header' },
      el('div', { class: 'kicker' }, 'Exercise'),
      el('h2', {}, block.title),
    );
    case 'heading': return el('div', { class: 'block' }, el('h2', {}, block.text));
    case 'subheading': return el('div', { class: 'block' }, el('h3', {}, block.text));
    case 'prose': return el('div', { class: 'block' },
      ...(Array.isArray(block.text) ? block.text : [block.text]).map(p => el('p', {}, p))
    );
    case 'quote': return el('div', { class: 'block quote' },
      el('div', {}, `"${block.text}"`),
      block.author ? el('span', { class: 'author' }, `— ${block.author}`) : null,
    );
    case 'value': return el('div', { class: 'block value' },
      el('span', { class: 'num' }, `Value ${block.number}`),
      el('h3', {}, block.title),
      ...(Array.isArray(block.body) ? block.body : [block.body]).map(p => el('p', {}, p)),
    );
    case 'callout': return el('div', { class: 'block callout' },
      block.label ? el('span', { class: 'label' }, block.label) : null,
      document.createTextNode(block.text),
    );
    case 'steps': return el('div', { class: 'block steps' },
      el('ol', {},
        ...block.items.map(item =>
          el('li', {},
            typeof item === 'string' ? item : item.text,
            (item.note ? el('div', { class: 'step-note' }, item.note) : null),
          )
        )
      )
    );
    case 'phases': return el('div', { class: 'block phases' },
      ...block.items.map(p =>
        el('div', { class: 'phase' },
          el('div', { class: 'label' }, p.label),
          el('p', {}, p.text),
        )
      )
    );
    case 'glossary': return el('div', { class: 'block' },
      ...block.items.map(g =>
        el('div', { class: 'glossary-term' },
          el('div', { class: 'term' }, g.term),
          el('div', { class: 'def' }, g.def),
        )
      )
    );
    case 'audio-placeholder': return el('div', { class: 'block audio-placeholder' },
      el('div', { class: 'audio-icon' }, '♪'),
      el('div', { class: 'audio-body' },
        el('div', { class: 'audio-title' }, block.title || 'Audio track'),
        block.description ? el('div', { class: 'audio-desc' }, block.description) : null,
        el('div', { class: 'audio-hint' }, 'Audio not yet uploaded.'),
      ),
    );
    case 'reflection': return reflectionBlock(chapter, section, block);
    case 'journal': return journalBlock(chapter, section, block);
    case 'goal': return goalBlock(chapter, section, block);
    case 'scale': return scaleBlock(chapter, section, block);
    case 'evaluation': return evaluationBlock(chapter, section, block);
    default:
      return el('div', { class: 'block' }, el('p', {}, `[unknown block: ${block.type}]`));
  }
}

function keyFor(chapter, section, block, extra = '') {
  return `${chapter.id}:${section.id}:${block.id || block.type}${extra ? ':' + extra : ''}`;
}

function reflectionBlock(chapter, section, block) {
  const wrap = el('div', { class: 'block reflection' });
  if (block.title) wrap.append(el('h3', {}, block.title));
  if (block.intro) wrap.append(el('p', {}, block.intro));
  for (const p of block.prompts) {
    const key = keyFor(chapter, section, block, p.id);
    const ta = el('textarea', { placeholder: 'Write your answer…' });
    ta.value = store.get(key) || '';
    ta.addEventListener('input', () => store.set(key, ta.value));
    wrap.append(el('div', { class: 'prompt' }, p.text), ta);
  }
  return wrap;
}

function journalBlock(chapter, section, block) {
  const wrap = el('div', { class: 'block journal' });
  if (block.title) wrap.append(el('h3', {}, block.title));
  if (block.prompt) wrap.append(el('div', { class: 'prompt' }, block.prompt));
  const key = keyFor(chapter, section, block);
  const ta = el('textarea', { placeholder: block.placeholder || 'Notes…', style: 'min-height:140px' });
  ta.value = store.get(key) || '';
  ta.addEventListener('input', () => store.set(key, ta.value));
  wrap.append(ta);
  return wrap;
}

function goalBlock(chapter, section, block) {
  const wrap = el('div', { class: 'block goal' });
  if (block.label) wrap.append(el('h3', {}, block.label));
  if (block.prompt) wrap.append(el('div', { class: 'prompt' }, block.prompt));
  const key = keyFor(chapter, section, block);
  const ta = el('textarea', { placeholder: 'Write your goal statement…', style: 'min-height:100px' });
  ta.value = store.get(key) || '';
  ta.addEventListener('input', () => store.set(key, ta.value));
  wrap.append(ta);
  if (block.tail) wrap.append(el('div', { class: 'tail' }, block.tail));
  return wrap;
}

function scaleBlock(chapter, section, block) {
  const key = keyFor(chapter, section, block);
  const current = store.get(key);
  const min = block.min ?? 1;
  const max = block.max ?? 10;
  const buttons = [];
  const row = el('div', { class: 'scale-row' });
  for (let i = min; i <= max; i++) {
    const b = el('button', {
      'aria-pressed': String(current === i),
      onclick: () => {
        store.set(key, i);
        for (const btn of buttons) btn.setAttribute('aria-pressed', String(Number(btn.textContent) === i));
      },
    }, String(i));
    buttons.push(b);
    row.append(b);
  }
  return el('div', { class: 'block scale' },
    el('div', { class: 'q' }, block.question),
    row,
  );
}

function evaluationBlock(chapter, section, block) {
  const wrap = el('div', { class: 'block evaluation' });
  wrap.append(el('h3', {}, block.title));
  if (block.intro) wrap.append(el('p', {}, block.intro));
  const phases = block.phases || [{ id: 'default', label: 'Rating' }];
  let active = phases[0].id;
  const tabs = el('div', { class: 'eval-tabs' });
  const renderItems = () => {
    for (const child of Array.from(wrap.querySelectorAll('.eval-items'))) child.remove();
    const box = el('div', { class: 'eval-items' });
    for (const item of block.items) {
      const key = keyFor(chapter, section, block, `${active}:${item.id}`);
      const current = store.get(key);
      const row = el('div', { class: 'scale-row' });
      const buttons = [];
      for (let i = (item.min ?? 1); i <= (item.max ?? 10); i++) {
        const b = el('button', {
          'aria-pressed': String(current === i),
          onclick: () => {
            store.set(key, i);
            for (const btn of buttons) btn.setAttribute('aria-pressed', String(Number(btn.textContent) === i));
          },
        }, String(i));
        buttons.push(b);
        row.append(b);
      }
      box.append(el('div', { class: 'item' },
        el('div', { class: 'q' }, item.text),
        row,
      ));
    }
    wrap.append(box);
  };
  if (phases.length > 1) {
    for (const p of phases) {
      const btn = el('button', {
        'aria-selected': String(p.id === active),
        onclick: () => {
          active = p.id;
          for (const t of tabs.children) t.setAttribute('aria-selected', String(t.textContent === p.label));
          renderItems();
        },
      }, p.label);
      tabs.append(btn);
    }
    wrap.append(tabs);
  }
  renderItems();
  return wrap;
}

/* ----- Boot ----- */
async function boot() {
  await initAuth();
  if (!hasValidToken()) {
    await renderSignIn();
    waitForSignIn();
    return;
  }
  await afterSignIn();
}

function waitForSignIn() {
  const interval = setInterval(() => {
    if (hasValidToken()) {
      clearInterval(interval);
      afterSignIn();
    }
  }, 400);
}

async function afterSignIn() {
  try { await store.loadInitial(); }
  catch (e) {
    markInvalid();
    await renderSignIn('Could not unlock — check the passphrase.');
    waitForSignIn();
    return;
  }
  window.addEventListener('hashchange', render);
  render();
}

// (auth temporarily disabled — no re-prompt on 401.)

boot();
