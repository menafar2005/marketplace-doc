// اسکلت backend اپ دیدار برای ابزار MCP «scaffold_plugin».
// همه‌ی endpointها و قواعد از صفحه‌های همین داک آمده‌اند (installation-authorization، runtime-token، app-extensions، tutorial-first-app).
import { spec } from "./generated/content.js";

const KNOWN = new Set(spec.platform.scopes.map((s) => s.name));

const slug = (s) => String(s || "didar-app").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "didar-app";

export function scaffoldPlugin(args, origin) {
  const name = slug(args.name);
  const extension = ["json", "iframe", "link", "settings"].includes(args.extension) ? args.extension : "json";
  const scopes = (args.scopes || []).filter(Boolean);
  const unknown = scopes.filter((s) => !KNOWN.has(s));
  const notes = [
    "ClientSecret و ApiKey فقط در secret store / env سمت سرور؛ هرگز frontend یا log.",
    "ذخیره‌ی نصب (saveInstallation) را با دیتابیس خودت جایگزین کن؛ ApiKey را رمزگذاری‌شده نگه دار.",
    "state در حافظه نگه داشته می‌شود؛ برای چند instance از session/Redis استفاده کن.",
    "نحوه‌ی ارسال state به Installation URL (query param) را با فرمت Installation URL اپ خودت تطبیق بده.",
    `پیش از نصب، config را با validate_plugin چک کن. مرجع: ${origin}/installation-authorization و ${origin}/app-extensions`,
  ];
  if (unknown.length) notes.unshift(`scope ناشناخته: ${unknown.join(", ")} — list_scopes را ببین.`);

  const files = [
    {
      path: "package.json",
      content: JSON.stringify(
        { name, version: "0.1.0", private: true, type: "module", scripts: { start: "node server.js" }, dependencies: { express: "^4.21.2" } },
        null,
        2
      ) + "\n",
    },
    {
      path: ".env.example",
      content:
        `# ثبت اپ در Developer Hub این مقادیر را می‌دهد\nDIDAR_CLIENT_ID=\nDIDAR_CLIENT_SECRET=\nDIDAR_INSTALLATION_URL=\n\n# origin دقیق دیدار برای CORS (wildcard ممنوع)\nALLOWED_ORIGINS=https://app.didar.me\nPORT=3000\n`,
    },
    { path: ".gitignore", content: "node_modules\n.env\n" },
    {
      path: "lib/didar.js",
      content: `// کلاینت مارکت‌پلیس دیدار. secret و token هرگز log نمی‌شوند.
const MARKETPLACE = "https://marketplace.didar.me";
const APP = "https://app.didar.me";

export async function completeInstallation(code) {
  const res = await fetch(\`\${APP}/api/MarketplaceInstall/CompleteInstallation\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // casing دقیقاً PascalCase
    body: JSON.stringify({ Code: code, ClientId: process.env.DIDAR_CLIENT_ID, ClientSecret: process.env.DIDAR_CLIENT_SECRET }),
  });
  const body = await res.json();
  if (!res.ok || !body.Response?.Succeeded) throw Object.assign(new Error("CompleteInstallation failed"), { status: res.status, body });
  return body.Response.Data; // InstallationId, AppPublicId, BizDomainId, ApiKey, Scopes, InstalledAt
}

/** launchCode یک‌بارمصرف را با Runtime Token و context عوض می‌کند. */
export async function exchangeLaunchCode(launchCode) {
  const res = await fetch(\`\${MARKETPLACE}/api/v1/runtime/token\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ launchCode, clientId: process.env.DIDAR_CLIENT_ID, clientSecret: process.env.DIDAR_CLIENT_SECRET }),
  });
  const body = await res.json();
  if (!res.ok || !body.succeeded) throw Object.assign(new Error(body.error?.code || "TOKEN_EXCHANGE_FAILED"), { status: res.status, body });
  return body.data; // { accessToken, expiresInSeconds, context }
}

/** فراخوانی API پروکسی. بدنه دقیقاً مثل OpenAPI دیدار است. */
export async function proxy(accessToken, method, path, body) {
  const res = await fetch(\`\${MARKETPLACE}\${path}\`, {
    method,
    headers: { Authorization: \`Bearer \${accessToken}\`, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const out = await res.json();
  if (!res.ok || !out.succeeded) throw Object.assign(new Error(out.error?.code || "PROXY_FAILED"), { status: res.status, traceId: out.meta?.traceId });
  return out.data.Response;
}
`,
    },
    {
      path: "server.js",
      content: serverJs(extension),
    },
    {
      path: "README.md",
      content: `# ${name}\n\nاسکلت اپ دیدار (${extension}).\n\n1. \`cp .env.example .env\` و مقادیر را پر کن\n2. \`npm install && npm start\`\n3. callback نصب: \`/install/callback\`، launch: \`/api/launch\` (هر دو باید HTTPS عمومی باشند)\n\nscopeهای درخواستی: ${scopes.length ? scopes.join(", ") : "[scope]"}\n`,
    },
  ];
  return { name, extension, scopes, files, notes, docs: [`${origin}/registering-an-app`, `${origin}/installation-authorization`, `${origin}/runtime-token`, `${origin}/app-extensions`, `${origin}/tutorial-first-app`] };
}

