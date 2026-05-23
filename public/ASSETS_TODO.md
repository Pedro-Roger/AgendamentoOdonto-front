# Static SEO assets TODO

Provide binary assets (sized PNG/ICO) before production deploy:

| File | Size | Purpose |
|---|---|---|
| `favicon.ico` | 32x32 (multi-res ok) | Tab icon |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `icon-192.png` | 192x192 | PWA / Android |
| `icon-512.png` | 512x512 | PWA splash |
| `og-image.png` | 1200x630 | Open Graph / Twitter card |

References in `app/layout.tsx` (`icons`, `openGraph.images`) and `public/manifest.webmanifest`.

Until provided, requests will 404 — non-blocking for SEO crawl but lowers Lighthouse PWA score.
