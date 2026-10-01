# SEO, Redirect and Not Found Log

## What was added
| Feature | Where |
|---|---|
| SEO component (meta, focus keyword, canonical, OG, Twitter, JSON-LD, noIndex) | `src/components/shared/seo.json`, used by **Page** and **Case Study** |
| Page gets the `seo` field | `scripts/generate-page-schema.js` (it rewrites the Page schema on every `dev`/`build`, so edit it there, not in `schema.json`) |
| Admin "SEO Summary" panel (score, GOOD label, checks passed, focus keyword, failing checks) | `src/admin/seo/*`, registered in `src/admin/app.tsx` |
| Redirect: `source`, `destination`, `statusCode` (permanent = 301 / temporary = 302), `enabled`, `notes` | `src/api/redirect/*` |
| Not Found Log: `path`, `hitCount`, `referrer`, `userAgent`, `firstSeenAt`, `lastSeenAt`, `resolved` | `src/api/not-found-log/*` |
| SEO kept in the editor / public API | `src/middlewares/optimize-page-admin-list.ts`, `src/api/page/controllers/page.ts` |

## Public endpoints
- `GET  /api/redirects/lookup` returns `{ data: [{ source, destination, statusCode: 301|302 }] }` (enabled redirects only)
- `POST /api/not-found-logs/track` body `{ "path": "/missing", "referrer": "..." }`, rate limited to 30 requests/minute/IP (then `429`)

## Behaviour
- Redirect `source` is stored as a path (`Old-A/?x=1` becomes `/Old-A`); `destination` is a path or an absolute URL.
- Saving rejects: empty fields, duplicate sources, redirects to itself, and redirect loops (a -> b -> a).
- Creating a redirect marks matching Not Found Log rows as `resolved`.
- Tracking collapses `/Page`, `/page/`, `/page?x=1` and `https://site/page#top` into one lowercase row and counts hits. A resolved row is re-opened if it is hit again.
- SEO score = share of 13 checks passed (title 30-60 chars, description 70-160, focus keyword set / in title / in description, keywords, valid canonical URL, meta image, OG title / description / image, Twitter card, valid JSON-LD).

## Deploying
1. `npm run develop` once (regenerates `types/generated` and creates the new tables).
2. If your `redirects` table already has rows from the old `oldUrl` / `newUrl` / integer `statusCode` fields, move them over first; the new fields are `source` / `destination` / enum `statusCode`.
3. Labels like "Meta Title" are Content Manager view settings (stored in the database): use "Configure the view" on Page if you want them.
