---
title: ۴. خواندن و نوشتن داده
section: start
order: 13
lead: با Runtime Token حالا می‌توانی داده‌ی دیدار را بخوانی و بنویسی. در این قدم معامله‌ی همین اجرا را می‌خوانی، یک یادداشت رویش ثبت می‌کنی و نتیجه را به دیدار برمی‌گردانی.
description: فراخوانی APIهای پروکسی مارکت‌پلیس با Runtime Token؛ خواندن معامله، ساخت یادداشت، قواعد scope و context و برگرداندن نتیجه به فرم JSON.
---

## همه‌ی درخواست‌ها یک شکل دارند {#shape}

```bash title="الگوی مشترک"
curl --location 'https://marketplace.didar.me/api/v1/<مسیر>' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Accept: application/json'
```

مارکت‌پلیس نصب، scope و context را از خود token درمی‌آورد؛ لازم نیست `BizDomainId` یا کلید دیدار را بفرستی.

## ۱. معامله را بخوان {#read}

```bash title="GET /api/v1/deals/{dealId}"
curl --location 'https://marketplace.didar.me/api/v1/deals/704e1533-cb4b-42d7-895d-ef71ff32ba5b' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Accept: application/json'
```

این درخواست فقط وقتی موفق است که اپ scope `deals` یا `deals.fullaccess` داشته باشد **و** این شناسه در `context.entityIds` همین اجرا باشد. پاسخ داخل `data.Response` است:

```json title="200 OK (خلاصه)"
{
  "succeeded": true,
  "data": { "Response": { "Id": "704e1533-cb4b-42d7-895d-ef71ff32ba5b", "Title": "Enterprise renewal" } },
  "error": null,
  "meta": { "traceId": "TRACE_ID", "timestampUtc": "2026-01-01T00:00:00Z" }
}
```

## ۲. یادداشت ثبت کن {#write}

یادداشت در دیدار یک `Activity` است با `ActivityTypeId` برابر GUID خالی و `IsDone` برابر `true`. به scope `activities.fullaccess` نیاز دارد.

```bash title="POST /api/v1/notes"
curl --location 'https://marketplace.didar.me/api/v1/notes' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "Activity": {
    "ActivityTypeId": "00000000-0000-0000-0000-000000000000",
    "IsDone": true,
    "DealId": "704e1533-cb4b-42d7-895d-ef71ff32ba5b",
    "ResultNote": "لینک جلسه: https://meet.google.com/abc-defg-hij"
  }
}'
```

> [!WARNING]
> **نام فیلدها حساس به حروف است.** بدنه‌ها دقیقاً همان بدنه‌های API دیدارند؛ `Deal`، `Case`، `Contact`، `Activity` و `ContactIds` را دقیقاً با همین casing بفرست.

## ۳. نتیجه را به دیدار برگردان {#respond}

برای اکستنشن‌های JSON (مثل فرم «ایجاد جلسه»)، دیدار پاسخ endpoint تو را می‌خواند و به کاربر یک پیام نشان می‌دهد:

```json title="پاسخ endpoint تو به دیدار"
{
  "succeeded": true,
  "message": "جلسه ساخته شد و یادداشت معامله ذخیره شد.",
  "data": { "url": "https://meet.google.com/abc-defg-hij" }
}
```

در خطا `succeeded: false` و یک `message` قابل‌نمایش برگردان. [قرارداد کامل](/api-app-endpoints#json-response)

## کد کامل اکستنشن {#code}

```js title="routes/launch.js"
app.get("/didar/launch", async (req, res) => {
  // ۱. launchCode ← Runtime Token (قدم قبل)
  const token = await exchangeLaunchCode(req.query.launchCode);
  if (!token.succeeded) return res.json({ succeeded: false, message: "اجرا معتبر نیست." });
  const { accessToken, context } = token.data;

  const api = (path, init = {}) =>
    fetch(`https://marketplace.didar.me${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    }).then((r) => r.json());

  // ۲. شناسه فقط از context
  const dealId = context.entityIds[0];
  const { inviterEmail } = context.payload;
  if (!inviterEmail || inviterEmail.length > 320) {
    return res.json({ succeeded: false, message: "ایمیل دعوت‌کننده معتبر نیست." });
  }

  // ۳. کار اصلی اپ (مثلاً ساخت جلسه در سرویس بیرونی)
  const meetingUrl = await createMeeting(inviterEmail);

  // ۴. نوشتن در دیدار
  const note = await api("/api/v1/notes", {
    method: "POST",
    body: JSON.stringify({
      Activity: {
        ActivityTypeId: "00000000-0000-0000-0000-000000000000",
        IsDone: true,
        DealId: dealId,
        ResultNote: `لینک جلسه: ${meetingUrl}`,
      },
    }),
  });
  if (!note.succeeded) return res.json({ succeeded: false, message: "ثبت یادداشت ناموفق بود." });

  // ۵. پیام به کاربر
  res.json({ succeeded: true, message: "جلسه ساخته شد.", data: { url: meetingUrl } });
});
```

## چه داده‌هایی در دسترس است؟ {#available}

| داده | scope خواندن | scope نوشتن | مرجع |
| --- | --- | --- | --- |
| اطلاعات پایه: BizDomain، کاربران، کاریزها، مراحل، برچسب‌ها، انواع فعالیت، دلایل شکست | `basicinfo` | — | [API اطلاعات پایه](/api-basic) |
| معامله | `deals` | `deals.fullaccess` | [API معامله](/api-deals) |
| پرونده | `cases` | `cases.fullaccess` | [API پرونده](/api-cases) |
| شخص و شرکت | `contacts` | `contacts.fullaccess` | [API شخص و شرکت](/api-contacts) |
| فعالیت و یادداشت | `activities` | `activities.fullaccess` | [API فعالیت و یادداشت](/api-activities) |

## اگر درخواست رد شد {#errors}

| status | یعنی | چه کنی |
| --- | --- | --- |
| `401` | token نامعتبر یا منقضی | token را refresh نکن؛ کاربر باید اکستنشن را دوباره اجرا کند |
| `403` | scope ندارد (`PROXY_ACCESS_DENIED`) یا رکورد بیرون از context است (`RUNTIME_ENTITY_*`) | شناسه را فقط از `entityIds` بگیر؛ اگر scope کم است، آن را در Developer Hub اضافه کن (هر نصب فقط scopeهایی را دارد که ادمین هنگام نصب تأیید کرده) |
| `400` | بدنه نامعتبر | نام و casing فیلدها را با مرجع API مقایسه کن |
| `502` | دیدار جواب نداد | GET را با backoff دوباره امتحان کن؛ create/update را کورکورانه تکرار نکن |

فهرست کامل: [خطاها](/errors).

## قدم بعدی {#next}

[۵. تست و انتشار](/go-live): کل مسیر را تست کن و اپ را Live کن.