function serverJs(extension) {
  const launch = {
    json: `    // JSON extension: خروجی باید { succeeded, message, data } باشد (toast دیدار)
    const { context, accessToken } = await exchangeLaunchCode(req.query.launchCode);
    if (context.target !== "extension") return res.status(400).json({ succeeded: false, message: "target نامعتبر" });
    const payload = context.payload ?? {}; // untrusted: دوباره validate کن
    const dealId = context.entityIds?.[0]; // فقط از context، نه از query
    // نمونه: const deal = await proxy(accessToken, "GET", \`/api/v1/deals/\${dealId}\`);
    res.json({ succeeded: true, message: "انجام شد.", data: { dealId, received: Object.keys(payload) } });`,
    iframe: `    const { context } = await exchangeLaunchCode(req.query.launchCode);
    if (context.target !== "extension") return res.status(400).send("bad target");
    // پس از exchange یک session کوتاه برای UI خودت بساز؛ Runtime Token را در localStorage نگذار
    res.type("html").send("<!doctype html><meta charset=utf-8><h1>اپ شما</h1>");`,
    link: `    const { context } = await exchangeLaunchCode(req.query.launchCode);
    if (context.target !== "extension") return res.status(400).send("bad target");
    res.type("html").send("<!doctype html><meta charset=utf-8><h1>اپ شما</h1>");`,
    settings: `    const { context } = await exchangeLaunchCode(req.query.launchCode);
    if (context.target !== "settings_page") return res.status(400).send("bad target");
    // تنظیمات را با installation/BizDomain ذخیره کن، نه با ایمیل؛ BizDomainId را از query نپذیر
    res.type("html").send("<!doctype html><meta charset=utf-8><h1>تنظیمات اپ</h1>");`,
  }[extension];
  return `import express from "express";
import crypto from "node:crypto";
import { completeInstallation, exchangeLaunchCode, proxy } from "./lib/didar.js"; // eslint-disable-line no-unused-vars

const app = express();
app.use(express.json());

const allowed = (process.env.ALLOWED_ORIGINS || "https://app.didar.me").split(",").map((s) => s.trim());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.set({ "Access-Control-Allow-Origin": origin, Vary: "Origin", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" });
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ---- ۲. نصب ----
const pendingStates = new Map(); // production: session store
app.get("/install/start", (_req, res) => {
  const state = crypto.randomBytes(24).toString("hex");
  pendingStates.set(state, Date.now());
  res.redirect(\`\${process.env.DIDAR_INSTALLATION_URL}\${process.env.DIDAR_INSTALLATION_URL.includes("?") ? "&" : "?"}state=\${state}\`);
});

app.get("/install/callback", async (req, res) => {
  const { code, state } = req.query;
  if (state && !pendingStates.delete(state)) return res.status(400).send("state نامعتبر");
  try {
    const install = await completeInstallation(code);
    await saveInstallation(install); // InstallationId, BizDomainId, Scopes, ApiKey(رمزگذاری‌شده)
    res.send("نصب کامل شد.");
  } catch (e) {
    console.error("install failed", e.status, e.body?.Response?.Error?.Code); // secret/code را log نکن
    res.status(502).send("نصب کامل نشد.");
  }
});

async function saveInstallation(_install) {
  // TODO: ذخیره با کلید BizDomainId؛ ApiKey فقط رمزگذاری‌شده
}

// ---- ۴/۵. اجرای اکستنشن ----
app.get("/api/launch", async (req, res) => {
  try {
${launch}
  } catch (e) {
    // 401/410: کاربر باید اکستنشن را دوباره اجرا کند؛ token قدیمی reuse نمی‌شود
    console.error("launch failed", e.status, e.message, e.traceId);
    res.status(e.status || 502).json({ succeeded: false, message: "اجرای اپ ناموفق بود." });
  }
});

app.listen(process.env.PORT || 3000);
`;
}
