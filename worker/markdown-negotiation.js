/**
 * Cloudflare Worker: Markdown for Agents (Accept: text/markdown content negotiation).
 *
 * Site origin is static GitHub Pages, which cannot vary responses by Accept
 * header. This Worker runs at the Cloudflare edge (route: indukto.eu/*) and:
 *
 * - If the request Accept header includes `text/markdown`, serves the
 *   pre-generated Markdown file for HTML pages with
 *   `Content-Type: text/markdown; charset=utf-8`.
 * - Otherwise passes through to origin (HTML remains default for browsers).
 *
 * Path mapping:
 *   /, /index, /index.html          -> /index.md
 *   /photo, /photo.html             -> /photo.md
 *   /api, /api.html                 -> /api.md
 *   /<name>, /<name>.html           -> /<name>.md (if it exists at origin)
 *
 * Response headers (per https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/):
 * - Content-Type: text/markdown; charset=utf-8
 * - Vary: Accept (merged with origin Vary)
 * - x-markdown-tokens: estimated token count (ceil(len/4))
 *
 * Preferred alternative (zero code, Cloudflare Pro+): enable
 * "Markdown for Agents" in Dashboard > AI Crawl Control, or via API:
 *   PATCH /client/v4/zones/{zone_id}/settings/content_converter {"value":"on"}
 * This Worker is the Free-plan fallback with identical request/response contract.
 *
 * Deploy: `npx wrangler deploy` (see wrangler.toml). Requires CF_API_TOKEN
 * with Workers + Zone Route edit permissions, or connect the repo in
 * Dashboard > Workers > Create > Import repository.
 */

const BYPASS_HEADER = "x-markdown-negotiation";
const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

function wantsMarkdown(request) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  // Avoid infinite loop when we fetch the .md file from origin ourselves.
  if (request.headers.get(BYPASS_HEADER) === "bypass") return false;
  const accept = request.headers.get("Accept") || "";
  if (!accept.includes("text/markdown")) return false;
  // Respect explicit q=0 refusal: text/markdown;q=0 or text/markdown; q=0
  const m = accept.match(/text\/markdown\s*;\s*q\s*=\s*([0-9.]+)/i);
  if (m && parseFloat(m[1]) === 0) return false;
  return true;
}

function markdownPathFor(url) {
  const path = url.pathname;
  if (path === "/" || path === "/index" || path === "/index.html") return "/index.md";
  if (path === "/photo" || path === "/photo.html") return "/photo.md";
  if (path === "/api" || path === "/api.html") return "/api.md";
  if (path.endsWith(".html")) return path.slice(0, -".html".length) + ".md";
  // Extensionless HTML pages (e.g. /photo) -> try /photo.md
  if (!path.split("/").pop().includes(".")) {
    if (path.endsWith("/")) return path + "index.md";
    return path + ".md";
  }
  return null; // assets (images, css, json, ...) are never negotiated
}

function mergeVary(originVary) {
  const parts = (originVary || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.some((p) => p.toLowerCase() === "accept")) parts.push("Accept");
  return parts.join(", ") || "Accept";
}

function tokenEstimate(text) {
  return String(Math.max(1, Math.ceil(text.length / 4)));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Pass through non-HTML / non-negotiated requests, but ensure Vary: Accept
    // on HTML responses so caches store separate variants.
    if (!wantsMarkdown(request)) {
      const originRes = await fetch(request);
      const ct = originRes.headers.get("Content-Type") || "";
      if (ct.includes("text/html")) {
        const headers = new Headers(originRes.headers);
        headers.set("Vary", mergeVary(headers.get("Vary")));
        return new Response(originRes.body, {
          status: originRes.status,
          statusText: originRes.statusText,
          headers,
        });
      }
      return originRes;
    }

    const mdPath = markdownPathFor(url);
    if (!mdPath) return fetch(request);

    const mdUrl = new URL(mdPath, url.origin);
    // Preserve query string? No — markdown is canonical, drop search.
    const mdReq = new Request(mdUrl.toString(), {
      method: "GET",
      headers: { [BYPASS_HEADER]: "bypass" },
    });
    const mdRes = await fetch(mdReq);
    if (!mdRes.ok) {
      // No markdown variant exists — fall back to origin HTML.
      return fetch(request);
    }
    const markdown = await mdRes.text();

    const headers = new Headers();
    headers.set("Content-Type", MARKDOWN_CONTENT_TYPE);
    // Preserve cache + CORS + security headers from origin HTML where sensible.
    const originRes = await fetch(request);
    for (const h of [
      "Cache-Control",
      "Expires",
      "Access-Control-Allow-Origin",
      "Content-Signal",
      "Strict-Transport-Security",
      "Content-Security-Policy",
      "X-Frame-Options",
    ]) {
      const v = originRes.headers.get(h);
      if (v) headers.set(h, v);
    }
    headers.set("Vary", mergeVary(originRes.headers.get("Vary")));
    headers.set("x-markdown-tokens", tokenEstimate(markdown));
    // Cancel origin body stream we only needed for headers.
    if (originRes.body) {
      try {
        await originRes.arrayBuffer();
      } catch {
        /* ignore */
      }
    }

    if (request.method === "HEAD") {
      return new Response(null, { status: 200, headers });
    }
    return new Response(markdown, { status: 200, headers });
  },
};
