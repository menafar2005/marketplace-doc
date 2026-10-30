import { pages, meta } from "./generated/content.js";
import { renderPage, renderHome, renderNotFound, FAVICON, bySlug } from "./layout.js";
import { css } from "./styles.js";
import { clientJs } from "./client.js";
import { handleMcpRequest, llmsTxt, llmsFull } from "./mcp.js";
import { searchDocs } from "./search.js";

const HTML = "text/html; charset=utf-8";
const baseHeaders = (extra = {}) => ({
  "x-docs-version": meta.shortCommit,
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  ...extra,
});

// slugهای قدیمی ← صفحه‌ی جدید (لینک‌های بیرونی نشکنند)
const MOVED = {
  introduction: "getting-started", concepts: "about-the-marketplace", "how-it-works": "about-the-marketplace#how-it-works",
  anatomy: "plugin-anatomy", glossary: "about-the-marketplace#glossary",
  "create-app": "registering-an-app", "creating-an-app": "tutorial-first-app", authentication: "runtime-token", "app-installation-flows": "installation-authorization", "app-registration": "registering-an-app", "go-live": "publishing",
  installation: "installation-authorization", launch: "runtime-token", runtime: "runtime-token",
  "quick-start": "tutorial-first-app", "crm-data": "tutorial-first-app",
  extensions: "app-extensions", "settings-page": "app-settings", "manage-app": "developer-hub", "security-errors": "errors",
};

const page = (body, type, cache = "public, max-age=60, must-revalidate") =>
  new Response(body, { headers: baseHeaders({ "content-type": type, "cache-control": cache, etag: `"${meta.shortCommit}"` }) });

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = url.origin;
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/mcp") return handleMcpRequest(request, origin);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: baseHeaders({ allow: "GET, HEAD" }) });
    }

    if (path === "/") return page(renderHome(origin), HTML);
    if (path === "/assets/site.css") return page(css, "text/css; charset=utf-8", "public, max-age=31536000, immutable");
    if (path === "/assets/site.js") return page(clientJs, "text/javascript; charset=utf-8", "public, max-age=31536000, immutable");
    if (path === "/favicon.svg") return page(FAVICON, "image/svg+xml", "public, max-age=86400");
    if (path === "/robots.txt") return page(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, "text/plain; charset=utf-8");
    if (path === "/sitemap.xml") {
      const urls = ["/", ...pages.map((p) => "/" + p.slug)].map((p) => `<url><loc>${origin}${p}</loc></url>`).join("");
      return page(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, "application/xml; charset=utf-8");
    }
    if (path === "/llms.txt") return page(llmsTxt(origin), "text/plain; charset=utf-8");
    if (path === "/llms-full.txt") return page(llmsFull(origin), "text/plain; charset=utf-8");
    if (path === "/version" || path === "/healthz") {
      return page(JSON.stringify({ ok: true, ...meta }), "application/json; charset=utf-8", "no-store");
    }
    if (path === "/search") {
      const limit = Math.min(20, Number(url.searchParams.get("limit")) || 8);
      const results = searchDocs(url.searchParams.get("q") || "", { limit });
      return page(JSON.stringify({ results }), "application/json; charset=utf-8", "public, max-age=60");
    }

    const old = /^\/([\w-]+)(\.md)?$/.exec(path);
    if (old && MOVED[old[1]]) {
      const [slug, hash] = MOVED[old[1]].split("#");
      const to = old[2] ? `/${slug}.md` : `/${slug}${hash ? "#" + hash : ""}`;
      return new Response(null, { status: 301, headers: baseHeaders({ location: to }) });
    }

    const md = /^\/([\w-]+)\.md$/.exec(path);
    if (md && bySlug.has(md[1])) {
      const p = bySlug.get(md[1]);
      return page(`# ${p.title}\n\n${p.lead}\n\nمنبع: ${origin}/${p.slug}\n\n${p.md}`, "text/markdown; charset=utf-8");
    }

    const slug = path.slice(1);
    if (bySlug.has(slug)) return page(renderPage(bySlug.get(slug), origin), HTML);

    return new Response(renderNotFound(origin), { status: 404, headers: baseHeaders({ "content-type": HTML }) });
  },
};
