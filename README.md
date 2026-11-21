# indukto.eu website

Source for [https://indukto.eu](https://indukto.eu): a plain-HTML static site for the ZoomBox Camera Android app, a photography archive, and a small public API. GitHub Pages serves the origin; a Cloudflare zone and worker sit in front of it.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page for ZoomBox Camera and open-source experiments |
| `photo.html` | Photo gallery, rendered from the `photos.js` manifest |
| `privacy.html` | Privacy policy in English, German, French, Spanish, Italian and Polish |
| `api.html` | Documentation for the gallery data API (`/photos.json`, `/status.json`, `/openapi.json`) |
| `404.html` | Custom not-found page (`noindex`), picked up automatically by GitHub Pages |

Each page has a Markdown twin (`index.md`, `photo.md`, `privacy.md`, `api.md`). Clients that send `Accept: text/markdown` receive the twin; the negotiation rules live in `worker/markdown-negotiation.js`.

## Building the gallery

After adding images to `photos/`, regenerate the manifest:

```sh
node build-gallery.mjs
```

## Deployment

- Site: pushing to `main` publishes through GitHub Pages; the `CNAME` file pins the custom domain.
- Worker: `npx wrangler deploy`. Routes, domain and token requirements are documented at the top of `wrangler.toml`. Besides Markdown negotiation, the worker redirects `http://` and `www.indukto.eu` requests to canonical `https://indukto.eu` URLs.
- Preview locally with any static file server, for example `npx serve`.

## Search and sharing metadata

- Sitemaps: `sitemap.xml` and `sitemap-index.xml`, both declared in `robots.txt`.
- Icons and social card: `favicon.svg`, `favicon.ico`, `og.png` (referenced by the Open Graph and Twitter tags on every page).
- Structured data: JSON-LD in `index.html` (`SoftwareApplication`), `photo.html` (`WebPage`) and `api.html` (`WebAPI`).
