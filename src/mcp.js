// سرور MCP داک دیدار (Streamable HTTP، stateless، JSON-RPC 2.0).
// فقط از محتوای همین داک جواب می‌دهد و هر جواب لینک صفحه‌ی مرجع را دارد.
import { pages, spec, meta } from "./generated/content.js";
import { searchDocs } from "./search.js";
import { scaffoldPlugin } from "./scaffold.js";
import { validatePlugin } from "./validate.js";

const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];
const bySlug = new Map(pages.map((p) => [p.slug, p]));
const endpoints = spec.groups.flatMap((g) => g.endpoints.map((e) => ({ ...e, group: g.id, page: g.page })));

const text = (t, isError = false) => ({ content: [{ type: "text", text: t }], ...(isError ? { isError: true } : {}) });
const json = (v) => text(JSON.stringify(v, null, 2));
const slugOf = (s) => String(s || "").trim().replace(/^https?:\/\/[^/]+/, "").replace(/^\/+|\.md$|#.*$/g, "");

const ANATOMY = [
  { part: 1, name: "ساخت اپ در Developer Hub", what: "نام، Callback URL، scopeها و اکستنشن‌ها؛ خروجی: Client ID و Client secret. اپ Draft است تا Change to live.", rules: ["فقط ادمین BizDomain به https://app.didar.me/developerhub دسترسی دارد", "Client secret فقط در backend / secret store", "Callback URL و آدرس اکستنشن‌ها HTTPS"], page: "create-app" },
  { part: 2, name: "نصب", what: "ادمین با لینک نصب، اپ را روی BizDomain خودش تأیید می‌کند؛ Callback URL اپ code را با CompleteInstallation کامل می‌کند", rules: ["state یک‌بارمصرف بساز و در callback تطبیق بده", "نتیجه را با BizDomainId ذخیره کن", "ApiKey فقط رمزگذاری‌شده"], page: "installation" },
  { part: 3, name: "اجرا (launch)", what: "دیدار با ?launchCode= آدرس اکستنشن را صدا می‌زند؛ backend کد را با /api/v1/runtime/token به Runtime Token و Runtime Context تبدیل می‌کند", rules: ["launchCode یک‌بارمصرف است؛ ذخیره یا log نکن", "فقط به context برگشتی اعتماد کن", "payload را در backend validate کن"], page: "launch" },
  { part: 4, name: "داده با API پروکسی", what: "خواندن و نوشتن معامله، پرونده، شخص، شرکت، فعالیت و یادداشت از marketplace.didar.me با Bearer Runtime Token", rules: ["فقط در محدوده‌ی scope و entityIds همان اجرا", "بدنه دقیقاً مثل API دیدار؛ casing را حفظ کن", "Runtime Token را برای اجرای بعدی reuse نکن"], page: "crm-data" },
  { part: 5, name: "رابط کاربری (اکستنشن‌ها)", what: "Links، JSON modal، JSON panel، Custom modal، Custom panel و App settings در Locationهای دیدار", rules: ["CORS فقط برای origin دقیق دیدار", "Iframe URL فقط HTTPS", "ظرفیت: ۳ اکستنشن منو در هر Location، ۱ پنل در هر صفحه‌ی جزئیات"], page: "extensions" },
];

const TOOLS = [
  {
    name: "search_docs",
    description: "جستجو در کل داک مارکت‌پلیس دیدار. تکه‌های مرتبط را با لینک صفحه برمی‌گرداند. برای هر سؤال درباره‌ی مارکت‌پلیس از اینجا شروع کن.",
    inputSchema: { type: "object", properties: { query: { type: "string", description: "عبارت جستجو (فارسی یا انگلیسی)" }, limit: { type: "integer", minimum: 1, maximum: 20, default: 5 } }, required: ["query"] },
    run: (a, o) => {
      const results = searchDocs(a.query, { limit: a.limit ?? 5, origin: o });
      return results.length ? json({ query: a.query, results }) : text(`نتیجه‌ای برای «${a.query}» پیدا نشد. list_pages را بزن یا عبارت دیگری امتحان کن.`);
    },
  },
  {
    name: "list_pages",
    description: "فهرست همه‌ی صفحه‌های داک با slug، عنوان و لینک.",
    inputSchema: { type: "object", properties: {} },
    run: (_a, o) => json(pages.map((p) => ({ slug: p.slug, title: p.title, section: p.section, summary: p.lead, url: `${o}/${p.slug}` }))),
  },
  {
    name: "get_page",
    description: "متن کامل یک صفحه‌ی داک به Markdown. slug را از list_pages یا search_docs بگیر.",
    inputSchema: { type: "object", properties: { slug: { type: "string", description: "مثل launch یا installation" } }, required: ["slug"] },
    run: (a, o) => {
      const p = bySlug.get(slugOf(a.slug));
      if (!p) return text(`صفحه‌ای با slug «${a.slug}» نیست. صفحه‌های موجود: ${pages.map((x) => x.slug).join(", ")}`, true);
      return text(`# ${p.title}\n\n${p.lead}\n\nمنبع: ${o}/${p.slug}\n\n${p.md}`);
    },
  },
  {
    name: "get_plugin_anatomy",
    description: "بخش‌های یک اپ/پلاگین دیدار به ترتیب ساخت (Developer Hub، نصب، اجرا، داده، اکستنشن‌ها)، قواعد کلیدی هرکدام و صفحه‌ی مرجع.",
    inputSchema: { type: "object", properties: {} },
    run: (_a, o) => json({ summary: bySlug.get("how-it-works").lead, parts: ANATOMY.map((p) => ({ ...p, url: `${o}/${p.page}` })), docs: `${o}/how-it-works` }),
  },
  {
    name: "get_api_spec",
    description:
      "مشخصات دقیق endpointهای مارکت‌پلیس (تکمیل نصب، دریافت Runtime Token و APIهای پروکسی داده‌ی دیدار): مسیر، احراز هویت، scope، شرط Runtime Context، همه‌ی پارامترها (نام، محل، نوع، الزام)، نمونه درخواست و پاسخ. بدنه‌ی پروکسی دقیقاً همان بدنه‌ی OpenAPI دیدار است. با id، یا method+path، یا عبارت جستجو؛ بدون ورودی فهرست endpointها را می‌دهد.",
    inputSchema: { type: "object", properties: { id: { type: "string", description: "مثل deal-update" }, method: { type: "string" }, path: { type: "string", description: "مثل /api/v1/deals/{dealId} یا با شناسه‌ی واقعی" }, query: { type: "string", description: "عبارت آزاد، مثل «ویرایش معامله»" } } },
    run: (a, o) => {
      if (!a.id && !a.path && !a.query) {
        return json(endpoints.map((e) => ({ id: e.id, method: e.method, path: e.path, title: e.title, summary: e.summary, scope: e.scope, url: `${o}/${e.page}#${e.id}` })));
      }
      const norm = (p) => String(p).split("?")[0].replace(/\/+$/, "").replace(/\/\{[^}]+\}/g, "/{}").toLowerCase();
      let hit = null;
      if (a.id) hit = endpoints.find((e) => e.id === a.id);
      if (!hit && a.path) {
        const want = norm(a.path);
        const wantParts = want.split("/");
        hit = endpoints.find((e) => {
          if (a.method && e.method !== String(a.method).toUpperCase()) return false;
          const have = norm(e.path).split("/");
          return have.length === wantParts.length && have.every((seg, i) => seg === "{}" || seg === wantParts[i]);
        });
      }
      if (!hit && a.query) {
        const q = a.query.toLowerCase();
        hit = endpoints.find((e) => [e.id, e.title, e.path, e.summary].some((s) => String(s || "").toLowerCase().includes(q)));
      }
      if (!hit) return text("endpointی پیدا نشد. get_api_spec را بدون ورودی صدا بزن تا فهرست کامل را ببینی.", true);
      const params = hit.params.map((p) => ({ name: p.name, in: p.in, type: p.type, required: !!p.required, description: p.description, ...(p.sections?.length ? { details: p.sections } : {}) }));
      return json({
        id: hit.id, title: hit.title, method: hit.method, path: hit.path, url: (hit.baseUrl || spec.baseUrl) + hit.path,
        summary: hit.summary, didarDescription: hit.didarDoc ? { heading: hit.didarDoc.heading, intro: hit.didarDoc.intro, rules: hit.didarDoc.rules, source: hit.didarDoc.source } : null, scope: hit.scope, runtimeContext: hit.context ?? null, didarApiEquivalent: hit.didar ?? null,
        auth: hit.auth === "client" ? "بدون Bearer؛ ClientId و ClientSecret اپ در بدنه (فقط backend)" : "Authorization: Bearer <Runtime Token>",
        bodyNote: hit.bodyNote ?? null, params,
        ...(hit.responseFields ? { responseFields: hit.responseFields } : {}), ...(hit.notes?.length ? { notes: hit.notes } : {}), ...(hit.errors ? { errors: hit.errors } : {}),
        exampleRequest: hit.request, exampleResponse: hit.response, docs: `${o}/${hit.page}#${hit.id}`,
      });
    },
  },
  {
    name: "list_scopes",
    description: "فهرست scopeهای اپ و دسترسی هرکدام.",
    inputSchema: { type: "object", properties: {} },
    run: (_a, o) => json({ scopes: spec.platform.scopes.map((s) => ({ ...s, docs: s.pages.map((p) => `${o}/${p}`) })), note: "فقط scopeهایی را درخواست کن که اپ واقعاً لازم دارد." }),
  },
  {
    name: "list_extensions",
    description: "نوع محتوا، surface و locationهای اکستنشن، و انواع صفحه‌ی تنظیمات.",
    inputSchema: { type: "object", properties: {} },
    run: (_a, o) => json({ developerHubTypes: spec.platform.developerHubExtensionTypes, capacity: spec.platform.extensionCapacity, contentTypes: spec.platform.extensionContentTypes, surfaceTypes: spec.platform.extensionSurfaceTypes, locations: spec.platform.extensionLocations, settingsPageTypes: spec.platform.settingsPageTypes, runtimeContextFields: spec.platform.runtimeContextFields, docs: [`${o}/extensions`, `${o}/settings-page`, `${o}/launch`] }),
  },
  {
    name: "list_error_codes",
    description: "HTTP statusها و کدهای خطای مارکت‌پلیس همراه رفتار پیشنهادی.",
    inputSchema: { type: "object", properties: {} },
    run: (_a, o) => json({ httpStatuses: spec.platform.httpStatuses, errorCodes: spec.platform.errorCodes, docs: `${o}/errors` }),
  },
  {
    name: "scaffold_plugin",
    description:
      "اسکلت backend یک اپ دیدار (Node.js / Express) را برمی‌گرداند: callback نصب با state، CompleteInstallation، endpoint launch، تبادل launchCode با Runtime Token، کلاینت API پروکسی و CORS. خروجی لیست فایل‌هاست؛ آن‌ها را در پروژه بنویس.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "نام پروژه، مثل meet-plugin" },
        scopes: { type: "array", items: { type: "string" }, description: "scopeهای لازم؛ از list_scopes" },
        extension: { type: "string", enum: ["json", "iframe", "link", "settings"], default: "json" },
      },
      required: ["name"],
    },
    run: (a, o) => json(scaffoldPlugin(a, o)),
  },
  {
    name: "validate_plugin",
    description:
      "تنظیمات یک اپ را در برابر قواعد داک چک می‌کند (HTTPS، scopeها، location و نوع اکستنشن، CORS، نگهداری secret). ورودی config یک شیء JSON است؛ فیلدهای ناشناخته نادیده گرفته می‌شوند.",
    inputSchema: {
      type: "object",
      properties: {
        config: {
          type: "object",
          description: "callbackUrl, installationUrl, scopes[], extensions[{contentType, surfaceType, location, endpointUrl, corsAllowOrigin}], settingsPage{type,url}, usesStateParam, secretInFrontend, tokenInLocalStorage, logsSecrets, reusesRuntimeToken, trustsClientEntityIds",
        },
      },
      required: ["config"],
    },
    run: (a, o) => json(validatePlugin(a.config || {}, o)),
  },
];

