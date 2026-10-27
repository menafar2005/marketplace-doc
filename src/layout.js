// قالب HTML صفحه‌ها (سه ستون راست‌چین مطابق دیزاین سیستم Didar Developers)
import { pages, meta } from "./generated/content.js";

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const LOGO =
  '<svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="24" fill="#13B39B"/><path d="M28 34 H58 A20 20 0 0 1 58 74 H28" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/><path d="M28 54 H54" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/></svg>';
export const FAVICON = LOGO.replace('width="32" height="32" ', 'xmlns="http://www.w3.org/2000/svg" ');

const PLUG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7zM12 16v5"/></svg>';
const SEARCH =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
const MOON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

const SECTION_LABEL = { start: "شروع", reference: "مرجع" };

export const bySlug = new Map(pages.map((p) => [p.slug, p]));
export const mcpUrl = (origin) => `${origin}/mcp`;

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&amp;family=JetBrains+Mono:wght@400;500;700&amp;display=swap" rel="stylesheet">';

function head({ title, description, origin, path }) {
  return (
    `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>${esc(title)}</title><meta name="description" content="${esc(description)}">` +
    `<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">` +
    `<meta property="og:type" content="website"><link rel="canonical" href="${origin}${path}">` +
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` +
    `<link rel="alternate" type="text/markdown" href="${path === "/" ? "/llms.txt" : path + ".md"}">` +
    `<script>(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}document.documentElement.className+=" js"})()</script>` +
    FONTS +
    `<link rel="stylesheet" href="/assets/site.css?v=${meta.shortCommit}">`
  );
}

function header(active) {
  const link = (href, label, key) =>
    `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return (
    `<a class="skip" href="#main">رفتن به محتوا</a>` +
    `<header class="site-header"><div class="site-header-in">` +
    `<a class="logo" href="/">${LOGO}<b>دیدار</b><small>Developers</small></a>` +
    `<nav class="top-nav" aria-label="بخش‌های اصلی">` +
    link("/introduction", "راهنما", "guide") +
    link("/build-with-mcp", "MCP دیدار", "mcp") +
    link("/api-concepts", "مرجع API", "api") +
    `</nav><div class="grow"></div>` +
    `<div class="search" role="search"><label>${SEARCH}<span class="sr">جستجو</span>` +
    `<input id="q" type="search" placeholder="جستجو در داک…" autocomplete="off" aria-controls="results"><kbd>⌘K</kbd></label>` +
    `<div id="results" class="search-results" hidden></div></div>` +
    `<button class="btn btn-ghost icon-btn" id="theme" type="button" aria-label="تغییر تم">${MOON}</button>` +
    `<a class="btn" href="/build-with-mcp">اتصال MCP</a>` +
    `</div></header>`
  );
}

function footer() {
  return (
    `<footer class="site-footer"><div class="site-footer-in">` +
    `<span>© دیدار · Didar Developers</span>` +
    `<span>این صفحه را به ابزار AI بده: <a href="/llms.txt" dir="ltr">llms.txt</a> · <a href="/mcp" dir="ltr">MCP</a> · نسخه <code>${esc(meta.shortCommit)}</code></span>` +
    `</div></footer>`
  );
}

function sidebar(currentSlug) {
  const groupHtml = (section) =>
    `<p class="nav-group">${SECTION_LABEL[section]}</p><ul class="nav-list">` +
    pages
      .filter((p) => p.section === section && p.slug !== "build-with-mcp")
      .map(
        (p) =>
          `<li><a href="/${p.slug}"${p.slug === currentSlug ? ' aria-current="page"' : ""}>${esc(p.title)}</a></li>`
      )
      .join("") +
    `</ul>`;
  return (
    `<nav class="sidebar" aria-label="فهرست داک"><details open><summary>فهرست داک</summary>` +
    `<a class="mcp-link" href="/build-with-mcp"${currentSlug === "build-with-mcp" ? ' aria-current="page"' : ""}>${PLUG}اتصال به MCP دیدار</a>` +
    groupHtml("start") +
    groupHtml("reference") +
    `</details></nav>`
  );
}

