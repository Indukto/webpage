# indukto — simple profile page

A lightweight, single-file profile page for GitHub Pages, linking to the Google Play
store and GitHub profile.

Two designs are included:

- `index.html` — retro pixel / ASCII / CRT style
- `material.html` — Material You 3 (Material Design 3) style

To use the Material version as your main page, rename `material.html` to `index.html`
(or keep both and link between them).

## Before you deploy — replace the placeholders

Open `index.html` and update these two links:

| Placeholder | Replace with |
|---|---|
| `https://play.google.com/store/apps/dev?id=YOUR_DEV_ID` | Your Google Play **developer page** URL (open the Play Store → your developer page → copy the URL), or a direct app link |
| `https://github.com/YOUR_USERNAME` | Your GitHub profile URL (currently set to `https://github.com/Indukto`) |

Also optional:

- The avatar letter/emoji and the `⚡` favicon in `<head>`
- The tagline text
- The custom domain in `CNAME` (currently `indukto.com`)

## Deploy to GitHub Pages

1. Create a repo on GitHub named **`<username>.github.io`** (e.g. `indukto.github.io`).
2. Push these files to the repo's default branch (usually `main`):
   ```bash
   git init
   git add .
   git commit -m "Initial profile page"
   git branch -M main
   git remote add origin https://github.com/<username>/<username>.github.io.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages** → under *Build and deployment* pick
   *Deploy from a branch*, choose `main` and `/ (root)`, then **Save**.
4. Your site is live at `https://<username>.github.io` within a minute or two.

## Custom domain (e.g. indukto.com)

1. Make sure the `CNAME` file in this repo contains your domain (`indukto.com`).
2. In your DNS provider's settings, add these records (replace the IPs/host with the
   current values from GitHub — see https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site):

   | Type | Name/Host | Value |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `<username>.github.io` |

3. In **Settings → Pages → Custom domain**, enter `indukto.com` and click **Save**.
   GitHub will verify the DNS and enable HTTPS automatically.