const PROMPTS = [
  {
    name: "build_plugin",
    description: "یک اپ دیدار را از روی یک ایده بساز، با استفاده از ابزارهای این MCP.",
    arguments: [{ name: "idea", description: "اپ چه کاری برای کدام داده‌ی دیدار و کجای UI انجام بدهد", required: true }],
    render: (args) =>
      `می‌خواهم این اپ را برای مارکت‌پلیس دیدار بسازم: ${args.idea || "[idea]"}\n\n` +
      `۱) get_plugin_anatomy را بخوان. ۲) با list_scopes / list_extensions کمترین scope و location درست را انتخاب کن. ` +
      `۳) مشخصات endpointهای لازم را فقط با get_api_spec بگیر (بدون حدس). ۴) با scaffold_plugin اسکلت را بساز و منطق را اضافه کن. ` +
      `۵) پیش از تحویل config را با validate_plugin چک کن. هر مقدار نامعلوم را با [کروشه] مشخص کن و لینک صفحه‌ی مرجع را بیاور.`,
  },
];

const INSTRUCTIONS =
  "این سرور مستندات فنی رسمی مارکت‌پلیس دیدار را در اختیار می‌گذارد. فقط از خروجی ابزارها جواب بده و endpoint، فیلد یا scope حدسی ننویس؛ " +
  "مقدار نامعلوم را با [کروشه] نشان بده و لینک صفحه‌ی مرجع را در جواب بیاور. برای ساخت اپ: get_plugin_anatomy ← get_api_spec ← scaffold_plugin ← validate_plugin.";

