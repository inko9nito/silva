import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const KEY = 'user:default';

function checkPassphrase(req) {
  const expected = process.env.APP_PASSPHRASE;
  if (!expected) return false;
  const header = req.headers.get('authorization') || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  const provided = m[1];
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try { return timingSafeEqual(a, b); } catch { return false; }
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
