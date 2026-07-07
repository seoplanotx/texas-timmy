// Dynamic Open Graph card (1200x630) for challenge-link unfurls.
//   /api/og                    -> generic card
//   /api/og?by=TUCKER&t=48250  -> "BEAT TUCKER" challenge card
// Colors are from the NES palette used by the game.
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const u = new URL(req.url);
  const by = (u.searchParams.get('by') || '').slice(0, 12).toUpperCase();
  const t = parseInt(u.searchParams.get('t')) || 0;
  const challenge = by && t > 0;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
        <div style={{ flex: 5, backgroundColor: '#3CBCFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, color: '#F83800', textShadow: '6px 6px 0 #000000' }}>TEXAS TIMMY</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#881400', marginTop: 8 }}>in: THE RUSTLIN&apos;</div>
        </div>
        <div style={{ flex: 3, backgroundColor: '#A4E4FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', fontSize: challenge ? 56 : 44, fontWeight: 700, color: '#000000', backgroundColor: '#F8B800', padding: '16px 40px', border: '6px solid #000000' }}>
            {challenge ? `BEAT ${by} — ${t.toLocaleString('en-US')}` : '\u{1F404} SAVE THE HERD — ONE RUN A DAY'}
          </div>
        </div>
        <div style={{ flex: 2, backgroundColor: '#AC7C00', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '10px solid #881400' }}>
          <div style={{ display: 'flex', fontSize: 30, color: '#FCFCFC' }}>NES-style shmup · UFOs are rustlin&apos; the cattle · autofire on</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
