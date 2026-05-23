# SEO Foundation — Spec

## Goal
Make the Sorriso Odonto frontend correctly indexable on public surfaces (`/`, `/login`), block indexing on private/sensitive routes, and ship the metadata, schema, and crawler artifacts expected by Google.

## Scope
- Root metadata (Open Graph, Twitter, icons, robots, viewport)
- `app/robots.ts` + `app/sitemap.ts`
- Per-route `noindex` for: `/dashboard`, `/pacientes/**`, `/prontuario`, `/configuracoes/**`, `/assinatura`, `/sign/[token]`, `/api/**`, `/not-found`
- JSON-LD `Dentist` schema on public pages
- Login server/client split to allow `metadata` export
- HTTP-level `X-Robots-Tag` for private paths
- Static assets: `manifest.webmanifest`, icon stubs
- Remove legacy `index.html`

## Non-goals
i18n / hreflang, blog/content, AMP, advanced perf (LCP/CLS), backlinks, analytics integration.

## Acceptance criteria
1. `app/robots.ts` exports `MetadataRoute.Robots` allowing `/`, `/login` and disallowing every other path.
2. `app/sitemap.ts` exports only public routes.
3. Root `metadata` includes `metadataBase`, `title.template`, `description` ≥ 120 chars, `openGraph`, `twitter`, `icons`, `manifest`, default `robots`.
4. Root `viewport` export defines `themeColor` and `width=device-width`.
5. Every private route (or its layout) exports `metadata.robots = { index: false, follow: false }`.
6. `/sign/[token]` and `/not-found` export `metadata.robots = { index: false }`.
7. `<script type="application/ld+json">` with `@type: "Dentist"` rendered in root layout.
8. `app/login/page.tsx` is a server component; UI lives in `app/login/LoginForm.tsx` client component; metadata exported from `page.tsx`.
9. `app/page.tsx` uses `permanentRedirect("/login")` (308).
10. `next.config.mjs` `headers()` returns `X-Robots-Tag: noindex, nofollow` for private/sensitive paths.
11. `public/manifest.webmanifest` exists; placeholders for `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-image.png` documented.
12. Legacy `index.html` deleted.
13. `npm test` green; `npm run build` succeeds.

## Test strategy
- Vitest unit tests under `tests/seo-*.test.ts` importing each module and asserting shape.
- Manual: `curl /robots.txt`, `curl /sitemap.xml`, `curl -I /dashboard`, Rich Results Test, Lighthouse SEO ≥ 95.
