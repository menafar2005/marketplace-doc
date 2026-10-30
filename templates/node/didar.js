// didar.js: کلاینت کوچک مارکت‌پلیس دیدار که بقیه‌ی تمپلیت‌ها از آن استفاده می‌کنند.
// متغیرهای محیطی: DIDAR_CLIENT_ID و DIDAR_CLIENT_SECRET (فقط روی سرور).
const { DIDAR_CLIENT_ID, DIDAR_CLIENT_SECRET } = process.env;
export const DIDAR_ORIGIN = "https://app.didar.me";
const MARKETPLACE = "https://marketplace.didar.me";

export class DidarError extends Error {
  constructor(status, code, traceId) {
    super(`Didar API ${status} ${code ?? ""}`.trim());
    this.status = status; // HTTP status
    this.code = code; // error.code، مثل PROXY_ACCESS_DENIED
    this.traceId = traceId; // برای پشتیبانی log کن
  }
}

const readJson = (r) => r.json().catch(() => null);

// launchCode → { accessToken, tokenType, expiresInSeconds, context }؛ در خطا null
export async function exchangeLaunchCode(launchCode) {
  if (!launchCode) return null;
  const r = await fetch(`${MARKETPLACE}/api/v1/runtime/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ launchCode, clientId: DIDAR_CLIENT_ID, clientSecret: DIDAR_CLIENT_SECRET }),
  });
  const body = await readJson(r);
  if (!r.ok || !body?.succeeded) {
    console.error("launch exchange failed", r.status, body?.error?.code, body?.meta?.traceId);
    return null;
  }
  return body.data;
}

// درخواست به API داده‌ی دیدار با Runtime Token؛ data.Response را برمی‌گرداند
export async function didarApi(accessToken, method, path, payload) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  if (payload === undefined) headers.Accept = "application/json";
  else headers["Content-Type"] = "application/json";
  const r = await fetch(MARKETPLACE + path, {
    method,
    headers,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const body = await readJson(r);
  if (!r.ok || !body?.succeeded) throw new DidarError(r.status, body?.error?.code, body?.meta?.traceId);
  return body.data?.Response;
}

export const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
