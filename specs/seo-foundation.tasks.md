# SEO Foundation — Tasks

1. Delete `index.html` (Vite leftover).
2. TDD `app/robots.ts`.
3. TDD `app/sitemap.ts`.
4. TDD expand root `metadata` + `viewport` in `app/layout.tsx`.
5. TDD `JsonLd` component, mount in root layout.
6. TDD noindex `layout.tsx` for `dashboard`, `pacientes`, `prontuario`, `configuracoes`, `assinatura`, `sign`.
7. TDD `not-found.tsx` metadata.
8. TDD login server/client split (`page.tsx` server + `LoginForm.tsx` client).
9. TDD `app/page.tsx` → `permanentRedirect`.
10. Create `public/manifest.webmanifest` + asset placeholders.
11. Add `headers()` to `next.config.mjs` for `X-Robots-Tag`.
12. `npm test` + `npm run build` green.
