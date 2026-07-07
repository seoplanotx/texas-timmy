// Referral credits — Vercel Edge Function backed by Upstash Redis (REST).
// Degrades gracefully: without UPSTASH_* env vars it accepts and discards,
// so the game keeps working on any static host or an unconfigured deploy.
//
//   POST /api/ref {code}     -> credit the referrer (deduped per client IP)
//   GET  /api/ref?code=XXXXXX -> {ok, code, refs} current credit count
export const config = { runtime: 'edge' };

const CODE_RE = /^[A-Z2-9]{6}$/;

async function redis(cmds) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(cmds),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const json = (o, s = 200) =>
  new Response(JSON.stringify(o), {
    status: s,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export default async function handler(req) {
  const u = new URL(req.url);

  if (req.method === 'GET') {
    const code = (u.searchParams.get('code') || '').toUpperCase();
    if (!CODE_RE.test(code)) return json({ ok: false, error: 'bad code' }, 400);
    const r = await redis([['GET', `ref:${code}`]]);
    return json({ ok: true, code, refs: r ? parseInt(r[0]?.result) || 0 : 0 });
  }

  if (req.method === 'POST') {
    let code = '';
    try { code = ((await req.json()).code || '').toUpperCase(); } catch {}
    if (!CODE_RE.test(code)) return json({ ok: false, error: 'bad code' }, 400);

    // one credit per (code, client) — hash the IP so we store no PII
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + '|' + code));
    const iph = [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');

    const r = await redis([['SADD', `refip:${code}`, iph]]);
    if (!r) return json({ ok: true, stored: false }); // KV not configured — accept silently
    const isNew = r[0]?.result === 1;
    const r2 = await redis([isNew ? ['INCR', `ref:${code}`] : ['GET', `ref:${code}`]]);
    return json({ ok: true, stored: isNew, refs: r2 ? parseInt(r2[0]?.result) || 0 : 0 });
  }

  return json({ ok: false, error: 'method' }, 405);
}
