# TEXAS TIMMY in: THE RUSTLIN' 🤠

**A growth-engineering artifact that happens to be a very good NES game.**

UFOs are rustlin' the herd. You fly the family crop duster. Kill the saucer
mid-beam and the cow drops back safe — lose cows and your score multiplier
tanks. One hit, one life, one official run a day.

The game is a **single dependency-free `index.html`**: all sprites are in-code
pixel arrays, all audio is a synthesized 2A03-style chip (2 pulse + triangle +
noise), every canvas pixel comes from the NES 54-color palette, and the whole
sim runs a fixed 60Hz timestep with rendering decoupled.

## Why this exists

This project is designed around **three instrumented acquisition loops**, not
around the game. The game is the payload; the loops are the point.

### Loop 1 — Daily Run (retention + broadcast sharing)
- Seed = `fnv1a("YYYY-MM-DD")` (UTC) → `mulberry32` → an identical, fully
  deterministic spawn script for every player on Earth that day. Player input
  never touches the spawn stream.
- **One attempt per day** (consumed at run start). Scarcity makes the result
  worth posting.
- Death screen renders a 1200×630 share card (canvas → `navigator.share` with
  image on mobile; Wordle-style text block → clipboard on desktop):

  ```
  TEXAS TIMMY #142 🤠
  ⭐ 48,250
  🐄 12/15 herd saved
  🌊 Wave 9
  ```
- 7-day streak unlocks an exclusive livery (retention feeds the referral loop).

### Loop 2 — Challenge links (1:1 virality)
- Share URL carries full state: `?s=<seed>&t=<score>&g=<ghost>&by=<name>`.
- The **ghost** is the sender's effective score sampled every 2s, delta +
  zigzag-varint encoded, base64url — ~90 samples in ~120 URL characters.
- Recipient sees a "BEAT TUCKER — 48,250" banner and races a **live pace bar**
  against the ghost. Victory screen offers a one-tap re-challenge with the
  winner's ghost. The loop closes itself.
- Social crawlers hitting a challenge link are rewritten (edge middleware) to
  a dynamic OG card, so the unfurl says "BEAT TUCKER — 48,250" too.

### Loop 3 — Referral unlocks (incentivized invites)
- Every player gets a persistent 6-char code; every shared URL appends
  `?ref=CODE`.
- A referred visitor's **first completed run** POSTs `/api/ref` — credited
  once per client, no PII stored (IP-hash dedupe).
- Rewards are **cosmetic liveries only** (1 / 3 / 5 referrals), which keeps
  the Daily leaderboard credible.

## Instrumentation

Every loop surface fires through one wrapper — `window.ttTrack(event, props)`
(console in dev, Plausible in prod):

| Event | Fires when |
|---|---|
| `run_start` | any run begins (mode, seed) |
| `death` | run ends (score, wave, herd, saves, duration) |
| `share_click` | share surface tapped |
| `share_complete` | webshare/clipboard actually succeeded |
| `challenge_open` | a challenge link is opened |
| `challenge_win` | recipient beats the target (margin) |
| `ref_land` | visitor arrives with `?ref=` |
| `ref_convert` | referred visitor completes first run |

**K-factor = (shares / player) × (opens / share) × (conversion rate)** — every
term above is directly measurable, so the funnel's leakiest step is a query,
not a guess.

## Running it

It's one file. Open `index.html`, or serve it:

```sh
python3 -m http.server 8613
```

Dev/test affordances:
- `?debug=1` → `window.TTDebug` (spawn-hash determinism check, palette audit,
  god mode, wave skip, headless stepping)
- `?refs=N`, `?streak=N` → unlock overrides for livery testing

## Backend (optional, ~1 file per concern)

The game is fully playable static. The Vercel deploy adds:

- `api/ref.js` — referral credits (Upstash Redis REST; silent no-op without
  env vars). Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
- `api/og.jsx` — dynamic 1200×630 challenge OG card (`@vercel/og`).
- `api/unfurl.js` + `middleware.js` — bot-only rewrite so crawlers get
  per-challenge OG tags while humans get the static CDN-cached game.

## Controls

**Desktop:** WASD/arrows · autofire always on · Z/Space = YEEHAW bomb ·
M mute · C scanlines · P pause
**Mobile:** drag anywhere (plane rides above your finger) · second finger =
YEEHAW bomb
