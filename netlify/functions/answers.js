import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const KEY = 'user:default';

function checkPassphrase(req) {
  const expected = (process.env.APP_PASSPHRASE || '').trim();
  const debug = { expectedLen: expected.length, hasHeader: false };
  if (!expected) { console.log('AUTH', JSON.stringify(debug)); return false; }
  const header = req.headers.get('authorization') || '';
  debug.hasHeader = !!header;
  debug.headerLen = header.length;
  debug.headerPrefix = header.slice(0, 12);
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) { console.log('AUTH', JSON.stringify(debug)); return false; }
  const raw = m[1].trim();
  debug.rawLen = raw.length;
  let provided;
  try { provided = Buffer.from(raw, 'base64').toString('utf8'); }
  catch { provided = raw; }
  debug.decodedLen = provided.length;
  const candidates = [provided, raw];
  for (const cand of candidates) {
    const a = Buffer.from(cand);
    const b = Buffer.from(expected);
    if (a.length !== b.length) continue;
    try {
      if (timingSafeEqual(a, b)) {
        console.log('AUTH', JSON.stringify({ ...debug, matched: true }));
        return true;
      }
    } catch {}
  }
  console.log('AUTH', JSON.stringify({ ...debug, matched: false }));
  return false;
}

export default async (req) => {
  if (!checkPassphrase(req)) return new Response('Unauthorized', { status: 401 });

  const store = getStore({ name: 'answers', consistency: 'strong' });

  if (req.method === 'GET') {
    const data = (await store.get(KEY, { type: 'json' })) || {};
    return Response.json(data);
  }

  if (req.method === 'PUT') {
    let body;
    try { body = await req.json(); }
    catch { return new Response('Bad JSON', { status: 400 }); }
    if (body == null || typeof body !== 'object' || Array.isArray(body)) {
      return new Response('Body must be a JSON object', { status: 400 });
    }
    await store.setJSON(KEY, body);
    return new Response('OK');
  }

  return new Response('Method Not Allowed', { status: 405 });
};

export const config = { path: '/api/answers' };
