// settings.js: صفحه‌ی تنظیمات پلاگین (App settings از نوع Custom UI). این آدرس را در Iframe URL ثبت کن.
// تنظیمات با شناسه‌ی BizDomain ذخیره می‌شوند که از API گرفته می‌شود، نه از query.
import express from "express";
import { randomBytes } from "node:crypto";
import { exchangeLaunchCode, didarApi, escapeHtml } from "./didar.js";
import { loadSettings, saveSettings } from "./store.js";

export const settings = express.Router();
const sessions = new Map(); // sessionId → { bizDomainId, csrf, expiresAt }

settings.get("/didar/settings", async (req, res) => {
  const run = await exchangeLaunchCode(req.query.launchCode);
  if (!run || run.context.target !== "settings_page") return res.status(401).type("text/plain").send("دوباره از دیدار باز کن.");

  // tenant را از خود دیدار بپرس (scope اطلاعات پایه همیشه فعال است)
  const biz = await didarApi(run.accessToken, "GET", "/api/v1/proxy/biz-domain/info");
  const sessionId = randomBytes(24).toString("base64url");
  const csrf = randomBytes(24).toString("base64url");
  sessions.set(sessionId, { bizDomainId: biz.Id, csrf, expiresAt: Date.now() + 15 * 60 * 1000 });
  res.cookie("didar_settings", sessionId, { httpOnly: true, secure: true, sameSite: "none", maxAge: 15 * 60 * 1000 });

  const current = await loadSettings(biz.Id);
  res.send(`<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">
<h1>تنظیمات برای ${escapeHtml(biz.Title)}</h1>
<form method="post" action="/didar/settings">
<input type="hidden" name="csrf" value="${csrf}">
<label>کلید API سرویس جلسه <input name="meetingApiKey" value="${escapeHtml(current.meetingApiKey)}"></label>
<button>ذخیره</button></form></html>`);
});

settings.post("/didar/settings", express.urlencoded({ extended: false }), async (req, res) => {
  const id = req.headers.cookie?.match(/(?:^|;\s*)didar_settings=([\w-]+)/)?.[1];
  const s = id && sessions.get(id);
  if (!s || s.expiresAt < Date.now() || req.body.csrf !== s.csrf) return res.status(403).type("text/plain").send("دوباره از دیدار باز کن.");
  await saveSettings(s.bizDomainId, { meetingApiKey: String(req.body.meetingApiKey ?? "").slice(0, 200) });
  res.type("text/plain").send("ذخیره شد.");
});
