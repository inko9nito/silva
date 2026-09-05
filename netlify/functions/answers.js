import { OAuth2Client } from 'google-auth-library';
import { getStore } from '@netlify/blobs';

const oauth = new OAuth2Client();

async function verifiedEmail(req) {
  const header = req.headers.get('authorization') || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const audience = process.env.GOOGLE_CLIENT_ID;
  if (!audience) return null;
  try {
    const ticket = await oauth.verifyIdToken({ idToken: m[1], audience });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || payload.email_verified === false) return null;
    const allowed = (process.env.ALLOWED_EMAILS || '')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const email = payload.email.toLowerCase();
    if (allowed.length && !allowed.includes(email)) return null;
    return email;
  } catch {
    return null;
  }
}

export default async (req) => {
  const email = await verifiedEmail(req);
  if (!email) return new Response('Unauthorized', { status: 401 });

  const store = getStore({ name: 'answers', consistency: 'strong' });
  const key = `user:${email}`;

  if (req.method === 'GET') {
    const data = (await store.get(key, { type: 'json' })) || {};
    return Response.json(data);
  }

  if (req.method === 'PUT') {
    let body;
    try { body = await req.json(); }
    catch { return new Response('Bad JSON', { status: 400 }); }
    if (body == null || typeof body !== 'object' || Array.isArray(body)) {
      return new Response('Body must be a JSON object', { status: 400 });
    }
    await store.setJSON(key, body);
    return new Response('OK');
  }

  return new Response('Method Not Allowed', { status: 405 });
};

export const config = { path: '/api/answers' };
