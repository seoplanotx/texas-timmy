// Social-crawler unfurl for challenge links. Bots get dynamic OG tags
// (middleware rewrites them here); a human who somehow lands here is
// bounced straight into the game with the original query string.
export const config = { runtime: 'edge' };

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default function handler(req) {
  const u = new URL(req.url);
  const by = (u.searchParams.get('by') || 'A RIVAL').slice(0, 12).toUpperCase();
  const t = parseInt(u.searchParams.get('t')) || 0;

  const qs = new URLSearchParams(u.searchParams);
  const playUrl = `${u.origin}/?${qs.toString()}`;
  const img = `${u.origin}/api/og?by=${encodeURIComponent(by)}&t=${t}`;
  const title = `BEAT ${by} — ${t.toLocaleString('en-US')} — TEXAS TIMMY`;
  const desc = 'A challenge has been issued, pardner. Same seed, same saucers — beat the score.';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(playUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${esc(playUrl)}">
</head><body><a href="${esc(playUrl)}">Accept the challenge →</a></body></html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
}
