export default async () => {
  return Response.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  }, {
    headers: { 'Cache-Control': 'private, max-age=300' },
  });
};

export const config = { path: '/api/config' };
