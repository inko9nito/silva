export default async () => {
  return Response.json({
    ok: !!process.env.APP_PASSPHRASE,
  }, {
    headers: { 'Cache-Control': 'private, max-age=60' },
  });
};

export const config = { path: '/api/config' };
