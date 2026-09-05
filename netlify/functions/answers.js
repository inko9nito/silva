import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const KEY = 'user:default';

function checkPassphrase(req) {
  const expected = (process.env.APP_PASSPHRASE || '').trim();
  if (!expected) return false;
  const header = req.headers.get('authorization') || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  const raw = m[1].trim();
  // Client base64-encodes so passphrases with spaces / punctuation survive
  // the Authorization header. Fall back to raw for older clients.
  let provided;
  try { provided = Buffer.from(raw, 'base64').toString('utf8'); }
  catch { provided = raw; }
  // A non-base64 string won't decode to the intended value; also compare raw.
  const candidates = [provided, raw];
  for (const cand of candidates) {
    const a = Buffer.from(cand);
    const b = Buffer.from(expected);
    if (a.length !== b.length) continue;
    try { if (timingSafeEqual(a, b)) return true; } catch {}
  }
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
