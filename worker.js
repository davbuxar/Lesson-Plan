// Cloudflare Worker: forwards requests to Gemini and adds the secret key on the server side.
// Set the secret named GEMINI_KEY in the Worker settings. Never write the key in this file.
const ALLOWED_ORIGIN = 'https://davbuxar.github.io';
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST' || request.headers.get('Origin') !== ALLOWED_ORIGIN) {
      return new Response('Not allowed', { status: 403, headers: cors });
    }
    const body = await request.text();
    if (body.length > 25 * 1024 * 1024) return new Response('Too large', { status: 413, headers: cors });
    const r = await fetch(GEMINI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
      body,
    });
    return new Response(await r.text(), {
      status: r.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