function mcpTabs(origin) {
  const url = mcpUrl(origin);
  const defs = [
    { id: "code", label: "Claude Code", file: "Terminal", hint: "در ترمینال پروژه‌ات اجرا کن:", code: `claude mcp add --transport http didar ${url}` },
    { id: "app", label: "Claude (اپ)", file: "Settings › Connectors", hint: "در تنظیمات Claude یک connector سفارشی اضافه کن و این آدرس را بده:", code: url },
    { id: "cursor", label: "Cursor", file: ".cursor/mcp.json", hint: "این فایل را در ریشه پروژه بساز:", code: `{\n  "mcpServers": {\n    "didar": { "url": "${url}" }\n  }\n}` },
    { id: "vscode", label: "VS Code", file: ".vscode/mcp.json", hint: "این فایل را در ریشه پروژه بساز:", code: `{\n  "servers": {\n    "didar": { "type": "http", "url": "${url}" }\n  }\n}` },
  ];
  const tabs = defs
    .map((d, i) => `<button class="tab" role="tab" id="tab-${d.id}" aria-controls="panel-${d.id}" aria-selected="${i === 0}" data-tab="${d.id}" type="button">${d.label}</button>`)
    .join("");
  const panels = defs
    .map(
      (d, i) =>
        `<div class="tabpanel" role="tabpanel" id="panel-${d.id}" aria-labelledby="tab-${d.id}"${i ? " hidden" : ""}><p>${d.hint}</p>` +
        `<figure class="code" dir="ltr"><div class="code-bar"><span>${esc(d.file)}</span><button class="copy" type="button" aria-label="کپی کد">Copy</button></div><pre><code>${esc(d.code)}</code></pre></figure></div>`
    )
    .join("");
  return `<div class="tabs"><div class="tablist" role="tablist" aria-label="ابزار AI">${tabs}</div>${panels}</div>`;
}

function pager(slug) {
  const i = pages.findIndex((p) => p.slug === slug);
  if (i < 0) return "";
  const prev = pages[i - 1];
  const next = pages[i + 1];
  if (!prev && !next) return "";
  return (
    `<nav class="pager" aria-label="صفحه قبل و بعد">` +
    (prev ? `<a href="/${prev.slug}"><small>قبلی</small><strong>${esc(prev.title)}</strong></a>` : "") +
    (next ? `<a class="next" href="/${next.slug}"><small>بعدی</small><strong>${esc(next.title)}</strong></a>` : "") +
    `</nav>`
  );
}

export function renderPage(page, origin) {
  const isApi = page.type === "api";
  const activeTop = page.slug === "build-with-mcp" ? "mcp" : page.section === "reference" && (isApi || page.slug === "api-concepts") ? "api" : "guide";
  let body = page.html;
  if (page.slug === "build-with-mcp") body = body.replace("<!--MCP_TABS-->", mcpTabs(origin));
  const toc =
    page.toc.length > 1 && !isApi
      ? `<aside class="toc" aria-label="در این صفحه"><p>در این صفحه</p><ul>` +
        page.toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join("") +
        `</ul><button class="btn btn-ghost" id="copy-md" type="button" data-src="/${page.slug}.md">کپی صفحه به‌صورت Markdown</button></aside>`
      : isApi
        ? ""
        : `<aside class="toc"><button class="btn btn-ghost" id="copy-md" type="button" data-src="/${page.slug}.md">کپی صفحه به‌صورت Markdown</button></aside>`;
  const html =
    `<!doctype html><html lang="fa" dir="rtl"><head>${head({ title: `${page.title} — Didar Developers`, description: page.description, origin, path: "/" + page.slug })}</head>` +
    `<body${isApi ? ' class="api"' : ""}>${header(activeTop)}` +
    `<div class="shell">${sidebar(page.slug)}` +
    `<main id="main" class="content${isApi ? " wide" : ""}">` +
    `<p class="crumb"><a href="/introduction">${SECTION_LABEL[page.section]}</a> / ${esc(page.title)}</p>` +
    `<h1>${esc(page.title)}</h1><p class="lead">${esc(page.lead)}</p>` +
    `<div class="prose">${body}</div>${pager(page.slug)}</main>${toc}</div>${footer()}` +
    `<script src="/assets/site.js?v=${meta.shortCommit}" defer></script></body></html>`;
  return html;
}

const CARD_ICONS = {
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  plug: '<path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7zM12 16v5"/>',
  layers: '<path d="M4 7l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4"/>',
  doc: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  window: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M14 9v11"/>',
};
const card = (href, icon, title, desc, featured) =>
  `<a class="card${featured ? " featured" : ""}" href="${href}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CARD_ICONS[icon]}</svg><strong>${title}</strong><span>${desc}</span></a>`;

