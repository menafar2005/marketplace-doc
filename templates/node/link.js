// link.js: اکستنشن Links. این آدرس را در فیلد URL اکستنشن ثبت کن.
// دیدار صفحه را با ?launchCode= باز می‌کند؛ در صفحه‌های لیست، entityIds چند شناسه دارد.
import express from "express";
import { exchangeLaunchCode, didarApi, escapeHtml } from "./didar.js";

export const link = express.Router();

link.get("/didar/invoice", async (req, res) => {
  const run = await exchangeLaunchCode(req.query.launchCode);
  if (!run) return res.status(401).type("text/plain").send("این لینک منقضی شده؛ دوباره از دیدار باز کن.");
  const { accessToken, context } = run;
  if (context.entityType !== "deal") return res.status(400).type("text/plain").send("فقط برای معامله.");

  // همه‌ی رکوردهای انتخاب‌شده، فقط از context
  const deals = await Promise.all(context.entityIds.map((id) => didarApi(accessToken, "GET", `/api/v1/deals/${id}`)));

  // token را به مرورگر نفرست. اگر کاربر در این صفحه کار بیشتری می‌کند، session کوتاه خودت را بساز.
  res.send(`<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>پیش‌فاکتور</title>
<h1>پیش‌فاکتور برای ${deals.length} معامله</h1>
<ul>${deals.map((d) => `<li>${escapeHtml(d.Title)}: ${escapeHtml(d.Price)}</li>`).join("")}</ul></html>`);
});
