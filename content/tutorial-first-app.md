---
title: ساخت اولین پلاگین
section: start
order: 10
lead: در این راهنما یک پلاگین کامل و واقعی می‌سازی؛ در صفحه‌ی جزئیات معامله گزینه‌ی «ایجاد جلسه» اضافه می‌شود، کاربر یک فرم کوتاه پر می‌کند و پلاگین لینک جلسه را به‌عنوان یادداشت روی همان معامله ثبت می‌کند. هر قدم یکی از بخش‌های ساختار پلاگین را می‌سازد و توضیح می‌دهد چرا آن بخش لازم است.
description: راهنمای قدم‌به‌قدم ساخت اولین پلاگین مارکت‌پلیس دیدار با Node.js؛ ثبت در Developer Hub، مسیر نصب، مسیر اجرا و Runtime Token، ثبت یادداشت، JSON modal، نصب، تست و انتشار.
---

## چه چیزی می‌سازیم؟ {#what-we-build}

پلاگینی به اسم **Meet** می‌سازیم. کاربر در دیدار یک معامله را باز می‌کند، از منوی عملیات گزینه‌ی **ایجاد جلسه** را می‌زند و یک فرم کوتاه می‌بیند که ایمیل دعوت‌کننده و توضیح جلسه را می‌پرسد. با ثبت فرم، پلاگین یک جلسه می‌سازد و لینکش را به‌عنوان یادداشت روی همان معامله ذخیره می‌کند. کاربر در تمام این مدت داخل دیدار است.

این مثال را انتخاب کرده‌ایم چون با وجود سادگی، از همه‌ی بخش‌های یک پلاگین رد می‌شود: ثبت، نصب، اجرا، کار با داده و یک اکستنشن. هر قدم این راهنما دقیقاً یکی از بخش‌های [ساختار پلاگین](/plugin-anatomy) را می‌سازد و شماره‌ی قدم‌ها همان شماره‌های تصویر آن صفحه است:

