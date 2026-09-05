import { getStore } from '@netlify/blobs';

// TEMPORARY: passphrase gate disabled while we investigate why correct
// passphrases were rejected in production. See GitHub issue for details.
// Restore checkPassphrase from git history (commit e267cfd) once resolved.

const KEY = 'user:default';

export default async (req) => {
  try {
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
  } catch (err) {
    console.error('answers-fn error:', err);
    return Response.json({
      error: err?.message || String(err),
      name: err?.name,
    }, { status: 500 });
  }
};

export const config = { path: '/api/answers' };