const err = (id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
const ok = (id, result) => ({ jsonrpc: "2.0", id, result });

function handle(msg, origin) {
  const { id, method, params = {} } = msg;
  const isNotification = id === undefined || id === null;
  switch (method) {
    case "initialize": {
      const v = SUPPORTED.includes(params.protocolVersion) ? params.protocolVersion : SUPPORTED[0];
      return ok(id, {
        protocolVersion: v,
        capabilities: { tools: { listChanged: false }, resources: { listChanged: false, subscribe: false }, prompts: { listChanged: false } },
        serverInfo: { name: "didar-developers-docs", title: "Didar Developers Docs", version: meta.shortCommit },
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) return err(id, -32602, `Unknown tool: ${params.name}`);
      try {
        return ok(id, tool.run(params.arguments || {}, origin));
      } catch (e) {
        return ok(id, text(`خطا در اجرای ابزار: ${e.message}`, true));
      }
    }
    case "resources/list":
      return ok(id, {
        resources: [
          ...pages.map((p) => ({ uri: `didar-docs://${p.slug}`, name: p.slug, title: p.title, description: p.lead, mimeType: "text/markdown" })),
          { uri: "didar-docs://llms.txt", name: "llms.txt", title: "llms.txt", description: "فهرست داک برای ایجنت‌ها", mimeType: "text/plain" },
        ],
      });
    case "resources/read": {
      const slug = String(params.uri || "").replace(/^didar-docs:\/\//, "");
      if (slug === "llms.txt") return ok(id, { contents: [{ uri: params.uri, mimeType: "text/plain", text: llmsTxt(origin) }] });
      const p = bySlug.get(slug);
      if (!p) return err(id, -32002, `Resource not found: ${params.uri}`);
      return ok(id, { contents: [{ uri: params.uri, mimeType: "text/markdown", text: `# ${p.title}\n\n${p.lead}\n\n${p.md}` }] });
    }
    case "prompts/list":
      return ok(id, { prompts: PROMPTS.map(({ name, description, arguments: args }) => ({ name, description, arguments: args })) });
    case "prompts/get": {
      const pr = PROMPTS.find((x) => x.name === params.name);
      if (!pr) return err(id, -32602, `Unknown prompt: ${params.name}`);
      return ok(id, { description: pr.description, messages: [{ role: "user", content: { type: "text", text: pr.render(params.arguments || {}) } }] });
    }
    default:
      if (isNotification) return null;
      return err(id, -32601, `Method not found: ${method}`);
  }
}

export function llmsTxt(origin) {
  const line = (p) => `- [${p.title}](${origin}/${p.slug}.md): ${p.lead}`;
  return (
    `# Didar Developers\n\n> مستندات توسعه‌دهنده‌ی مارکت‌پلیس دیدار: ساخت، نصب و اجرای اپ Third-party، APIهای پروکسی و MCP دیدار.\n\n` +
    `MCP: ${origin}/mcp (Streamable HTTP، بدون احراز هویت)\nنسخه‌ی کامل در یک فایل: ${origin}/llms-full.txt\n\n` +
    `## شروع\n${pages.filter((p) => p.section === "start").map(line).join("\n")}\n\n` +
    `## مرجع\n${pages.filter((p) => p.section === "reference").map(line).join("\n")}\n`
  );
}

export function llmsFull(origin) {
  return pages.map((p) => `# ${p.title}\n\nمنبع: ${origin}/${p.slug}\n\n${p.lead}\n\n${p.md}`).join("\n\n---\n\n");
}

/** درخواست HTTP به /mcp را پردازش می‌کند. */
export async function handleMcpRequest(request, origin) {
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, GET, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept, mcp-session-id, mcp-protocol-version, last-event-id",
    "access-control-expose-headers": "mcp-session-id",
    "cache-control": "no-store",
  };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  // stateless: بدون SSE و بدون session
  if (request.method === "GET" || request.method === "DELETE") {
    return new Response(JSON.stringify({ name: "didar-developers-docs", transport: "streamable-http", usage: "POST JSON-RPC 2.0 to this URL", docs: `${origin}/build-with-mcp` }), {
      status: 405,
      headers: { ...cors, allow: "POST, OPTIONS", "content-type": "application/json; charset=utf-8" },
    });
  }
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { ...cors, allow: "POST, OPTIONS" } });

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify(err(null, -32700, "Parse error")), { status: 400, headers: { ...cors, "content-type": "application/json" } });
  }
  const batch = Array.isArray(body);
  const msgs = batch ? body : [body];
  const out = [];
  for (const m of msgs) {
    if (!m || m.jsonrpc !== "2.0" || typeof m.method !== "string") {
      if (m && (m.result !== undefined || m.error !== undefined)) continue; // پاسخ کلاینت، نادیده
      out.push(err(m?.id, -32600, "Invalid Request"));
      continue;
    }
    const r = handle(m, origin);
    if (r) out.push(r);
  }
  if (!out.length) return new Response(null, { status: 202, headers: cors });
  return new Response(JSON.stringify(batch ? out : out[0]), { status: 200, headers: { ...cors, "content-type": "application/json; charset=utf-8" } });
}

export { TOOLS, handle };