| قدم | بخش پلاگین | چه می‌سازی |
| --- | --- | --- |
| [۱](#step-1) | شناسنامه | پلاگین را در Developer Hub ثبت می‌کنی و Client ID و secret می‌گیری. |
| [۲](#step-2) | مسیر نصب | سرور تو یاد می‌گیرد نصب را کامل کند. |
| [۳](#step-3) | مسیر اجرا | سرور تو یاد می‌گیرد هر اجرا را به Runtime Token تبدیل کند. |
| [۴](#step-4) | منطق و داده | پلاگین جلسه را می‌سازد و یادداشت را در دیدار ثبت می‌کند. |
| [۵](#step-5) | اکستنشن | فرم «ایجاد جلسه» را تعریف می‌کنی و به منوی معامله اضافه می‌کنی. |
| [۶](#step-6) | — | پلاگین را روی شرکت آزمایشی نصب و تست می‌کنی. |
| [۷](#step-7) | — | پلاگین را به BizDomain اصلی شرکتت می‌بری و آنجا نصب می‌کنی. |

کد این راهنما با Node.js و Express است، چون کوتاه و خوانا است. اگر با زبان دیگری کار می‌کنی، صفحه‌ی جزئیات هر قدم همان کد را به Python، PHP و C# هم دارد و همه از همان نام مسیرها و متغیرها استفاده می‌کنند.

## قبل از شروع {#prerequisites}

- **یک شرکت آزمایشی در دیدار بساز.** با حساب دیداری‌ات یک شرکت آزمایشی ۱۴روزه بساز؛ در آن مدیری و همه‌ی این راهنما را داخل همان انجام می‌دهی. وقتی پلاگین آماده شد، آن را به BizDomain اصلی شرکتت می‌بری. [محیط تست](/test-environment#create)
- **یک آدرس عمومی HTTPS داشته باش.** دیدار باید بتواند سرور تو را از اینترنت صدا بزند. اگر روی کامپیوتر خودت کار می‌کنی، سرور لوکال را پشت یک tunnel با HTTPS بگذار و آدرس آن را جای `YOUR_HOST` در این راهنما استفاده کن.
- **Node.js نسخه‌ی ۱۸ یا بالاتر** (برای `fetch` داخلی) و یک پوشه‌ی خالی برای پروژه:

```bash title="Terminal"
mkdir meet-plugin && cd meet-plugin
npm init -y && npm pkg set type=module
npm install express
```

اگر هنوز [ساختار پلاگین](/plugin-anatomy) و [مارکت‌پلیس چطور کار می‌کند](/about-the-marketplace) را نخوانده‌ای، پیشنهاد می‌کنیم اول آن دو را بخوانی؛ این راهنما فرض می‌کند تصویر کلی را داری.

## قدم ۱: پلاگین را در Developer Hub ثبت کن {#step-1}

اولین کار معرفی پلاگین به دیدار است. تا وقتی پلاگین ثبت نشده، دیدار نمی‌داند پلاگینی به اسم Meet وجود دارد، سرورش کجاست و چه دسترسی‌ای می‌خواهد.

داخل [شرکت آزمایشی](/test-environment#create) خودت به `https://app.didar.me/developerhub` برو. در صفحه‌ی **My apps** روی **Create an app** بزن و دو فیلد را پر کن:

- **App name**: `Meet`. این نامی است که ادمین هنگام نصب و کاربران داخل دیدار می‌بینند.
- **Callback URL**: `https://YOUR_HOST/didar/callback`. این آدرس مسیر نصبی است که در قدم ۲ می‌سازی. سرورت هنوز وجود ندارد و اشکالی ندارد؛ دیدار فعلاً فقط آدرس را ذخیره می‌کند و تا وقتی کسی پلاگین را نصب نکند صدایش نمی‌زند.

**Save** را بزن. پلاگین با وضعیت **Draft** ساخته می‌شود و صفحه‌ی ویرایشش باز می‌شود. حالا به تب **OAuth & access scopes** برو. اینجا مشخص می‌کنی پلاگین به چه داده‌هایی نیاز دارد:

- **Deals** را روشن کن و روی **Read only** بگذار؛ پلاگین با معامله‌ها کار می‌کند ولی چیزی در خود معامله تغییر نمی‌دهد.
- **Activities** را روشن کن و **Full access** را انتخاب کن؛ یادداشت در دیدار با مدل فعالیت ساخته می‌شود و ساختن آن دسترسی نوشتن می‌خواهد.

دسترسی **Access to basic information** همیشه روشن است و لازم نیست کاری با آن بکنی. هر چیزی بیشتر از این لازم نیست، و درخواست نکردنش مهم است: ادمین هنگام نصب همه‌ی دسترسی‌ها را با هم می‌پذیرد یا رد می‌کند.

پایین همین تب، **Client ID** و **Client secret** را می‌بینی. هر دو را کپی کن؛ سرور تو با این دو خودش را به دیدار معرفی می‌کند. Save اصلی صفحه را دوباره بزن تا scopeها ذخیره شوند.

> [!WARNING]
> Client secret رمز پلاگین توست. آن را فقط روی سرور نگه دار؛ هرگز در کد frontend، مخزن git یا log قرارش نده.

اکستنشن را هنوز اضافه نکن؛ آن را در قدم ۵ می‌سازی، وقتی سرور آماده است. جزئیات همه‌ی فیلدهای این فرم: [ثبت پلاگین](/registering-an-app).

حالا credentialها را در پروژه بگذار. یک فایل `.env` بساز و آن را به `.gitignore` اضافه کن:

```bash title=".env"
DIDAR_CLIENT_ID=YOUR_CLIENT_ID
DIDAR_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

## قدم ۲: مسیر نصب را بساز {#step-2}

وقتی ادمین یک کسب‌وکار پلاگین تو را نصب می‌کند، کار با تأیید او تمام نمی‌شود. دیدار مرورگر ادمین را به Callback URL تو برمی‌گرداند و یک `code` نصب در query می‌گذارد. این کد هنوز نصب نیست؛ فقط می‌گوید «ادمین تأیید کرد». سرور تو باید این کد را همراه Client ID و Client secret به دیدار بفرستد تا دیدار مطمئن شود این واقعاً همان پلاگین است و نصب را کامل کند.

چرا دیدار خودش نصب را کامل نمی‌کند؟ چون این قدم تنها جایی است که پلاگین تو باخبر می‌شود کسب‌وکار تازه‌ای نصبش کرده. در جواب، دیدار به تو می‌گوید نصب روی کدام BizDomain انجام شد و کدام scopeها تأیید شدند، و تو این اطلاعات را ذخیره می‌کنی.

فایل `server.js` را بساز:

```js title="server.js: مسیر نصب"
import express from "express";

const app = express();
const { DIDAR_CLIENT_ID, DIDAR_CLIENT_SECRET } = process.env;

// در محیط واقعی این باید یک دیتابیس باشد. کلید نصب (ApiKey) را فقط رمزگذاری‌شده نگه دار.
const installations = new Map();

app.get("/didar/callback", async (req, res) => {
  // ۱. code نصب را همراه credentialهای پلاگین به دیدار بفرست
  const r = await fetch("https://app.didar.me/api/MarketplaceInstall/CompleteInstallation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Code: req.query.code,
      ClientId: DIDAR_CLIENT_ID,
      ClientSecret: DIDAR_CLIENT_SECRET,
    }),
  });
  const result = (await r.json()).Response;

  // ۲. اگر نصب کامل نشد، به ادمین پیام روشن بده
  if (!r.ok || !result?.Succeeded) {
    return res.status(502).send("نصب کامل نشد. دوباره از لینک نصب امتحان کن.");
  }

  // ۳. نتیجه را با BizDomainId ذخیره کن
  const { BizDomainId, InstallationId, Scopes } = result.Data;
  installations.set(BizDomainId, { InstallationId, Scopes, installedAt: new Date() });

  // ۴. به ادمین بگو چه شد
  res.send("Meet نصب شد. به دیدار برگرد و یک معامله را باز کن.");
});
```

سه نکته در این کد هست که در هر پلاگینی تکرار می‌شود:

- **نام فیلدها PascalCase است** (`Code`، `ClientId`، `ClientSecret`) و جواب داخل `Response` می‌آید. این endpoint روی خود دیدار است و قالبش با بقیه‌ی APIهای مارکت‌پلیس فرق دارد.
- **کلید اصلی هر نصب `BizDomainId` است**، چون یک پلاگین روی کسب‌وکارهای زیادی نصب می‌شود.
- **این مسیر صفحه‌ای است که ادمین در مرورگر می‌بیند**، پس هم در موفقیت و هم در خطا باید پیام قابل‌فهم نشان بدهد.

جزئیات کامل، پارامتر `state` برای جلوگیری از callback جعلی، و همین کد به Python، PHP و C#: [تکمیل نصب](/installation-authorization).

## قدم ۳: مسیر اجرا را بساز {#step-3}

حالا پلاگین نصب می‌شود. قدم بعدی این است که وقتی کاربر از آن استفاده می‌کند، سرور تو بفهمد چه کسی، کجا و روی کدام رکورد آن را اجرا کرده، و اجازه‌ی کار با داده را بگیرد.

هر بار که کاربر فرم «ایجاد جلسه» را ثبت می‌کند، دیدار آدرسی را که برای اکستنشن ثبت کرده‌ای صدا می‌زند و یک `launchCode` در query می‌گذارد:

```http title="درخواستی که از دیدار می‌رسد"
GET https://YOUR_HOST/didar/launch?launchCode=ONE_TIME_CODE
```

این کد عمداً بی‌ارزش است: یک‌بارمصرف است، زود منقضی می‌شود و بدون Client secret به هیچ کاری نمی‌آید. سرور تو آن را همراه credentialها به مارکت‌پلیس می‌فرستد و در جواب **Runtime Token** و **Runtime Context** این اجرا را می‌گیرد. این کد را به `server.js` اضافه کن:

```js title="server.js: مسیر اجرا"
const DIDAR_ORIGIN = "https://app.didar.me";

// launchCode را به Runtime Token و Runtime Context تبدیل می‌کند
async function exchangeLaunchCode(launchCode) {
  const r = await fetch("https://marketplace.didar.me/api/v1/runtime/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      launchCode,
      clientId: DIDAR_CLIENT_ID,
      clientSecret: DIDAR_CLIENT_SECRET,
    }),
  });
  const body = await r.json();
  if (!r.ok || !body.succeeded) {
    console.error("launch exchange failed", body.error?.code, body.meta?.traceId);
    return null;
  }
  return body.data; // { accessToken, tokenType, expiresInSeconds, context }
}

// فرم JSON با fetch مرورگر از داخل دیدار صدا زده می‌شود، پس CORS لازم است
function allowDidar(res) {
  res.set({
    "Access-Control-Allow-Origin": DIDAR_ORIGIN,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}

app.options("/didar/launch", (req, res) => {
  allowDidar(res);
  res.sendStatus(204);
});

app.get("/didar/launch", async (req, res) => {
  allowDidar(res);

  const run = await exchangeLaunchCode(req.query.launchCode);
  if (!run) {
    return res.json({ succeeded: false, message: "این اجرا معتبر نیست؛ فرم را دوباره باز کن." });
  }
  const { accessToken, context } = run;

  // فقط به context اعتماد کن: کاربر روی کدام رکورد است و فرم چه مقادیری دارد
  if (context.entityType !== "deal" || context.entityIds.length !== 1) {
    return res.json({ succeeded: false, message: "این فرم فقط روی یک معامله کار می‌کند." });
  }
  const dealId = context.entityIds[0];

  // قدم ۴ اینجا اضافه می‌شود
  res.json({ succeeded: true, message: `اجرا روی معامله‌ی ${dealId} رسید.` });
});

app.listen(3000, () => console.log("Meet روی پورت 3000"));
```

اینجا چند تصمیم مهم گرفته شده که بهتر است دلیلشان را بدانی:

- **تبدیل کد فقط در backend انجام می‌شود**، چون Client secret لازم دارد و secret هرگز نباید به مرورگر برسد.
- **شناسه‌ی معامله از `context.entityIds` می‌آید، نه از URL یا فرم.** context تنها منبع قابل اعتماد است؛ هر چیزی که از query یا فرم می‌آید را کاربر می‌تواند عوض کند. اگر شناسه‌ی دیگری به API بدهی، مارکت‌پلیس درخواست را رد می‌کند.
- **Runtime Token ذخیره نمی‌شود.** فقط برای همین اجراست؛ اجرای بعدی کد و توکن خودش را دارد.
- **CORS فقط برای origin دقیق دیدار باز است**، نه `*`.

جزئیات کامل، همه‌ی فیلدهای context، خطاهای تبادل و همین کد به Python، PHP و C#: [Runtime Token](/runtime-token).

## قدم ۴: کار اصلی پلاگین را انجام بده {#step-4}

تا اینجا پلاگین می‌داند کاربر روی کدام معامله است و توکنی دارد که اجازه‌ی کار روی همان معامله را می‌دهد. حالا نوبت کار اصلی است: ساختن جلسه و ثبت لینکش در دیدار.

مقادیری که کاربر در فرم وارد کرده در `context.payload` هستند، با همان keyهایی که در قدم ۵ برای فرم تعریف می‌کنی. این مقادیر ورودی کاربرند، پس پیش از استفاده دوباره چکشان کن، حتی اگر فرم دیدار هم آن‌ها را چک کرده باشد. بعد جلسه را بساز و با Runtime Token یک یادداشت روی معامله ثبت کن.

خط `// قدم ۴ اینجا اضافه می‌شود` و `res.json` بعدش را با این کد عوض کن:

```js title="server.js: منطق و داده"
  // ۱. ورودی فرم را دوباره validate کن
  const { inviterEmail, meetingDescription } = context.payload;
  if (!inviterEmail || inviterEmail.length > 320 || !inviterEmail.includes("@")) {
    return res.json({ succeeded: false, message: "ایمیل دعوت‌کننده معتبر نیست." });
  }

  // ۲. کار اصلی پلاگین
  const meetingUrl = await createMeeting(inviterEmail, meetingDescription);

  // ۳. ثبت یادداشت روی همان معامله، با Runtime Token
  const r = await fetch("https://marketplace.didar.me/api/v1/notes", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      Activity: {
        ActivityTypeId: "00000000-0000-0000-0000-000000000000", // یادداشت: GUID خالی
        IsDone: true,
        DealId: dealId,
        ResultNote: `لینک جلسه: ${meetingUrl}`,
      },
    }),
  });
  const note = await r.json();
  if (!r.ok || !note.succeeded) {
    console.error("note create failed", note.error?.code, note.meta?.traceId);
    return res.json({ succeeded: false, message: "جلسه ساخته شد ولی ثبت یادداشت ناموفق بود." });
  }

  // ۴. پیام نهایی که دیدار به کاربر نشان می‌دهد
  res.json({ succeeded: true, message: "جلسه ساخته شد و لینکش در یادداشت‌های معامله ثبت شد.", data: { url: meetingUrl } });
});

// جای این تابع، سرویس جلسه‌ی واقعی خودت را صدا بزن
async function createMeeting(inviterEmail, description) {
  return `https://meet.example.com/${Math.random().toString(36).slice(2, 12)}`;
}
```

در این کد چند قرارداد دیدار هست که باید دقیق رعایتشان کنی:

- **یادداشت با مدل `Activity` ساخته می‌شود**؛ `ActivityTypeId` برای یادداشت GUID خالی است، `IsDone` باید `true` باشد و متن در `ResultNote` می‌رود. نام فیلدها به حروف بزرگ و کوچک حساس‌اند. [API ساخت یادداشت](/api-activities#note-create)
- **`DealId` باید همان معامله‌ی context باشد.** اگر شناسه‌ی معامله‌ی دیگری بفرستی، مارکت‌پلیس با `403` و کد `RUNTIME_ENTITY_ACCESS_DENIED` رد می‌کند.
- **جواب endpoint به فرم JSON یک قرارداد ثابت دارد**: `succeeded` الزامی است و `message` همان متنی است که کاربر در دیدار می‌بیند. [قرارداد پاسخ JSON modal](/api-app-endpoints#json-response)

حالا سرور را اجرا کن تا دیدار بتواند صدایش بزند:

```bash title="Terminal"
node --env-file=.env server.js
```

## قدم ۵: اکستنشن را اضافه کن {#step-5}

سرور آماده است، ولی کاربر هنوز هیچ‌جای دیدار چیزی از پلاگین نمی‌بیند. اکستنشن همان چیزی است که پلاگین را داخل دیدار می‌آورد. برای Meet از **JSON modal** استفاده می‌کنیم: فرمی که ظاهرش را دیدار می‌سازد و تو فقط تعریفش را می‌دهی. این یعنی برای این پلاگین هیچ HTML و CSSی نمی‌نویسی.

تعریف فرم یک فایل JSON است. هر جزء فرم یک `key` دارد و مقدارش با همان key در `context.payload` به سرور تو می‌رسد؛ برای همین keyهای این فایل باید با کد قدم ۴ یکی باشند:

```json title="form.json"
{
  "schemaVersion": 1,
  "layout": "form",
  "title": { "fa": "ایجاد جلسه", "en": "Create meeting" },
  "description": {
    "fa": "یک جلسه بسازید و لینک آن را در یادداشت معامله ثبت کنید.",
    "en": "Create a meeting and save its link as a deal note."
  },
  "loadOnOpen": false,
  "sections": [{
    "id": "meeting-information",
    "title": { "fa": "اطلاعات جلسه", "en": "Meeting information" },
    "items": [
      {
        "type": "text",
        "key": "inviterEmail",
        "label": { "fa": "ایمیل دعوت‌کننده", "en": "Inviter email" },
        "required": true,
        "maxLength": 320
      },
      {
        "type": "textarea",
        "key": "meetingDescription",
        "label": { "fa": "توضیحات جلسه", "en": "Meeting description" },
        "required": false,
        "maxLength": 2000
      }
    ]
  }],
  "submit": {
    "label": { "fa": "ایجاد جلسه", "en": "Create meeting" },
    "closeOnSuccess": true,
    "successMessage": { "fa": "جلسه ایجاد شد.", "en": "The meeting was created." }
  }
}
```

حالا در Developer Hub صفحه‌ی ویرایش Meet را باز کن، به تب **App extensions** برو، کارت **JSON modal** را انتخاب کن و **Add** بزن:

| فیلد | مقدار | چرا |
| --- | --- | --- |
| Action name | `ایجاد جلسه` | متنی که کاربر در منوی عملیات معامله می‌بیند (حداکثر ۳۰ کاراکتر). |
| API endpoint | `https://YOUR_HOST/didar/launch` | آدرسی که دیدار با submit فرم صدا می‌زند؛ همان مسیر اجرای قدم ۳. |
| JWT secret | یک رشته‌ی تصادفی طولانی | Developer Hub آن را برای هر اکستنشن می‌خواهد؛ مثل Client secret فقط روی سرورت نگهش دار. |
| JSON schema | فایل `form.json` | تعریف فرم. فایل JSON نامعتبر پذیرفته نمی‌شود. |
| Locations | `Deal details` | فرم فقط در منوی عملیات صفحه‌ی جزئیات معامله ظاهر شود. |

Save مودال را بزن و بعد **Save اصلی صفحه** را هم بزن. Save مودال فقط اکستنشن را موقتاً به فهرست اضافه می‌کند و تا Save اصلی را نزنی چیزی ذخیره نمی‌شود.

جزئیات کامل schema، جای نمایش و همین مسیر به زبان‌های دیگر: [JSON modal](/json-modals). اگر نیازت با فرم آماده جور نیست، [مرور اکستنشن‌ها](/app-extensions) بقیه‌ی انواع را مقایسه می‌کند.

## قدم ۶: نصب کن و تست کن {#step-6}

همه‌ی بخش‌های پلاگین آماده‌اند. حالا مثل یک ادمین واقعی آن را روی شرکت آزمایشی نصب می‌کنی و مثل یک کاربر واقعی از آن استفاده می‌کنی.

1. مطمئن شو سرور اجراست و آدرس tunnel همان آدرسی است که در Callback URL و API endpoint ثبت کرده‌ای.
2. در Developer Hub، در تب **OAuth & access scopes** روی **Share app** بزن و لینک نصب را کپی کن.
3. لینک را در مرورگری باز کن که در آن داخل شرکت آزمایشی هستی. دیدار نام پلاگین، دسترسی‌هایی که خواسته‌ای و کاربرانی را که به آن دسترسی خواهند داشت نشان می‌دهد. **تأیید دسترسی به اطلاعات و نصب** را بزن.
4. دیدار تو را به `/didar/callback` برمی‌گرداند و باید پیام «Meet نصب شد» را ببینی. اگر خطا دیدی، log سرور را نگاه کن؛ رایج‌ترین دلیل، Client ID یا secret اشتباه است.
5. در دیدار یک معامله‌ی آزمایشی را باز کن، از منوی عملیات **ایجاد جلسه** را بزن، فرم را پر کن و ثبت کن.
6. باید پیام موفقیت را ببینی و یادداشتی با لینک جلسه روی همان معامله ثبت شده باشد.

> [!NOTE]
> هر اجرای اکستنشن یک `launchCode` تازه می‌سازد. اگر بخواهی تست را تکرار کنی، فرم را دوباره از داخل دیدار باز کن؛ کد قبلی دوباره کار نمی‌کند.

حالا یک تست منفی هم انجام بده: در فرم ایمیل نامعتبر وارد کن و ببین پیام خطای پلاگین در دیدار نمایش داده می‌شود. بقیه‌ی مواردی که پیش از انتشار باید تست شوند: [چک‌لیست تست](/test-environment#checklist).

## قدم ۷: به BizDomain اصلی ببر {#step-7}

تا اینجا پلاگین فقط در شرکت آزمایشی وجود دارد و فقط روی همان نصب است. وقتی همه‌چیز درست کار کرد، نوبت این است که Meet را به BizDomain اصلی شرکتت ببری؛ همان جایی که تیم هر روز با دیدار کار می‌کند.

پیش از این قدم، [چک‌لیست امنیت](/security#checklist) را مرور کن و `installations` را از `Map` به یک دیتابیس واقعی منتقل کن. سرور را هم روی یک هاست واقعی با HTTPS ببر؛ tunnel فقط برای توسعه است.

بعد وارد BizDomain اصلی شو و در Developer Hub آن، Meet را با همان تنظیمات قدم ۱ و ۵ دوباره ثبت کن (این کار دسترسی ادمین آن BizDomain را می‌خواهد). این پلاگین Client ID و Client secret خودش را دارد؛ آن‌ها را در `.env` سرور production بگذار و Callback URL و API endpoint را به آدرس سرور واقعی بده. در آخر لینک نصب را بردار و Meet را روی BizDomain اصلی نصب کن. جزئیات: [بردن پلاگین به BizDomain اصلی](/test-environment#move-to-production).

اگر بعداً خواستی Meet را به کسب‌وکارهای دیگر هم بدهی، آن را Live کن و لینک نصبش را به آن‌ها بده. [انتشار و نگهداری](/publishing)

## کد کامل {#full-code}

این همه‌ی `server.js` است، کنار هم:

```js title="server.js"
import express from "express";

const app = express();
const { DIDAR_CLIENT_ID, DIDAR_CLIENT_SECRET } = process.env;
const DIDAR_ORIGIN = "https://app.didar.me";
const installations = new Map(); // در محیط واقعی: دیتابیس

// ۲. مسیر نصب
app.get("/didar/callback", async (req, res) => {
  const r = await fetch("https://app.didar.me/api/MarketplaceInstall/CompleteInstallation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Code: req.query.code, ClientId: DIDAR_CLIENT_ID, ClientSecret: DIDAR_CLIENT_SECRET }),
  });
  const result = (await r.json()).Response;
  if (!r.ok || !result?.Succeeded) return res.status(502).send("نصب کامل نشد. دوباره از لینک نصب امتحان کن.");
  const { BizDomainId, InstallationId, Scopes } = result.Data;
  installations.set(BizDomainId, { InstallationId, Scopes, installedAt: new Date() });
  res.send("Meet نصب شد. به دیدار برگرد و یک معامله را باز کن.");
});

// ۳. مسیر اجرا
async function exchangeLaunchCode(launchCode) {
  const r = await fetch("https://marketplace.didar.me/api/v1/runtime/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ launchCode, clientId: DIDAR_CLIENT_ID, clientSecret: DIDAR_CLIENT_SECRET }),
  });
  const body = await r.json();
  if (!r.ok || !body.succeeded) {
    console.error("launch exchange failed", body.error?.code, body.meta?.traceId);
    return null;
  }
  return body.data;
}

function allowDidar(res) {
  res.set({
    "Access-Control-Allow-Origin": DIDAR_ORIGIN,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}

app.options("/didar/launch", (req, res) => {
  allowDidar(res);
  res.sendStatus(204);
});

app.get("/didar/launch", async (req, res) => {
  allowDidar(res);
  const run = await exchangeLaunchCode(req.query.launchCode);
  if (!run) return res.json({ succeeded: false, message: "این اجرا معتبر نیست؛ فرم را دوباره باز کن." });
  const { accessToken, context } = run;
  if (context.entityType !== "deal" || context.entityIds.length !== 1) {
    return res.json({ succeeded: false, message: "این فرم فقط روی یک معامله کار می‌کند." });
  }
  const dealId = context.entityIds[0];

  // ۴. منطق و داده
  const { inviterEmail, meetingDescription } = context.payload;
  if (!inviterEmail || inviterEmail.length > 320 || !inviterEmail.includes("@")) {
    return res.json({ succeeded: false, message: "ایمیل دعوت‌کننده معتبر نیست." });
  }
  const meetingUrl = await createMeeting(inviterEmail, meetingDescription);
  const r = await fetch("https://marketplace.didar.me/api/v1/notes", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      Activity: { ActivityTypeId: "00000000-0000-0000-0000-000000000000", IsDone: true, DealId: dealId, ResultNote: `لینک جلسه: ${meetingUrl}` },
    }),
  });
  const note = await r.json();
  if (!r.ok || !note.succeeded) {
    console.error("note create failed", note.error?.code, note.meta?.traceId);
    return res.json({ succeeded: false, message: "جلسه ساخته شد ولی ثبت یادداشت ناموفق بود." });
  }
  res.json({ succeeded: true, message: "جلسه ساخته شد و لینکش در یادداشت‌های معامله ثبت شد.", data: { url: meetingUrl } });
});

async function createMeeting(inviterEmail, description) {
  return `https://meet.example.com/${Math.random().toString(36).slice(2, 12)}`;
}

app.listen(3000, () => console.log("Meet روی پورت 3000"));
```

## بعد از این بخوان {#read-next}

- [مرور اکستنشن‌ها](/app-extensions): بقیه‌ی جاهایی که پلاگین می‌تواند در دیدار ظاهر شود.
- [Scopeها و دسترسی‌ها](/scopes): کدام داده با کدام scope باز می‌شود.
- [ساخت با MCP دیدار](/build-with-mcp): پلاگین بعدی را با کمک ابزار AI خودت بساز.
