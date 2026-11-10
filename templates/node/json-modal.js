// json-modal.js: endpoint اکستنشن JSON modal. این آدرس را در فیلد API endpoint ثبت کن.
// دیدار این endpoint را با POST و بدنه‌ی JSON صدا می‌زند: event برابر extension.load (باز شدن فرم، اگر loadOnOpen روشن باشد)
// یا extension.submit (ثبت فرم). فرم form.json یک جزء textarea با key = "noteText" دارد؛ مقدارش در values.noteText می‌رسد.
import express from "express";
import { exchangeLaunchCode, didarApi, DidarError, DIDAR_ORIGIN } from "./didar.js";

export const jsonModal = express.Router();
const ENDPOINT = "/didar/note-form";

// درخواست با fetch مرورگر از داخل دیدار می‌آید (POST با بدنه‌ی JSON)، پس CORS فقط برای origin دقیق دیدار
function allowDidar(res) {
  res.set({
    "Access-Control-Allow-Origin": DIDAR_ORIGIN,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}

jsonModal.options(ENDPOINT, (req, res) => {
  allowDidar(res);
  res.sendStatus(204);
});

jsonModal.post(ENDPOINT, express.json(), async (req, res) => {
  allowDidar(res);
  const { event, values } = req.body ?? {};

  // باز شدن فرم: مقدارهای اولیه‌ی فیلدها را با همان keyها برگردان
  if (event === "extension.load") return res.json({ ok: true, data: { values: { noteText: "" } } });
  if (event !== "extension.submit") return res.json({ ok: false, message: "درخواست ناشناخته است." });

  // values ورودی کاربر است: الزامی بودن، نوع و طول را دوباره چک کن؛ خطا کنار همان فیلد نمایش داده می‌شود
  const noteText = typeof values?.noteText === "string" ? values.noteText.trim() : "";
  if (!noteText || noteText.length > 2000) {
    return res.json({ ok: false, message: "بعضی از مقادیر معتبر نیستند.", errors: { noteText: "متن یادداشت باید بین ۱ تا ۲۰۰۰ کاراکتر باشد." } });
  }

  // رکوردها را فقط از Runtime Context بخوان، نه از context بدنه که مرورگر فرستاده
  const run = await exchangeLaunchCode(req.query.launchCode);
  if (!run) return res.json({ ok: false, message: "این اجرا معتبر نیست؛ فرم را دوباره باز کن." });
  const { accessToken, context } = run;
  if (context.entityType !== "deal") return res.json({ ok: false, message: "این فرم فقط روی معامله کار می‌کند." });

  // روی همه‌ی معامله‌های این اجرا (در لیست ممکن است چند معامله انتخاب شده باشد)
  try {
    for (const dealId of context.entityIds) {
      await didarApi(accessToken, "POST", "/api/v1/notes", {
        Activity: { ActivityTypeId: "00000000-0000-0000-0000-000000000000", IsDone: true, DealId: dealId, ResultNote: noteText },
      });
    }
  } catch (e) {
    if (!(e instanceof DidarError)) throw e;
    console.error("note create failed", e.status, e.code, e.traceId);
    return res.json({ ok: false, message: "ثبت یادداشت ناموفق بود." });
  }
  res.json({ ok: true, message: `یادداشت روی ${context.entityIds.length} معامله ثبت شد.`, close: true });
});
