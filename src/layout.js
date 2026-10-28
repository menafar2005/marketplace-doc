// قالب HTML صفحه‌ها: ساختار و رفتار Claude Platform Docs (هدر با تب، سایدبار ثابت با جستجو، TOC سمت مقابل)
// با تم رنگی دیدار و جهت راست‌چین.
import { pages, meta } from "./generated/content.js";
import { codeTabs } from "./codeblock.js";

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const LOGO =
  '<svg width="28" height="28" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="24" fill="#13B39B"/><path d="M28 34 H58 A20 20 0 0 1 58 74 H28" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/><path d="M28 54 H54" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/></svg>';
export const FAVICON = LOGO.replace('width="28" height="28" ', 'xmlns="http://www.w3.org/2000/svg" ');

const svg = (inner, size = 16, sw = 1.8) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const I = {
  plug: svg('<path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7zM12 16v5"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  theme: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', 18),
  braces: svg('<path d="M8 4c-2 0-3 1-3 3v2c0 1.5-1 3-2 3 1 0 2 1.5 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.5 1 3 2 3-1 0-2 1.5-2 3v2c0 2-1 3-3 3"/>', 16),
  github: svg('<path d="M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.500 2.800 5.400 3.100 5.400 3.100a4.200 4.200 0 0 0-.1 3.200A4.600 4.600 0 0 0 4 9.500c0 4.600 2.700 5.700 5.500 6-.6.600-.6 1.200-.5 2V21"/>', 16),
  copy: svg('<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/>', 16),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>', 20),
  grid: svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', 20),
  layers: svg('<path d="M4 7l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4"/>', 20),
  doc: svg('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>', 20),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', 20),
  code: svg('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>', 20),
  window: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M14 9v11"/>', 20),
};

// ---- ناوبری: تب‌های بالا تعیین می‌کنند سایدبار چه گروه‌هایی نشان بدهد (مثل Claude Platform Docs) ----
const TABS = [
  { key: "guide", label: "راهنما", href: "/getting-started" },
  { key: "api", label: "مرجع API", href: "/api-concepts" },
];
const NAV = {
  guide: [
    { title: "شروع", items: ["getting-started", "creating-an-app", "test-environment", "build-with-mcp"] },
    { title: "مارکت‌پلیس", items: ["about-the-marketplace", "app-installation-flows", "developer-hub", "registering-an-app", "client-id-and-client-secret"] },
    { title: "اکستنشن‌ها", items: ["app-extensions", "link-actions", "json-modals", "json-panels", "custom-ui-extensions", "custom-modals", "custom-panels", "app-settings"] },
    { title: "احراز هویت", items: ["authentication", "installation-authorization", "runtime-token", "scopes", "state-parameter"] },
    { title: "آموزش‌ها و مقاله‌ها", items: ["tutorial-first-app", "security"] },
  ],
  api: [
    { title: "مفاهیم پایه", items: ["api-concepts", "api-requests", "api-responses", "errors"] },
    { title: "نصب و اجرا", items: ["api-auth", "api-app-endpoints"] },
    { title: "داده‌ی دیدار", items: ["api-basic", "api-deals", "api-cases", "api-contacts", "api-activities"] },
  ],
};
export const bySlug = new Map(pages.map((p) => [p.slug, p]));
export const tabOf = (slug) => (NAV.api.some((g) => g.items.includes(slug)) ? "api" : "guide");
const groupOf = (slug) => {
  for (const t of Object.keys(NAV)) for (const g of NAV[t]) if (g.items.includes(slug)) return g.title;
  return slug === "build-with-mcp" ? "MCP دیدار" : "داک";
};
export const mcpUrl = (origin) => `${origin}/mcp`;

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500;700&amp;display=swap" rel="stylesheet">';

