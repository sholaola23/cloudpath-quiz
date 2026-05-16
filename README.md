# CloudPath Quiz

"Which Cloud Career Fits You?" — an 8-question quiz that maps people to one
of 6 cloud career paths, personalises the result with Claude, and subscribes
them to *Shola's Tech Notes*. Top-of-funnel lead magnet for the newsletter.

## Stack

- **Next.js 16** (App Router) — exported as a **static site** (`output: "export"`)
- **Cloudflare Pages** — hosting at `cloudpath.sholastechnotes.com`
- **Cloudflare Pages Functions** (`functions/api/*`) — the dynamic endpoints,
  because a static export cannot run Next.js API routes
- **Beehiiv** — newsletter subscribe + result-based tagging
- **Anthropic Claude** (`claude-haiku-4-5`) — personalised result paragraph
- **Cloudflare Web Analytics** + first-party funnel events (`/api/track`)

> ⚠️ The site is static. `app/api/*` routes are inert in production — the
> live endpoints are the Pages Functions in `functions/api/`. Keep the two
> in sync (or treat `functions/api/*` as the source of truth for prod).

## Local dev

```bash
bun install
bun run dev          # Next API routes work here (dev only)
```

## Build & deploy

```bash
bun run build                                   # produces ./out + static OG images
wrangler pages deploy out --project-name=cloudpath-quiz
```

Pages Functions in `./functions` are picked up automatically by `wrangler`.

## Environment variables

Set on the **Cloudflare Pages project** (Settings → Environment variables),
not just `.env.local`:

| Var | Used by | Required |
|-----|---------|----------|
| `ANTHROPIC_API_KEY` | `functions/api/generate-result` | yes |
| `BEEHIIV_API_KEY` | `functions/api/subscribe` | yes |
| `BEEHIIV_PUBLICATION_ID` | `functions/api/subscribe` | yes |
| `RESEND_API_KEY` | lead backup if Beehiiv fails | optional |
| `LEAD_BACKUP_EMAIL` | where lost-lead alerts go | optional |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics beacon | optional |

## Content

All quiz content is data-driven — edit JSON, no code changes:

- `data/questions.json` — questions + per-answer path scores
- `data/results.json` — the 6 result pages (copy, salary, certs, CTAs, OG)
- `data/prompts.json` — Claude system + user prompt templates

## Routes

- `/` — landing
- `/quiz` — quiz + email gate
- `/result/[path]` — per-path result (own OG image + metadata for sharing)
- `/result?path=XX` — legacy, client-redirects to `/result/XX`
