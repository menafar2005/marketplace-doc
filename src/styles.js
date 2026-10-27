// CSS سایت: ساختار و جزئیات بصری Claude Platform Docs، با تم رنگی دیدار (سبزآبی) و راست‌چین.
export const css = `
:root{
  --brand:#13b39b;--brand-strong:#0a7a6a;--brand-strong-hover:#075e52;--on-brand:#fff;
  --brand-tint:#e8f6f3;--brand-line:#b9e4db;
  --ink:#121a19;--text:#3b4644;--muted:#5f6b68;
  --surface:#fff;--surface-2:#f4f6f5;--line:#e4e8e7;--line-strong:#d3dad8;
  --code-bg:#f6f8f7;--code-border:#dfe5e3;--code-text:#1f2a28;--code-tab:#e6ebe9;--code-inline:#0a7a6a;
  --tk-c:#3f7d3a;--tk-s:#a9500f;--tk-k:#1d5fb4;--tk-n:#a9500f;--tk-v:#1d5fb4;
  --warning-bg:#fff7e6;--warning-line:#f1d9a6;--warning-text:#4a3500;
  --danger:#b42318;--method-get:var(--brand-strong);--method-post:#2457a6;--method-patch:#8a5a00;--method-patch-bg:#fff4db;
  --font-sans:Vazirmatn,Tahoma,sans-serif;--font-mono:"JetBrains Mono",ui-monospace,monospace;
  --font-serif:"Source Serif 4","Noto Naskh Arabic",Georgia,serif;
  --header-h:52px;--sidebar-w:272px;--toc-w:248px;
  color-scheme:light;
}
:root[data-theme="dark"]{
  --brand-strong:#3fd0b6;--brand-strong-hover:#6bddc8;--on-brand:#062b25;
  --brand-tint:#12302b;--brand-line:#1f5a50;
  --ink:#f1f5f4;--text:#c3cecb;--muted:#8e9d99;
  --surface:#0f1514;--surface-2:#182120;--line:#242e2c;--line-strong:#33403d;
  --code-bg:#151d1b;--code-border:#2b3734;--code-text:#e6eeec;--code-tab:#2a3633;--code-inline:#5fd3be;
  --tk-c:#7fb069;--tk-s:#e8a56c;--tk-k:#79b8ff;--tk-n:#e8a56c;--tk-v:#7cb7ff;
  --warning-bg:#2e2410;--warning-line:#5c4515;--warning-text:#f3d9a0;
  --danger:#f97066;--method-post:#7ca7f0;--method-patch:#e8b65a;--method-patch-bg:#2e2410;
  color-scheme:dark;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-padding-top:calc(var(--header-h) + 16px)}
body{margin:0;background:var(--surface);color:var(--text);font-family:var(--font-sans);font-size:16px;line-height:1.8}
a{color:var(--brand-strong);text-decoration:none}
a:hover{color:var(--brand-strong-hover)}
a:focus-visible,button:focus-visible,input:focus-visible,summary:focus-visible,pre:focus-visible{outline:2px solid var(--brand-strong);outline-offset:2px}
h1,h2,h3{color:var(--ink);font-family:var(--font-serif);font-weight:600;margin:0}
code{font-family:var(--font-mono);font-size:.86em;direction:ltr;unicode-bidi:isolate;padding:2px 6px;border-radius:6px;background:var(--code-bg);border:1px solid var(--code-border);color:var(--code-inline)}
.skip{position:absolute;inset-inline-start:-9999px}
.skip:focus{inset-inline-start:16px;top:8px;z-index:50;background:var(--surface);padding:8px 12px;border-radius:10px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}

/* ---------- topbar ---------- */
.topbar{position:sticky;top:0;z-index:30;height:var(--header-h);display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;padding:0 20px;background:var(--surface);border-bottom:1px solid var(--line)}
.topbar-start{display:flex;align-items:center}
.brand{display:flex;align-items:center;gap:10px;color:var(--ink)}
.brand:hover{color:var(--ink)}
.wordmark{font-family:var(--font-serif);font-weight:600;font-size:20px;letter-spacing:-.01em;direction:ltr}
.tabs-nav{display:flex;gap:4px}
.tab-link{padding:6px 16px;border-radius:10px;color:var(--muted);font-size:14px;font-weight:500;line-height:1.6}
.tab-link:hover{color:var(--ink)}
.tab-link[aria-current]{background:var(--surface-2);color:var(--ink);font-weight:600}
.topbar-end{display:flex;align-items:center;justify-content:flex-end;gap:8px}
.top-link{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;color:var(--ink);font-size:14px;font-weight:500}
.top-link:hover{color:var(--brand-strong)}
.icon-btn{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:10px;background:transparent;color:var(--muted);cursor:pointer}
.icon-btn:hover{background:var(--surface-2);color:var(--ink)}
.pill-btn{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:10px;border:1px solid var(--line-strong);background:var(--surface-2);color:var(--ink);font:inherit;font-size:14px;font-weight:500;cursor:pointer}
.pill-btn:hover{border-color:var(--muted);color:var(--ink)}
.solid-btn{display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 16px;border-radius:10px;background:var(--ink);color:var(--surface);font-size:14px;font-weight:600}
.solid-btn:hover{background:var(--brand-strong);color:var(--on-brand)}
.solid-btn.lg{height:44px;padding:0 22px;font-size:15px;align-self:flex-start;margin-top:4px}

/* ---------- layout ---------- */
.layout{display:grid;grid-template-columns:var(--sidebar-w) minmax(0,1fr) var(--toc-w);align-items:start;min-height:calc(100vh - var(--header-h))}
.layout.no-toc{grid-template-columns:var(--sidebar-w) minmax(0,1fr)}
.sidebar{position:sticky;top:var(--header-h);height:calc(100vh - var(--header-h));overflow-y:auto;padding:16px 12px 40px;border-inline-end:1px solid var(--line);font-size:14px;line-height:1.6;scrollbar-width:thin;scrollbar-color:var(--line-strong) transparent}
.sidebar details>summary{display:none}
.search{position:relative;margin-bottom:12px}
.search label{display:flex;align-items:center;gap:8px;height:38px;padding:0 10px;border:1px solid var(--line-strong);border-radius:10px;background:var(--surface-2);color:var(--muted)}
.search input{flex:1;border:0;background:transparent;font:inherit;font-size:14px;color:var(--ink);outline:none;min-width:0}
.search input::placeholder{color:var(--muted)}
.search kbd{font-family:var(--font-sans);font-size:12px;border:1px solid var(--line-strong);border-radius:6px;padding:0 6px;background:var(--surface);color:var(--muted);line-height:20px}
.search-results{position:absolute;inset-inline-start:0;top:44px;z-index:20;width:min(420px,calc(100vw - 32px));background:var(--surface);border:1px solid var(--line-strong);border-radius:12px;max-height:420px;overflow:auto}
.search-results[hidden]{display:none}
.search-results a{display:block;padding:10px 14px;border-bottom:1px solid var(--line);color:var(--text);font-size:14px;line-height:1.7}
.search-results a:last-child{border-bottom:0}
.search-results a:hover,.search-results a:focus{background:var(--surface-2)}
.search-results strong{display:block;color:var(--ink)}
.search-results .empty{padding:12px 14px;color:var(--muted)}
.mcp-link{display:flex;align-items:center;gap:8px;height:38px;padding:0 12px;margin-bottom:6px;border-radius:10px;background:var(--brand-tint);border:2px solid var(--brand);color:var(--brand-strong);font-weight:700}
.mcp-link:hover{color:var(--brand-strong)}
.nav-group{margin:22px 0 6px;padding:0 12px;color:var(--ink);font-weight:700;font-size:14px}
.nav-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.nav-list a{display:flex;align-items:center;min-height:36px;padding:4px 12px;border-radius:10px;color:var(--text)}
.nav-list a:hover{background:var(--surface-2);color:var(--ink)}
.nav-list a[aria-current]{background:var(--surface-2);color:var(--ink);font-weight:600}
.main{min-width:0;padding:40px 48px 0;display:flex;flex-direction:column;min-height:calc(100vh - var(--header-h))}
.doc{width:100%;max-width:832px;margin:0 auto;flex:1}
.doc.wide{max-width:none}
.toc{position:sticky;top:var(--header-h);padding:40px 24px;font-size:14px;line-height:1.6;max-height:calc(100vh - var(--header-h));overflow-y:auto}
.toc ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;border-inline-start:1px solid var(--line)}
.toc a{display:block;padding:6px 16px;margin-inline-start:-1px;color:var(--muted);border-inline-start:2px solid transparent}
.toc a:hover{color:var(--ink)}
.toc li.l3 a{padding-inline-start:32px}
.toc a.on{color:var(--ink);font-weight:600;border-inline-start-color:var(--ink)}
.site-footer{display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between;margin-top:72px;padding:24px 0 32px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}

/* ---------- page header ---------- */
.crumb{margin:0 0 8px;font-size:14px;color:var(--muted)}
.title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px}
.title-row h1{font-size:40px;line-height:1.5}
.title-row .pill-btn{flex:none;margin-top:6px;height:34px;font-size:13px}
.lead{margin:0 0 28px;font-size:18px;line-height:1.85;color:var(--text)}

/* ---------- prose ---------- */
.prose h2{font-size:28px;line-height:1.6;margin:48px 0 12px}
.prose h3{font-size:21px;line-height:1.6;margin:32px 0 8px}
.prose p{margin:0 0 16px}
.prose a{text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--brand-strong) 45%,transparent);text-underline-offset:3px}
.prose a:hover{text-decoration-color:currentColor}
.prose ul,.prose ol{margin:0 0 16px;padding-inline-start:26px}
.prose li{margin-bottom:6px}
.prose li input[type=checkbox]{margin-inline-end:8px;accent-color:var(--brand-strong)}
.prose strong{color:var(--ink);font-weight:600}
.table-wrap{overflow-x:auto;margin:0 0 24px;border:1px solid var(--line-strong);border-radius:12px}
table{width:100%;border-collapse:collapse;font-size:15px;min-width:480px;line-height:1.7}
th{background:var(--surface-2);text-align:start;color:var(--ink);font-weight:700;white-space:nowrap}
th,td{padding:12px 16px;border-bottom:1px solid var(--line);vertical-align:top}
tr:last-child td{border-bottom:0}
.callout{display:flex;gap:14px;padding:16px 18px;margin:0 0 24px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line-strong);color:var(--text)}
.callout svg{flex:none;margin-top:5px;color:var(--brand-strong)}
.callout>div{min-width:0}
.callout>div>p:last-child{margin-bottom:0}
.callout-warning{background:var(--warning-bg);border-color:var(--warning-line);color:var(--warning-text)}
.callout-warning svg,.callout-warning strong,.callout-warning a{color:var(--warning-text)}
blockquote.prompt{margin:0 0 24px;padding:16px 18px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line-strong);color:var(--ink)}
blockquote.prompt p:last-child{margin:0}
.pager{display:flex;flex-wrap:wrap;gap:16px;margin-top:56px}
.pager a,.pager span{flex:1 1 220px}
.pager a{padding:16px 18px;border:1px solid var(--line-strong);border-radius:12px;color:var(--text)}
.pager a:hover{background:var(--surface-2)}
.pager small{display:block;font-size:13px;color:var(--muted)}
.pager strong{color:var(--ink);font-weight:600}
.pager .next{text-align:end}

/* ---------- code blocks (مثل Claude Platform Docs) ---------- */
.cb{margin:20px 0;border:1px solid var(--code-border);border-radius:12px;background:var(--code-bg);overflow:hidden;direction:ltr;text-align:left}
.cb-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 8px 8px 12px;border-bottom:1px solid var(--code-border)}
.cb-tabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;min-width:0}
.cb-tabs::-webkit-scrollbar{display:none}
.cb-tab{flex:none;height:30px;padding:0 12px;border:0;border-radius:8px;background:transparent;color:var(--muted);font-family:var(--font-sans);font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap}
.cb-tab:hover{color:var(--ink)}
.cb-tab[aria-selected=true]{background:var(--code-tab);color:var(--ink);font-weight:700}
.cb-copy{flex:none;width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:transparent;color:var(--muted);cursor:pointer}
.cb-copy:hover{background:var(--code-tab);color:var(--ink)}
.cb-copy .i-done{display:none}
.cb-copy.copied .i-copy{display:none}
.cb-copy.copied .i-done{display:inline-flex;color:var(--brand-strong)}
.cb-body pre{margin:0;padding:16px 20px;overflow-x:auto;font-family:var(--font-mono);font-size:13.5px;line-height:1.6;color:var(--code-text);tab-size:2}
.cb-body pre[hidden]{display:none}
.cb-body code{background:none;border:0;padding:0;color:inherit;font-size:inherit;direction:ltr;unicode-bidi:normal;white-space:pre}
.tk-c{color:var(--tk-c)}
.tk-s{color:var(--tk-s)}
.tk-k{color:var(--tk-k)}
.tk-kw{color:var(--tk-k)}
.tk-n{color:var(--tk-n)}
.tk-v{color:var(--tk-v);font-weight:700}
.tk-cmd{color:var(--ink);font-weight:700}
.mcp-hints{margin-bottom:4px}
.js .mcp-hints .hint:not(.on){display:none}
.mcp-hints .hint{margin:0;font-size:15px}

/* ---------- api reference ---------- */
.endpoint{display:flex;flex-wrap:wrap;gap:24px 48px;padding:40px 0;border-top:1px solid var(--line);align-items:flex-start}
.endpoint:first-child{border-top:0;padding-top:8px}
.endpoint-main{flex:1 1 440px;min-width:0}
.endpoint-code{flex:0 1 540px;min-width:0;position:sticky;top:calc(var(--header-h) + 16px)}
.endpoint-code .cb{margin:0 0 16px}
.endpoint h2{font-size:28px;line-height:1.6;margin:0 0 8px}
.endpoint h3{font-size:20px;margin:28px 0 8px}
.ep-line{display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;padding:6px 12px;border-radius:10px;background:var(--surface-2);border:1px solid var(--line-strong);font-family:var(--font-mono);font-size:14px;max-width:100%;overflow-x:auto}
.ep-line code{background:none;border:0;padding:0;color:var(--ink)}
.m{padding:1px 8px;border-radius:6px;font-weight:700}
.m-get{color:var(--method-get);background:var(--brand-tint)}
.m-post{color:var(--method-post);background:var(--surface)}
.m-put{color:var(--method-patch);background:var(--method-patch-bg)}
.m-delete{color:var(--danger)}
.ep-meta{font-size:14px;color:var(--muted)}
.muted{color:var(--muted);font-size:15px}
.params{border-top:1px solid var(--line)}
.param{padding:12px 0;border-bottom:1px solid var(--line);padding-inline-start:calc(var(--depth,0) * 18px)}
.param-head{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:2px;justify-content:flex-end;flex-direction:row-reverse}
.param-name{font-weight:700;color:var(--ink)}
.param-type{font-family:var(--font-mono);font-size:13px;color:var(--muted)}
.req{font-size:12px;font-weight:700;color:var(--danger)}
.opt{font-size:12px;color:var(--muted)}
.param p{margin:0;font-size:15px;line-height:1.8}

/* ---------- home ---------- */
.mcp-card{display:flex;flex-direction:column;gap:12px;padding:24px;margin:0 0 8px;border-radius:16px;background:var(--brand-tint);border:2px solid var(--brand)}
.mcp-card p{margin:0;color:var(--ink)}
.mcp-card .cb{margin:4px 0}
.pill{align-self:flex-start;padding:2px 10px;border-radius:6px;background:var(--brand-strong);color:var(--on-brand);font-size:13px;font-weight:700}
.steps{list-style:none;margin:20px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.step{padding:22px;border:1px solid var(--line-strong);border-radius:14px;display:flex;flex-direction:column;gap:8px;margin:0}
.step .n{width:34px;height:34px;border-radius:10px;background:var(--brand-tint);color:var(--brand-strong);display:flex;align-items:center;justify-content:center;font-weight:800}
.step h3{font-size:19px;margin:0}
.step p{margin:0;font-size:15px}
.prose .step a{text-decoration:none;font-weight:600;font-size:15px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:20px}
.card{display:flex;flex-direction:column;gap:6px;padding:20px;border:1px solid var(--line-strong);border-radius:12px;color:var(--text)}
.card:hover{background:var(--surface-2);color:var(--text)}
.card strong{color:var(--ink);font-size:16px}
.card span{font-size:14px;color:var(--muted)}
.card svg{color:var(--brand-strong)}
.card.featured{border:2px solid var(--brand);background:var(--brand-tint)}
.prose a.card,.prose a.solid-btn{text-decoration:none}
.prose a.solid-btn{color:var(--surface)}
.prose a.solid-btn:hover{color:var(--on-brand)}

/* ---------- responsive ---------- */
@media (max-width:1200px){
  .layout{grid-template-columns:var(--sidebar-w) minmax(0,1fr)}
  .toc{display:none}
}
@media (max-width:900px){
  .topbar{grid-template-columns:1fr auto;height:auto;min-height:var(--header-h);padding:8px 16px;row-gap:8px}
  .tabs-nav{grid-column:1 / -1;order:3;overflow-x:auto}
  .top-link,.pill-btn[href]{display:none}
  .layout,.layout.no-toc{display:block}
  .sidebar{position:static;height:auto;border-inline-end:0;border-bottom:1px solid var(--line);padding:12px 16px}
  .sidebar details>summary{display:block;cursor:pointer;padding:8px 12px;border:1px solid var(--line-strong);border-radius:10px;font-weight:700;color:var(--ink);margin-bottom:12px}
  .main{padding:24px 16px 0;min-height:0}
  .title-row h1{font-size:30px}
  .endpoint-code{position:static;flex:1 1 100%}
  html{scroll-padding-top:16px}
}
@media print{.topbar,.sidebar,.toc,.cb-copy,#copy-md{display:none}.layout{display:block}}
`;