function head({ title, description, origin, path }) {
  return (
    `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>${esc(title)}</title><meta name="description" content="${esc(description)}">` +
    `<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">` +
    `<meta property="og:type" content="website"><link rel="canonical" href="${origin}${path}">` +
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` +
    `<link rel="alternate" type="text/markdown" href="${path === "/" ? "/llms.txt" : path + ".md"}">` +
    `<script>(function(){var t="dark";try{t=localStorage.getItem("theme")||"dark"}catch(e){}document.documentElement.setAttribute("data-theme",t);document.documentElement.className+=" js"})()</script>` +
    FONTS +
    `<link rel="stylesheet" href="/assets/site.css?v=${meta.shortCommit}">`
  );
}

function header(activeTab) {
  const tabs = TABS.map((t) => `<a class="tab-link" href="${t.href}"${activeTab === t.key ? ' aria-current="page"' : ""}>${t.label}</a>`).join("");
  return (
    `<a class="skip" href="#main">رفتن به محتوا</a>` +
    `<header class="topbar"><div class="topbar-start"><a class="brand" href="/">${LOGO}<span class="wordmark">Didar Developers Docs</span></a></div>` +
    `<nav class="tabs-nav" aria-label="بخش‌های اصلی">${tabs}</nav>` +
    `<div class="topbar-end">` +
    `<button class="icon-btn" id="theme" type="button" aria-label="تغییر تم">${I.theme}</button>` +
    `<a class="solid-btn" href="/build-with-mcp">اتصال MCP</a>` +
    `</div></header>`
  );
}

function footer() {
  return (
    `<footer class="site-footer"><span>© دیدار · Didar Developers · مستندات توسعه‌دهنده</span>` +
    `<span>این صفحه را به ابزار AI بده: <a href="/llms.txt" dir="ltr">llms.txt</a> · <a href="/mcp" dir="ltr">MCP</a> · نسخه <code>${esc(meta.shortCommit)}</code></span></footer>`
  );
}

function sidebar(currentSlug, tab) {
  const groups = NAV[tab]
    .map(
      (g) =>
        `<p class="nav-group">${g.title}</p><ul class="nav-list">` +
        g.items
          .map((slug) => {
            const p = bySlug.get(slug);
            return p ? `<li><a href="/${slug}"${slug === currentSlug ? ' aria-current="page"' : ""}>${esc(p.title)}</a></li>` : "";
          })
          .join("") +
        `</ul>`
    )
    .join("");
  return (
    `<nav class="sidebar" aria-label="فهرست داک"><details open><summary>فهرست داک</summary>` +
    `<div class="search" role="search"><label>${I.search}<span class="sr">جستجو</span>` +
    `<input id="q" type="search" placeholder="جستجو" autocomplete="off" aria-controls="results"><kbd dir="ltr">Ctrl K</kbd></label>` +
    `<div id="results" class="search-results" hidden></div></div>` +
    `<a class="mcp-link" href="/build-with-mcp"${currentSlug === "build-with-mcp" ? ' aria-current="page"' : ""}>${I.plug}<span>اتصال به MCP دیدار</span></a>` +
    groups +
    `</details></nav>`
  );
}

const mcpItems = (origin) => {
  const url = mcpUrl(origin);
  return [
    { label: "Claude Code", lang: "bash", code: `claude mcp add --transport http didar ${url}`, hint: "در ترمینال پروژه‌ات اجرا کن:" },
    { label: "Claude", lang: "text", code: url, hint: "در Settings › Connectors یک connector سفارشی اضافه کن و این آدرس را بده:" },
    { label: "ChatGPT", lang: "text", code: url, hint: "در ChatGPT وارد Settings › Plugins شو، Developer mode را روشن کن و با دکمه‌ی + یک plugin سفارشی بساز: Connection را روی Server URL و Authentication را روی No Auth بگذار و این آدرس را بده:" },
    { label: "Codex", lang: "bash", code: `codex mcp add didar --url ${url}\ncodex mcp list`, hint: "در Codex CLI اجرا کن. در Codex Desktop یا IDE Extension هم از Settings › MCP servers › Add server با نوع Streamable HTTP و همین آدرس استفاده کن:" },
    { label: "Cursor", lang: "json", code: `{\n  "mcpServers": {\n    "didar": { "url": "${url}" }\n  }\n}`, hint: "این را در .cursor/mcp.json بگذار:" },
    { label: "VS Code", lang: "json", code: `{\n  "servers": {\n    "didar": { "type": "http", "url": "${url}" }\n  }\n}`, hint: "این را در .vscode/mcp.json بگذار:" },
  ];
};

function pager(slug) {
  const order = [...NAV.guide, ...NAV.api].flatMap((g) => g.items).filter((s, i, a) => a.indexOf(s) === i);
  const i = order.indexOf(slug);
  if (i < 0) return "";
  const prev = bySlug.get(order[i - 1]);
  const next = bySlug.get(order[i + 1]);
  if (!prev && !next) return "";
  return (
    `<nav class="pager" aria-label="صفحه قبل و بعد">` +
    (prev ? `<a href="/${prev.slug}"><small>قبلی</small><strong>${esc(prev.title)}</strong></a>` : "<span></span>") +
    (next ? `<a class="next" href="/${next.slug}"><small>بعدی</small><strong>${esc(next.title)}</strong></a>` : "<span></span>") +
    `</nav>`
  );
}

function tocHtml(page) {
  if (page.type === "api" || page.toc.length < 2) return `<aside class="toc" aria-hidden="true"></aside>`;
  return (
    `<aside class="toc" aria-label="در این صفحه"><ul>` +
    page.toc.map((t) => `<li class="l${t.level || 2}"><a href="#${t.id}">${esc(t.text)}</a></li>`).join("") +
    `</ul></aside>`
  );
}

function shell({ title, description, origin, path, tab, slug, main, wide, toc }) {
  return (
    `<!doctype html><html lang="fa" dir="rtl"><head>${head({ title, description, origin, path })}</head>` +
    `<body>${header(tab)}<div class="layout${wide ? " no-toc" : ""}">${sidebar(slug, tab)}` +
    `<main id="main" class="main"><div class="doc${wide ? " wide" : ""}">${main}</div>${footer()}</main>${wide ? "" : toc}</div>` +
    `<script src="/assets/site.js?v=${meta.shortCommit}" defer></script></body></html>`
  );
}

export function renderPage(page, origin) {
  const isApi = page.type === "api";
  const tab = page.slug === "build-with-mcp" ? "guide" : tabOf(page.slug);
  let body = page.html;
  if (page.slug === "build-with-mcp") {
    const items = mcpItems(origin);
    const hints = items.map((it) => `<p class="hint" data-for="${esc(it.label)}">${it.hint}</p>`).join("");
    body = body.replace("<!--MCP_TABS-->", `<div class="mcp-hints">${hints}</div>` + codeTabs(items.map(({ hint, ...r }) => r)));
  }
  const main =
    `<p class="crumb">${esc(groupOf(page.slug))}</p>` +
    `<div class="title-row"><h1>${esc(page.title)}</h1><button class="pill-btn" id="copy-md" type="button" data-src="/${page.slug}.md">${I.copy}<span>کپی صفحه</span></button></div>` +
    `<p class="lead">${esc(page.lead)}</p><div class="prose">${body}</div>${pager(page.slug)}`;
  return shell({
    title: `${page.title} — Didar Developers`, description: page.description, origin, path: "/" + page.slug,
    tab, slug: page.slug, main, wide: isApi, toc: tocHtml(page),
  });
}

const card = (href, icon, title, desc, featured) =>
  `<a class="card${featured ? " featured" : ""}" href="${href}">${I[icon]}<strong>${title}</strong><span>${desc}</span></a>`;

export function renderHome(origin) {
  const toc = [
    { id: "mcp", text: "MCP دیدار", level: 2 },
    { id: "steps", text: "از صفر شروع می‌کنی؟", level: 2 },
    { id: "all", text: "همه بخش‌ها", level: 2 },
  ];
  const main =
    `<p class="crumb">شروع</p><h1>برای دیدار پلاگین بساز، بدون اینکه از قبل چیزی بدانی</h1>` +
    `<p class="lead">این داک از صفر شروع می‌کند: دیدار چیست، یک پلاگین از چه بخش‌هایی ساخته می‌شود، و چطور اولین پلاگینت را بسازی و نصب کنی.</p>` +
    `<div class="prose"><h2 id="mcp">MCP دیدار را به ابزار AI خودت وصل کن</h2>` +
    `<div class="mcp-card"><span class="pill">مسیر پیش‌فرض</span><p><strong>هر سؤالی درباره مارکت‌پلیس داری از آن بپرس و پلاگینت را با آن بساز.</strong> MCP ساختار رسمی پلاگین دیدار، API و قواعد نصب را می‌شناسد، پس خروجی‌اش از اول درست است.</p>` +
    codeTabs(mcpItems(origin).map(({ hint, ...r }) => r)) +
    `<a class="solid-btn lg" href="/build-with-mcp">اتصال در ۵ دقیقه ←</a></div>` +
    `<h2 id="steps">از صفر شروع می‌کنی؟ این سه قدم</h2><p>به همین ترتیب جلو برو؛ هر قدم پیش‌نیاز قدم بعدی است.</p><ol class="steps">` +
    `<li class="step"><span class="n">۱</span><h3>بفهم</h3><p>مارکت‌پلیس چیست، اپ چطور با دیدار کار می‌کند و کجای دیدار دیده می‌شود.</p><a href="/about-the-marketplace">درباره‌ی مارکت‌پلیس ←</a></li>` +
    `<li class="step"><span class="n">۲</span><h3>نقشه را ببین</h3><p>پنج قدم از محیط تست تا Live کردن اپ و دادن لینک نصب.</p><a href="/creating-an-app">ساخت اپ ←</a></li>` +
    `<li class="step"><span class="n">۳</span><h3>بساز</h3><p>یک اپ کامل با کد، از ثبت در Developer Hub تا ثبت یادداشت روی معامله.</p><a href="/tutorial-first-app">آموزش ساخت اولین اپ ←</a></li></ol>` +
    `<h2 id="all">همه بخش‌ها</h2><div class="cards">` +
    card("/about-the-marketplace", "info", "درباره‌ی مارکت‌پلیس", "مارکت‌پلیس چیست و اپ چطور کار می‌کند") +
    card("/creating-an-app", "grid", "ساخت اپ", "نوع اپ و پنج قدم تا انتشار") +
    card("/build-with-mcp", "plug", "ساخت اپ با MCP دیدار", "مسیر پیش‌فرض ساخت", true) +
    card("/developer-hub", "doc", "Developer Hub", "ثبت، وضعیت‌ها، به‌روزرسانی و حذف اپ") +
    card("/app-extensions", "window", "اکستنشن‌ها", "Links، JSON و Custom UI") +
    card("/authentication", "lock", "احراز هویت", "نصب، Runtime Token و scopeها") +
    card("/tutorial-first-app", "layers", "آموزش ساخت اولین اپ", "یک اپ کامل با کد") +
    card("/api-concepts", "code", "مرجع API", "همه‌ی endpointها، درخواست و پاسخ") +
    `</div></div>`;
  return shell({
    title: "Didar Developers — مستندات توسعه‌دهنده مارکت‌پلیس دیدار",
    description: "مستندات فنی مارکت‌پلیس دیدار: ساخت، نصب و اجرای اپ Third-party، APIهای پروکسی و MCP دیدار.",
    origin, path: "/", tab: "guide", slug: "", main, wide: false,
    toc: tocHtml({ type: "guide", toc }),
  });
}

export function renderNotFound(origin) {
  const page = {
    slug: "404", type: "guide", title: "صفحه پیدا نشد", lead: "این آدرس در داک وجود ندارد.", description: "صفحه پیدا نشد", toc: [],
    html: `<p>از <a href="/">صفحه اصلی</a> یا فهرست سمت راست ادامه بده. اگر این لینک از داخل داک آمده، آن را در ریپوی <code>marketplace-doc</code> گزارش کن.</p>`,
  };
  return renderPage(page, origin).replace(/<link rel="alternate"[^>]*>/, "");
}
