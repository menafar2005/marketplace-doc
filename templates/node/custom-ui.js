// custom-ui.js: صفحه‌ای که داخل iframe دیدار باز می‌شود (Custom panel یا Custom modal).
// این آدرس را در فیلد Iframe URL ثبت کن. صفحه یک دکمه دارد که روی همان معامله یادداشت ثبت می‌کند.
import express from "express";
import { randomBytes } from "node:crypto";
import { exchangeLaunchCode, didarApi, escapeHtml } from "./didar.js";

export const customUi = express.Router();

// session کوتاه همین اجرا، فقط سمت سرور. token هیچ‌وقت به مرورگر نمی‌رود.
const runs = new Map(); // sessionId → { accessToken, context, expiresAt }
const COOKIE = "didar_run";
const cookieOptions = { httpOnly: true, secure: true, sameSite: "none" }; // iframe روی origin دیگری است

function currentRun(req) {
  const id = req.headers.cookie?.match(/(?:^|;\s*)didar_run=([\w-]+)/)?.[1];
  const run = id && runs.get(id);
  if (!run || run.expiresAt < Date.now()) return null;
  return run;
}

customUi.get("/didar/panel", async (req, res) => {
  const run = await exchangeLaunchCode(req.query.launchCode);
  if (!run) return res.status(401).type("text/plain").send("این اجرا منقضی شده؛ صفحه‌ی دیدار را دوباره باز کن.");
  const { accessToken, context, expiresInSeconds } = run;
  if (context.entityType !== "deal") return res.status(400).type("text/plain").send("فقط برای معامله.");

  const sessionId = randomBytes(24).toString("base64url");
  runs.set(sessionId, { accessToken, context, expiresAt: Date.now() + expiresInSeconds * 1000 });
  res.cookie(COOKIE, sessionId, { ...cookieOptions, maxAge: expiresInSeconds * 1000 });

  const deal = await didarApi(accessToken, "GET", `/api/v1/deals/${context.entityIds[0]}`);
  res.send(`<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">
<style>body{font-family:sans-serif;margin:12px;color-scheme:light dark}</style>
<p><strong>${escapeHtml(deal.Title)}</strong></p>
<form method="post" action="/didar/panel/note"><textarea name="text" maxlength="2000" required></textarea>
<button>ثبت یادداشت</button></form></html>`);
});

customUi.post("/didar/panel/note", express.urlencoded({ extended: false }), async (req, res) => {
  const run = currentRun(req);
  if (!run) return res.status(401).type("text/plain").send("زمان این اجرا تمام شده؛ صفحه‌ی دیدار را دوباره باز کن.");
  const text = String(req.body.text ?? "").trim();
  if (!text || text.length > 2000) return res.status(400).type("text/plain").send("متن یادداشت معتبر نیست.");

  await didarApi(run.accessToken, "POST", "/api/v1/notes", {
    Activity: { ActivityTypeId: "00000000-0000-0000-0000-000000000000", IsDone: true, DealId: run.context.entityIds[0], ResultNote: text },
  });
  res.type("text/plain").send("یادداشت ثبت شد.");
});