export function renderHome(origin) {
  const url = mcpUrl(origin);
  const html =
    `<!doctype html><html lang="fa" dir="rtl"><head>${head({
      title: "Didar Developers — مستندات توسعه‌دهنده مارکت‌پلیس دیدار",
      description: "مستندات فنی مارکت‌پلیس دیدار: ساخت، نصب و اجرای اپ Third-party، APIهای پروکسی و MCP دیدار.",
      origin,
      path: "/",
    })}</head><body>${header("guide")}<main id="main">` +
    `<section class="hero"><p class="badge">مارکت‌پلیس دیدار · مستندات توسعه‌دهنده</p>` +
    `<h1>برای دیدار پلاگین بساز،<br>بدون اینکه از قبل چیزی بدانی</h1>` +
    `<p class="lead">این داک از صفر شروع می‌کند: دیدار چیست، یک پلاگین از چه بخش‌هایی ساخته می‌شود، و چطور اولین پلاگینت را بسازی و نصب کنی.</p></section>` +
    `<section class="band" aria-labelledby="mcp-title"><div class="mcp-card"><div class="copy-col">` +
    `<span class="pill">مسیر پیش‌فرض</span><h2 id="mcp-title">MCP دیدار را به ابزار AI خودت وصل کن</h2>` +
    `<p><strong>هر سؤالی درباره مارکت‌پلیس داری از آن بپرس و پلاگینت را با آن بساز.</strong> MCP ساختار رسمی پلاگین دیدار، API و قواعد نصب را می‌شناسد، پس خروجی‌اش از اول درست است.</p>` +
    `<div class="chips"><span>Claude</span><span>Claude Code</span><span>Cursor</span><span>VS Code</span></div>` +
    `<a class="btn btn-lg" href="/build-with-mcp">اتصال در ۵ دقیقه ←</a></div>` +
    `<div class="code-col"><figure class="code" dir="ltr"><div class="code-bar"><span>Terminal</span><button class="copy" type="button" aria-label="کپی کد">Copy</button></div>` +
    `<pre><code><span class="tk-comment"># 1. add Didar MCP</span>\nclaude mcp add --transport http didar ${esc(url)}</code></pre></figure></div></div></section>` +
    `<section class="band" style="padding-top:72px" aria-labelledby="path-title"><h2 class="section-title" id="path-title">از صفر شروع می‌کنی؟ این سه قدم</h2>` +
    `<p class="muted" style="margin:0 0 28px">به همین ترتیب جلو برو؛ هر قدم پیش‌نیاز قدم بعدی است.</p><ol class="steps">` +
    `<li class="step"><span class="n">۱</span><h3>بفهم</h3><p>دیدار چیست، مارکت‌پلیس چه مسئله‌ای را حل می‌کند و یک پلاگین از چه بخش‌هایی ساخته می‌شود.</p><a href="/anatomy">آناتومی یک پلاگین ←</a></li>` +
    `<li class="step"><span class="n">۲</span><h3>وصل کن</h3><p>MCP دیدار را به ابزار AI خودت وصل کن و از آن بخواه ساختار و API را توضیح بدهد.</p><a href="/build-with-mcp">اتصال به MCP ←</a></li>` +
    `<li class="step"><span class="n">۳</span><h3>بساز</h3><p>یک launch code را به token تبدیل کن و اولین درخواست پروکسی را بفرست.</p><a href="/quick-start">شروع سریع ←</a></li></ol></section>` +
    `<section class="band" style="padding:72px var(--space-6) 96px" aria-labelledby="all-title"><h2 class="section-title" id="all-title" style="margin-bottom:28px">همه بخش‌ها</h2><div class="cards">` +
    card("/introduction", "info", "مارکت‌پلیس دیدار را بشناس", "دو دامنه، معماری، چرخه عمر و قواعد") +
    card("/anatomy", "grid", "آناتومی یک پلاگین", "پنج بخش پلاگین و نقش هرکدام") +
    card("/build-with-mcp", "plug", "ساخت پلاگین با MCP دیدار", "مسیر پیش‌فرض ساخت", true) +
    card("/test-environment", "layers", "حساب و محیط تست", "چک‌لیست تست و موارد باز") +
    card("/app-registration", "doc", "ثبت و مدیریت اپ", "ClientId، ClientSecret و آدرس‌ها") +
    card("/installation", "lock", "احراز هویت و نصب", "نصب، CompleteInstallation و state") +
    card("/api-concepts", "code", "API دیدار", "مفاهیم پایه، scopeها و endpointها") +
    card("/extensions", "window", "App Extensions", "IFrame، Link، JSON و locationها") +
    `</div></section></main>${footer()}<script src="/assets/site.js?v=${meta.shortCommit}" defer></script></body></html>`;
  return html;
}

export function renderNotFound(origin) {
  const page = {
    slug: "404", type: "guide", section: "start", title: "صفحه پیدا نشد",
    lead: "این آدرس در داک وجود ندارد.", description: "صفحه پیدا نشد", toc: [],
    html: `<p>از <a href="/">صفحه اصلی</a> یا فهرست سمت راست ادامه بده. اگر این لینک از داخل داک آمده، آن را در ریپوی <code>marketplace-doc</code> گزارش کن.</p>`,
  };
  return renderPage(page, origin).replace(/<link rel="alternate"[^>]*>/, "");
}
