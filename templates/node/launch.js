// launch.js: مسیر اجرا. دیدار هر بار که کاربر اکستنشن را باز می‌کند این آدرس را با ?launchCode= صدا می‌زند.
import express from "express";
import { exchangeLaunchCode, didarApi, DidarError } from "./didar.js";

export const launch = express.Router();

launch.get("/didar/launch", async (req, res) => {
  // ۱. launchCode ← Runtime Token + Runtime Context (فقط backend)
  const run = await exchangeLaunchCode(req.query.launchCode);
  if (!run) return res.status(401).type("text/plain").send("این اجرا معتبر نیست؛ اکستنشن را دوباره از دیدار باز کن.");
  const { accessToken, context } = run;

  // ۲. فقط به context اعتماد کن: کاربر کجاست و روی کدام رکوردها کار می‌کند
  if (context.entityType !== "deal" || context.entityIds.length === 0) {
    return res.status(400).type("text/plain").send("این اکستنشن فقط روی معامله کار می‌کند.");
  }

  // ۳. داده‌ی دیدار با همان token، فقط برای رکوردهای همین اجرا
  try {
    const deal = await didarApi(accessToken, "GET", `/api/v1/deals/${context.entityIds[0]}`);
    res.type("text/plain").send(`معامله: ${deal.Title}`);
  } catch (e) {
    if (!(e instanceof DidarError)) throw e;
    console.error("didar api failed", e.status, e.code, e.traceId);
    res.status(e.status === 403 ? 403 : 502).type("text/plain").send("دسترسی به این معامله ممکن نشد.");
  }
});
