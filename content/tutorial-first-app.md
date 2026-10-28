---
title: آموزش ساخت اولین اپ
section: start
order: 40
lead: در این آموزش یک اپ کامل می‌سازی؛ در صفحه‌ی جزئیات معامله گزینه‌ی «ایجاد جلسه» اضافه می‌شود، کاربر یک فرم کوتاه پر می‌کند و اپ لینک جلسه را به‌عنوان یادداشت روی همان معامله ثبت می‌کند.
description: آموزش قدم‌به‌قدم ساخت اولین اپ مارکت‌پلیس دیدار با Node.js؛ ثبت در Developer Hub، Callback نصب، JSON modal، تبدیل launchCode و ثبت یادداشت.
---

## چه چیزی لازم داری {#prerequisites}

- حساب ادمین یک BizDomain در دیدار ([محیط تست](/test-environment))
- Node.js و یک سرور با آدرس عمومی HTTPS (برای توسعه‌ی محلی، یک tunnel)
- آشنایی با [مفاهیم مارکت‌پلیس](/about-the-marketplace#how-it-works)

## قدم ۱: اپ را در Developer Hub ثبت کن {#step-1}

1. به `https://app.didar.me/developerhub` برو و **Create an app** را بزن.
2. **App name**: `Meet` · **Callback URL**: `https://YOUR_HOST/didar/callback` · Save.
3. در تب **OAuth & access scopes**، **Deals** را با Read only و **Activities** را با Full access روشن کن.
4. **Client ID** و **Client secret** را کپی کن.
5. در تب **App extensions**، یک **JSON modal** اضافه کن:
   - Action name: `ایجاد جلسه`
   - API endpoint: `https://YOUR_HOST/didar/launch`
   - JWT secret: یک رشته‌ی تصادفی طولانی
   - JSON schema: فایل `form.json` ([نمونه](/json-modals#schema))
   - Locations: `Deal details`
6. Save اصلی صفحه را بزن.

جزئیات همه‌ی فیلدها: [ثبت اپ](/registering-an-app).

## قدم ۲: پروژه را آماده کن {#step-2}

```text title="meet-app/"
server.js        # routes: /didar/callback and /didar/launch
form.json        # JSON modal schema (uploaded in Developer Hub)
.env             # DIDAR_CLIENT_ID, DIDAR_CLIENT_SECRET (never in git)
```

```bash title=".env"
DIDAR_CLIENT_ID=YOUR_CLIENT_ID
DIDAR_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

## قدم ۳: Callback نصب را بنویس {#step-3}

```js title="server.js: callback"
import express from "express";
const app = express();
const installations = new Map(); // در محیط واقعی: دیتابیس

app.get("/didar/callback", async (req, res) => {
  const r = await fetch("https://app.didar.me/api/MarketplaceInstall/CompleteInstallation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Code: req.query.code,
      ClientId: process.env.DIDAR_CLIENT_ID,
      ClientSecret: process.env.DIDAR_CLIENT_SECRET,
    }),
  });
  const result = (await r.json()).Response;
  if (!r.ok || !result?.Succeeded) return res.status(502).send("نصب ناموفق بود.");

  const { BizDomainId, InstallationId, Scopes } = result.Data;
  installations.set(BizDomainId, { InstallationId, Scopes }); // ApiKey را فقط رمزگذاری‌شده ذخیره کن
  res.send("نصب کامل شد. می‌توانی به دیدار برگردی.");
});
```

[تکمیل نصب، قدم‌به‌قدم](/installation-authorization)

## قدم ۴: endpoint اکستنشن را بنویس {#step-4}

```js title="server.js: launch"
const ORIGIN = "https://app.didar.me";

app.options("/didar/launch", (req, res) => cors(res).sendStatus(204));

app.get("/didar/launch", async (req, res) => {
  cors(res);

  // ۱. launchCode ← Runtime Token
  const t = await fetch("https://marketplace.didar.me/api/v1/runtime/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      launchCode: req.query.launchCode,
      clientId: process.env.DIDAR_CLIENT_ID,
      clientSecret: process.env.DIDAR_CLIENT_SECRET,
    }),
  }).then((r) => r.json());
  if (!t.succeeded) return res.json({ succeeded: false, message: "اجرا معتبر نیست؛ دوباره امتحان کن." });
  const { accessToken, context } = t.data;

  // ۲. فقط به context اعتماد کن
  if (context.entityType !== "deal") return res.json({ succeeded: false, message: "فقط روی معامله." });
  const dealId = context.entityIds[0];
  const { inviterEmail } = context.payload;
  if (!inviterEmail || inviterEmail.length > 320) {
    return res.json({ succeeded: false, message: "ایمیل دعوت‌کننده معتبر نیست." });
  }

  // ۳. کار اصلی اپ
  const meetingUrl = await createMeeting(inviterEmail);

  // ۴. ثبت یادداشت در دیدار
  const note = await fetch("https://marketplace.didar.me/api/v1/notes", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      Activity: {
        ActivityTypeId: "00000000-0000-0000-0000-000000000000",
        IsDone: true,
        DealId: dealId,
        ResultNote: `لینک جلسه: ${meetingUrl}`,
      },
    }),
  }).then((r) => r.json());
  if (!note.succeeded) return res.json({ succeeded: false, message: "ثبت یادداشت ناموفق بود." });

  // ۵. پیام به کاربر
  res.json({ succeeded: true, message: "جلسه ساخته شد.", data: { url: meetingUrl } });
});

function cors(res) {
  res.set({
    "Access-Control-Allow-Origin": ORIGIN,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  return res;
}

app.listen(3000);
```

- [Runtime Token، قدم‌به‌قدم](/runtime-token)
- [API ساخت یادداشت](/api-activities#note-create)
- [قرارداد پاسخ JSON modal](/api-app-endpoints#json-response)

## قدم ۵: نصب و تست کن {#step-5}

1. سرور را بالا بیاور.
2. در Developer Hub با **Share app** لینک نصب را بردار، در مرورگری که با حساب ادمین خودت وارد دیدار شده‌ای باز کن و نصب را تأیید کن. باید پیام «نصب کامل شد» را ببینی.
3. در دیدار یک معامله را باز کن، از منوی عملیات **ایجاد جلسه** را بزن، فرم را پر کن و ثبت کن.
4. پیام موفقیت را می‌بینی و یادداشت لینک جلسه روی معامله ثبت شده است.

[چک‌لیست کامل تست](/test-environment#checklist)

## قدم ۶: Live کن {#step-6}

وقتی همه‌چیز درست بود، **Change to live** را بزن و لینک نصب را به کسب‌وکارهای دیگر بده. [اشتراک اپ](/registering-an-app#share)

## بعد از این بخوان {#read-next}

- [چک‌لیست امنیت](/security)
- [مرور اکستنشن‌ها](/app-extensions)
- [درباره‌ی API](/api-concepts)
