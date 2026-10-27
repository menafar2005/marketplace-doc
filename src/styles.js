// CSS سایت. توکن‌ها از دیزاین سیستم «Didar Developers» (tokens.json) گرفته شده‌اند.
export const css = `
:root{
  --brand:#13b39b;--brand-strong:#0a7a6a;--brand-strong-hover:#075e52;--on-brand:#fff;
  --brand-tint:#e8f6f3;--brand-line:#b9e4db;
  --ink:#121a19;--text:#3b4644;--muted:#5f6b68;
  --surface:#fff;--surface-2:#f6f8f7;--line:#e4e8e7;
  --code-bg:#0e1715;--code-bar:#22312e;--code-text:#e6eeec;--code-muted:#9fb1ac;--code-comment:#6e837e;--code-accent:#5fd3be;
  --warning-bg:#fff7e6;--warning-line:#f1d9a6;--warning-text:#4a3500;
  --danger:#b42318;--method-get:var(--brand-strong);--method-post:#2457a6;--method-patch:#8a5a00;--method-patch-bg:#fff4db;
  --font-sans:Vazirmatn,Tahoma,sans-serif;--font-mono:"JetBrains Mono",ui-monospace,monospace;
  --space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:72px;
  --radius-sm:6px;--radius-md:10px;--radius-lg:14px;--radius-xl:20px;
  color-scheme:light;
}
:root[data-theme="dark"]{
  --brand-strong:#3fd0b6;--brand-strong-hover:#6bddc8;--on-brand:#062b25;
  --brand-tint:#12302b;--brand-line:#1f5a50;
  --ink:#ecf2f0;--text:#c3cecb;--muted:#8e9d99;
  --surface:#0f1514;--surface-2:#161e1c;--line:#26302e;
  --code-bg:#0a100f;--code-bar:#1b2624;--code-comment:#7d918c;
  --warning-bg:#2e2410;--warning-line:#5c4515;--warning-text:#f3d9a0;
  --danger:#f97066;--method-post:#7ca7f0;--method-patch:#e8b65a;--method-patch-bg:#2e2410;
  color-scheme:dark;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --brand-strong:#3fd0b6;--brand-strong-hover:#6bddc8;--on-brand:#062b25;
    --brand-tint:#12302b;--brand-line:#1f5a50;
    --ink:#ecf2f0;--text:#c3cecb;--muted:#8e9d99;
    --surface:#0f1514;--surface-2:#161e1c;--line:#26302e;
    --code-bg:#0a100f;--code-bar:#1b2624;--code-comment:#7d918c;
    --warning-bg:#2e2410;--warning-line:#5c4515;--warning-text:#f3d9a0;
    --danger:#f97066;--method-post:#7ca7f0;--method-patch:#e8b65a;--method-patch-bg:#2e2410;
    color-scheme:dark;
  }
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--surface);color:var(--text);font-family:var(--font-sans);font-size:16px;line-height:1.85}
a{color:var(--brand-strong);text-decoration:none}
a:hover{color:var(--brand-strong-hover)}
a:focus-visible,button:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid var(--brand-strong);outline-offset:2px}
h1,h2,h3{color:var(--ink);font-weight:800;margin:0}
code{font-family:var(--font-mono);font-size:.88em;direction:ltr;unicode-bidi:isolate;padding:1px 6px;border-radius:var(--radius-sm);background:var(--surface-2);border:1px solid var(--line);color:var(--ink)}
.skip{position:absolute;inset-inline-start:-9999px}
.skip:focus{inset-inline-start:var(--space-4);top:var(--space-2);z-index:20;background:var(--surface);padding:8px 12px;border-radius:var(--radius-md)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}

/* header */
.site-header{border-bottom:1px solid var(--line);background:var(--surface)}
.site-header-in{max-width:1360px;margin:0 auto;padding:0 var(--space-6);min-height:64px;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-4) var(--space-6)}
.logo{display:flex;align-items:center;gap:10px;color:var(--ink)}
.logo:hover{color:var(--ink)}
.logo b{font-weight:800;font-size:18px}
.logo small{font-family:var(--font-mono);font-size:13px;color:var(--muted);padding:2px 8px;border:1px solid var(--line);border-radius:var(--radius-sm)}
.top-nav{display:flex;flex-wrap:wrap;gap:var(--space-1);font-size:15px}
.top-nav a{padding:8px 12px;border-radius:8px;color:var(--text)}
.top-nav a[aria-current]{color:var(--ink);font-weight:600;background:var(--surface-2)}
.grow{flex:1 1 120px}
.search{position:relative;flex:0 1 280px}
.search label{display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-2);color:var(--muted);font-size:14px}
.search input{flex:1;border:0;background:transparent;font:inherit;color:var(--ink);outline:none;min-width:0}
.search kbd{font-family:var(--font-mono);font-size:12px;border:1px solid var(--line);border-radius:4px;padding:0 6px;background:var(--surface)}
.search-results{position:absolute;inset-inline:0;top:46px;z-index:10;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-md);box-shadow:none;max-height:420px;overflow:auto}
.search-results[hidden]{display:none}
.search-results a{display:block;padding:10px 14px;border-bottom:1px solid var(--line);color:var(--text);font-size:14px;line-height:1.7}
.search-results a:last-child{border-bottom:0}
.search-results a:hover,.search-results a:focus{background:var(--surface-2)}
.search-results strong{display:block;color:var(--ink)}
.search-results .empty{padding:12px 14px;color:var(--muted);font-size:14px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 16px;border-radius:var(--radius-md);background:var(--brand-strong);color:var(--on-brand);font-weight:600;font-size:14px;border:0;cursor:pointer;font-family:inherit}
.btn:hover{background:var(--brand-strong-hover);color:var(--on-brand)}
.btn-ghost{background:transparent;color:var(--text);border:1px solid var(--line)}
.btn-ghost:hover{background:var(--surface-2);color:var(--ink)}
.icon-btn{width:40px;padding:0}

/* layout */
.shell{max-width:1360px;margin:0 auto;padding:0 var(--space-6);display:flex;flex-wrap:wrap;gap:var(--space-7);align-items:flex-start}
.sidebar{flex:1 1 240px;max-width:260px;padding:var(--space-6) 0;font-size:14px;line-height:1.6}
.sidebar details>summary{display:none}
.mcp-link{display:flex;align-items:center;gap:8px;padding:10px 12px;margin-bottom:var(--space-5);border-radius:var(--radius-md);background:var(--brand-tint);border:2px solid var(--brand);color:var(--brand-strong);font-weight:700}
.nav-group{margin:0 0 8px;padding:0 12px;color:var(--ink);font-weight:700;font-size:13px}
.nav-list{list-style:none;margin:0 0 20px;padding:0;display:flex;flex-direction:column;gap:2px}
.nav-list a{display:block;padding:6px 12px;border-radius:8px;color:var(--text)}
.nav-list a:hover{background:var(--surface-2)}
.nav-list a[aria-current]{color:var(--brand-strong);background:var(--surface-2);font-weight:700;border-inline-start:2px solid var(--brand)}
.content{flex:999 1 560px;min-width:0;max-width:760px;padding:40px 0 96px}
.content.wide{max-width:none}
.toc{flex:1 1 200px;max-width:220px;padding:40px 0;font-size:14px;line-height:1.6}
.toc p{margin:0 0 10px;color:var(--ink);font-weight:700;font-size:13px}
.toc ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;border-inline-start:1px solid var(--line)}
.toc a{display:block;padding-inline-start:12px;color:var(--muted);margin-inline-start:-1px;border-inline-start:2px solid transparent}
.toc a.on{color:var(--brand-strong);font-weight:600;border-inline-start-color:var(--brand)}
.toc .btn-ghost{height:auto;padding:6px 10px;margin-top:var(--space-5);font-size:13px;border-radius:8px}

/* prose */
.crumb{margin:0 0 12px;font-size:14px;color:var(--muted)}
.content h1{font-size:38px;line-height:1.45;margin-bottom:var(--space-4)}
.lead{margin:0 0 28px;font-size:19px;line-height:1.8;color:var(--text)}
.prose h2{font-size:26px;line-height:1.6;margin:var(--space-6) 0 12px;scroll-margin-top:16px}
.prose h3{font-size:19px;line-height:1.6;margin:var(--space-5) 0 8px;font-weight:700}
.prose p{margin:0 0 var(--space-4)}
.prose ul,.prose ol{margin:0 0 var(--space-4);padding-inline-start:24px}
.prose li{margin-bottom:4px}
.prose li input[type=checkbox]{margin-inline-end:8px;accent-color:var(--brand-strong)}
.prose strong{color:var(--ink)}
.table-wrap{overflow-x:auto;margin:0 0 var(--space-5);border:1px solid var(--line);border-radius:12px}
table{width:100%;border-collapse:collapse;font-size:15px;min-width:480px}
th{background:var(--surface-2);text-align:start;color:var(--ink);font-weight:700}
th{white-space:nowrap}
th,td{padding:12px 16px;border-bottom:1px solid var(--line);vertical-align:top}
tr:last-child td{border-bottom:0}
.callout{display:flex;gap:14px;padding:var(--space-4) 18px;margin:0 0 var(--space-5);border-radius:var(--radius-lg);background:var(--brand-tint);border:1px solid var(--brand-line);color:var(--ink)}
.callout svg{flex:none;margin-top:5px;color:var(--brand-strong)}
.callout>div>p:last-child{margin-bottom:0}
.callout-warning{background:var(--warning-bg);border-color:var(--warning-line);color:var(--warning-text)}
.callout-warning svg,.callout-warning strong{color:var(--warning-text)}
.callout-warning a{color:var(--warning-text);text-decoration:underline}
.callout>div{min-width:0}
blockquote.prompt{margin:0 0 var(--space-5);padding:var(--space-4) 18px;border-radius:var(--radius-lg);background:var(--surface-2);border:1px solid var(--line);color:var(--ink)}
blockquote.prompt p:last-child{margin:0}
.code{margin:0 0 var(--space-5);border-radius:var(--radius-md);overflow:hidden;background:var(--code-bg);text-align:left}
.code-bar{display:flex;align-items:center;justify-content:space-between;padding:6px 16px;border-bottom:1px solid var(--code-bar);color:var(--code-muted);font-family:var(--font-mono);font-size:12px}
.copy{background:transparent;border:0;color:var(--code-muted);font:inherit;cursor:pointer;padding:4px 8px;border-radius:4px;min-height:28px}
.copy:hover{color:var(--code-text)}
.code pre{margin:0;padding:18px 20px;overflow-x:auto;font-family:var(--font-mono);font-size:14px;line-height:1.8;color:var(--code-text)}
.code code{background:none;border:0;padding:0;color:inherit;font-size:inherit;direction:ltr}
.tk-key{color:var(--code-accent)}
.tk-comment{color:var(--code-comment)}
.pager{display:flex;flex-wrap:wrap;gap:var(--space-4);padding-top:var(--space-5);margin-top:var(--space-7);border-top:1px solid var(--line)}
.pager a{flex:1 1 220px;padding:16px 18px;border:1px solid var(--line);border-radius:12px;color:var(--text)}
.pager a:hover{background:var(--surface-2)}
.pager small{display:block;font-size:13px;color:var(--muted)}
.pager strong{color:var(--ink)}
.pager .next{text-align:end}
.site-footer{border-top:1px solid var(--line);background:var(--surface-2)}
.site-footer-in{max-width:1120px;margin:0 auto;padding:28px var(--space-6);display:flex;flex-wrap:wrap;gap:var(--space-4);justify-content:space-between;color:var(--muted);font-size:14px}

/* mcp tabs */
.tabs{margin:0 0 var(--space-4)}
.tablist{display:flex;flex-wrap:wrap;gap:var(--space-1);padding:4px;margin-bottom:var(--space-3);border-radius:var(--radius-md);background:var(--surface-2);border:1px solid var(--line);width:fit-content;max-width:100%}
.tab{min-height:40px;padding:0 14px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--text);font:inherit;font-size:14px;font-weight:500;cursor:pointer}
.tab[aria-selected=true]{background:var(--surface);border-color:var(--brand-line);color:var(--brand-strong);font-weight:700}
.js .tabpanel[hidden]{display:none}
.tabpanel>p{margin:0 0 var(--space-2);font-size:15px}

/* api reference */
.api .shell{max-width:1440px}
.api .content{max-width:none}
.intro{margin:0 0 var(--space-5)}
.endpoint{display:flex;flex-wrap:wrap;gap:var(--space-6) var(--space-7);padding:var(--space-6) 0;border-top:1px solid var(--line);align-items:flex-start}
.endpoint:first-of-type{border-top:0}
.endpoint-main{flex:999 1 420px;min-width:0}
.endpoint-code{flex:1 1 380px;max-width:520px;min-width:0}
.endpoint-code .code pre{white-space:pre-wrap;word-break:break-word;font-size:13px}
.endpoint h2{font-size:26px;line-height:1.6;margin:0 0 var(--space-2);scroll-margin-top:16px}
.endpoint h3{font-size:19px;margin:var(--space-5) 0 var(--space-2)}
.ep-line{display:inline-flex;align-items:center;gap:10px;margin-bottom:var(--space-4);padding:6px 12px;border-radius:8px;background:var(--surface-2);border:1px solid var(--line);font-family:var(--font-mono);font-size:14px;max-width:100%;overflow-x:auto}
.ep-line code{background:none;border:0;padding:0}
.m{padding:1px 8px;border-radius:4px;font-weight:700}
.m-get{color:var(--method-get);background:var(--brand-tint)}
.m-post{color:var(--method-post);background:var(--surface)}
.m-put{color:var(--method-patch);background:var(--method-patch-bg)}
.m-delete{color:var(--danger)}
.ep-meta{font-size:14px;color:var(--muted)}
.muted{color:var(--muted);font-size:15px}
.params{border-top:1px solid var(--line)}
.param{padding:12px 0;border-bottom:1px solid var(--line);padding-inline-start:calc(var(--depth,0) * 18px)}
.param-head{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:2px;justify-content:flex-end;flex-direction:row-reverse}
.param-name{font-weight:700}
.param-type{font-family:var(--font-mono);font-size:13px;color:var(--muted)}
.req{font-size:12px;font-weight:700;color:var(--danger)}
.opt{font-size:12px;color:var(--muted)}
.param p{margin:0;font-size:15px;line-height:1.8}
.api-nav-methods{font-family:var(--font-mono);font-size:13px;direction:ltr}

/* home */
.hero{max-width:920px;margin:0 auto;padding:88px var(--space-6) 56px;text-align:center}
.badge{margin:0 0 var(--space-4);display:inline-block;padding:4px 12px;border-radius:999px;background:var(--brand-tint);color:var(--brand-strong);font-size:14px;font-weight:600}
.hero h1{font-size:48px;line-height:1.35;margin:0 0 20px}
.hero p.lead{max-width:640px;margin:0 auto}
.band{max-width:1120px;margin:0 auto;padding:0 var(--space-6)}
.mcp-card{display:flex;flex-wrap:wrap;gap:var(--space-6);align-items:stretch;padding:40px;border-radius:var(--radius-xl);background:var(--brand-tint);border:2px solid var(--brand)}
.mcp-card .copy-col{flex:1 1 380px;display:flex;flex-direction:column;gap:14px}
.mcp-card .code-col{flex:1 1 380px;display:flex;flex-direction:column}
.mcp-card .code-col .code{margin:0;flex:1}
.mcp-card h2{font-size:30px;line-height:1.5}
.mcp-card p{margin:0;color:var(--ink);font-size:17px}
.pill{align-self:flex-start;padding:3px 10px;border-radius:var(--radius-sm);background:var(--brand-strong);color:var(--on-brand);font-size:13px;font-weight:700}
.chips{display:flex;flex-wrap:wrap;gap:8px;font-size:14px}
.chips span{padding:4px 10px;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--brand-line);color:var(--ink)}
.btn-lg{align-self:flex-start;height:48px;padding:0 22px;border-radius:12px;font-size:16px;font-weight:700}
.section-title{font-size:26px;margin:0 0 8px}
.steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.step{padding:28px;border:1px solid var(--line);border-radius:16px;background:var(--surface);display:flex;flex-direction:column;gap:10px}
.step .n{width:36px;height:36px;border-radius:var(--radius-md);background:var(--brand-tint);color:var(--brand-strong);display:flex;align-items:center;justify-content:center;font-weight:800}
.step h3{font-size:19px}
.step p{margin:0}
.step a{font-weight:600;font-size:15px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-4)}
.card{display:flex;flex-direction:column;gap:6px;padding:22px;border:1px solid var(--line);border-radius:var(--radius-lg);color:var(--text)}
.card:hover{background:var(--surface-2);color:var(--text)}
.card strong{color:var(--ink);font-size:16px}
.card span{font-size:14px}
.card svg{color:var(--brand-strong)}
.card.featured{border:2px solid var(--brand);background:var(--brand-tint)}
.card.featured:hover{background:var(--brand-tint)}

@media (max-width:900px){
  .shell{gap:0;padding:0 var(--space-4)}
  .sidebar,.toc{flex:1 1 100%;max-width:none}
  .sidebar{padding:var(--space-4) 0 0}
  .sidebar details>summary{display:block;cursor:pointer;padding:10px 12px;border:1px solid var(--line);border-radius:var(--radius-md);font-weight:700;color:var(--ink);margin-bottom:var(--space-3)}
  .toc{padding:0 0 var(--space-6)}
  .content h1{font-size:30px}
  .hero{padding:48px var(--space-4) 32px}
  .hero h1{font-size:34px}
  .band,.site-header-in{padding:0 var(--space-4)}
  .mcp-card{padding:24px}
  .search{flex:1 1 100%}
}
@media print{.site-header,.sidebar,.toc,.copy{display:none}}
`;
