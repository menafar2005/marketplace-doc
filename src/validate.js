// چک تنظیمات اپ در برابر قواعد داک (ابزار MCP «validate_plugin»).
import { spec } from "./generated/content.js";

const SCOPES = new Map(spec.platform.scopes.map((s) => [s.name, s]));
const LOCATIONS = new Map(spec.platform.extensionLocations.map((l) => [l.value, l]));
const CONTENT = new Map(spec.platform.extensionContentTypes.flatMap((c) => [[c.value, c], [c.name.toLowerCase(), c]]));
const SURFACE = new Map(spec.platform.extensionSurfaceTypes.flatMap((c) => [[c.value, c], [c.name.toLowerCase(), c]]));

const isHttps = (u) => {
  try {
    return new URL(u).protocol === "https:";
  } catch {
    return false;
  }
};

export function validatePlugin(cfg, origin) {
  const errors = [];
  const warnings = [];
  const err = (rule, message, page) => errors.push({ rule, message, docs: `${origin}/${page}` });
  const warn = (rule, message, page) => warnings.push({ rule, message, docs: `${origin}/${page}` });

  // ۱–۲: ثبت و نصب
  for (const key of ["callbackUrl", "installationUrl"]) {
    if (cfg[key] != null && !isHttps(cfg[key])) err(`${key}-https`, `${key} باید HTTPS معتبر باشد.`, "registering-an-app");
  }
  if (cfg.callbackUrl == null) warn("callbackUrl-missing", "callbackUrl داده نشده؛ بدون آن نصب کامل نمی‌شود.", "installation-authorization");
  if (cfg.usesStateParam === false) err("state", "state یک‌بارمصرف باید ساخته و در callback تطبیق داده شود.", "installation-authorization");

  // scopeها
  const scopes = Array.isArray(cfg.scopes) ? cfg.scopes : [];
  if (!scopes.length) warn("scopes-empty", "هیچ scopeی تعریف نشده؛ فقط scopeهای لازم را درخواست کن.", "scopes");
  for (const s of scopes) if (!SCOPES.has(s)) err("scope-unknown", `scope ناشناخته: «${s}». فهرست معتبر: ${[...SCOPES.keys()].join(", ")}`, "scopes");
  for (const s of scopes) {
    if (s.endsWith(".fullaccess")) {
      warn("scope-fullaccess", `«${s}» نوشتن هم می‌دهد؛ اگر اپ فقط می‌خواند، «${s.replace(".fullaccess", "")}» کافی است.`, "scopes");
    }
  }

  // ۴: اکستنشن‌ها
  for (const [i, ex] of (Array.isArray(cfg.extensions) ? cfg.extensions : []).entries()) {
    const at = `extensions[${i}]`;
    const ct = CONTENT.get(typeof ex.contentType === "string" ? ex.contentType.toLowerCase() : ex.contentType);
    if (!ct) err("contentType", `${at}.contentType باید IFrame/Link/Json (1/2/3) باشد.`, "app-extensions");
    if (ex.surfaceType != null && !SURFACE.get(typeof ex.surfaceType === "string" ? ex.surfaceType.toLowerCase() : ex.surfaceType)) {
      err("surfaceType", `${at}.surfaceType باید Modal/Sidebar/ActionLink (1/2/3) باشد.`, "app-extensions");
    }
    const loc = LOCATIONS.get(ex.location);
    if (!loc) err("location", `${at}.location باید عددی بین 1 تا 8 باشد.`, "app-extensions");
    if (loc && ex.entityType && ex.entityType !== loc.entityType) {
      err("entityType", `${at}: location ${ex.location} (${loc.name}) با entityType «${loc.entityType}» می‌آید، نه «${ex.entityType}».`, "app-extensions");
    }
    if (!ex.endpointUrl || !isHttps(ex.endpointUrl)) err("endpoint-https", `${at}.endpointUrl باید HTTPS معتبر باشد.`, "app-extensions");
    if (ct?.name === "Json") {
      if (ex.corsAllowOrigin === "*") err("cors-wildcard", `${at}: CORS با wildcard ممنوع است؛ origin دقیق https://app.didar.me.`, "app-extensions");
      else if (!ex.corsAllowOrigin) warn("cors-missing", `${at}: برای JSON extension CORS باید origin دقیق دیدار را مجاز کند.`, "app-extensions");
    }
  }

  // تنظیمات
  if (cfg.settingsPage) {
    if (![1, 2, "ExternalLink", "CustomUI"].includes(cfg.settingsPage.type)) err("settings-type", "settingsPage.type باید ExternalLink (1) یا CustomUI (2) باشد.", "app-settings");
    if (!isHttps(cfg.settingsPage.url)) err("settings-https", "settingsPage.url باید HTTPS باشد.", "app-settings");
  }

  // ۵: امنیت سرور
  if (cfg.secretInFrontend) err("secret-frontend", "ClientSecret/ApiKey/Runtime Token نباید در frontend باشند.", "security");
  if (cfg.tokenInLocalStorage) err("token-storage", "Runtime Token را در localStorage نگذار؛ فقط تا پایان همان اجرا در حافظه.", "app-settings");
  if (cfg.logsSecrets) err("log-secrets", "secret، launch code و JWT نباید log یا analytics شوند.", "security");
  if (cfg.reusesRuntimeToken) err("token-reuse", "Runtime Token برای همان اجرا ساخته می‌شود؛ reuse نکن.", "runtime-token");
  if (cfg.trustsClientEntityIds) err("entity-trust", "شناسه‌ی entity را فقط از context.entityIds بخوان، نه از query/frontend.", "runtime-token");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checkedAgainst: ["registering-an-app", "installation-authorization", "runtime-token", "app-extensions", "app-settings", "scopes", "security"].map((p) => `${origin}/${p}`),
    note: "این چک فقط قواعد منتشرشده در داک را می‌سنجد؛ جایگزین تست روی BizDomain آزمایشی نیست.",
  };
}
