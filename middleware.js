// Edge Middleware: social crawlers hitting a challenge link get rewritten to
// /api/unfurl (dynamic OG tags). Humans are untouched — the game stays a
// fully static, CDN-cached file.
import { rewrite, next } from '@vercel/edge';

export const config = { matcher: '/' };

const BOTS = /bot|crawler|spider|facebookexternalhit|twitterbot|slackbot|discordbot|whatsapp|telegram|linkedinbot|pinterest|embedly|redditbot|applebot|vkshare|quora/i;

export default function middleware(req) {
  const url = new URL(req.url);
  const isChallenge = url.searchParams.has('s') && url.searchParams.has('t');
  if (isChallenge && BOTS.test(req.headers.get('user-agent') || '')) {
    return rewrite(new URL('/api/unfurl' + url.search, url));
  }
  return next();
}
