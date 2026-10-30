// json-modal.js: endpoint اکستنشن JSON modal. این آدرس را در فیلد API endpoint ثبت کن.
// فرم form.json یک جزء textarea با key = "noteText" دارد؛ مقدارش در context.payload.noteText می‌رسد.
import express from "express";
import { exchangeLaunchCode, didarApi, DidarError, DIDAR_ORIGIN } from "./didar.js";

export const jsonModal = express.Router();
const ENDPOINT = "/didar/note-form";

// submit فرم با fetch مرورگر از داخل دیدار می‌آید، پس CORS فقط برای origin دقیق دیدار
function allowDidar(res) {
  res.set({
    "Access-Control-Allow-Origin": DIDAR_ORIGIN,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}
const reply = (res, succeeded, message, data) => res.json(data ? { succeeded, message, data } : { succeeded, message });

jsonModal.options(ENDPOINT, (req, res) => {
  allowDidar(res);
  res.sendStatus(204);
});

jsonModal.get(ENDPOINT, async (req, res) => {
  allowDidar(res);
  const run = await exchangeLaunchCode(req.query.launchCode);
  if (!run) return reply(res, false, "این اجرا معتبر نیست؛ فرم را دوباره باز کن.");
  const { accessToken, context } = run;
  if (context.entityType !== "deal") return reply(res, false, "این فرم فقط روی معامله کار می‌کند.");

  // payload ورودی کاربر است: الزامی بودن، نوع و طول را دوباره چک کن
  const noteText = typeof context.payload?.noteText === "string" ? context.payload.noteText.trim() : "";
  if (!noteText || noteText.length > 2000) return reply(res, false, "متن یادداشت باید بین ۱ تا ۲۰۰۰ کاراکتر باشد.");

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
    return reply(res, false, "ثبت یادداشت ناموفق بود.");
  }
  reply(res, true, `یادداشت روی ${context.entityIds.length} معامله ثبت شد.`, { count: context.entityIds.length });
});
