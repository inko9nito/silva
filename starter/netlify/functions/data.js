/*
 * GET  /api/data — return the stored JSON blob (or {} when empty)
 * PUT  /api/data — replace the stored JSON blob (body must be an object)
 *
 * Notes worth keeping:
 * - Everything wraps in try/catch; on error, the message is returned as JSON.
 *   This lets the client surface the real reason ("Cannot find module foo")
 *   instead of a generic 500 page.
 * - The Authorization Bearer token is base64-decoded before comparison,
 *   because HTTP Bearer tokens can't safely contain spaces / punctuation.
 * - APP_PASSPHRASE is optional. If unset, the endpoint is open — fine for
 *   a personal app behind an obscure URL; add it before sharing.
 * - Netlify Blobs auto-configures from the function runtime — no siteID or
 *   token to plumb. If getStore throws about "missing environment", you're
 *   either running outside `netlify dev` or Blobs isn't enabled on the site.
 */

import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const KEY = 'user:default';

function decodeBearer(header) {
  const m = (header || '').match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const raw = m[1].trim();
  try { return Buffer.from(raw, 'base64').toString('utf8'); }
  catch { return raw; }
}

function authorized(req) {
  const expected = (process.env.APP_PASSPHRASE || '').trim();
  if (!expected) return true; // open access when no passphrase is set
  const provided = decodeBearer(req.headers.get('authorization'));
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try { return timingSafeEqual(a, b); } catch { return false; }
}

export default async (req) => {
  try {
    if (!authorized(req)) return new Response('Unauthorized', { status: 401 });

    const store = getStore({ name: 'data', consistency: 'strong' });

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
  } catch (err) {
    console.error('data-fn error:', err);
    return Response.json({
      error: err?.message || String(err),
      name: err?.name,
    }, { status: 500 });
  }
};

export const config = { path: '/api/data' };
