---
title: ۳. اجرای اکستنشن و گرفتن token
section: start
order: 12
lead: وقتی کاربر اکستنشن تو را در دیدار باز می‌کند، سرورت یک launchCode می‌گیرد. در این قدم آن را به Runtime Token تبدیل می‌کنی و می‌فهمی کاربر کجا و روی چه رکوردی اکستنشن را اجرا کرده است.
description: دریافت launchCode، تبدیل آن به Runtime Token با /api/v1/runtime/token، ساختار Runtime Context و اعتبارسنجی آن در backend.
---

## چه اتفاقی می‌افتد؟ {#flow}

1. کاربر در جزئیات یک معامله، «ایجاد جلسه» را از منوی عملیات می‌زند و فرم را پر می‌کند.
2. دیدار یک **launchCode** یک‌بارمصرف برای همین اجرا می‌سازد و آدرس اکستنشن تو را با آن صدا می‌زند:

```http title="درخواستی که به سرور تو می‌رسد"
GET https://your-app.example.com/didar/launch?launchCode=ONE_TIME_CODE
```

3. سرور تو کد را به مارکت‌پلیس می‌فرستد و در عوض **Runtime Token** و **Runtime Context** می‌گیرد.
4. سرور تو کار اکستنشن را انجام می‌دهد و جواب می‌دهد.

## تبدیل launchCode به Runtime Token {#exchange}

```bash title="cURL"
curl --location 'https://marketplace.didar.me/api/v1/runtime/token' \
--header 'Content-Type: application/json' \
--data-raw '{
  "launchCode": "ONE_TIME_CODE",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET"
}'
```

این درخواست Bearer token نمی‌خواهد و **فقط از backend** فرستاده می‌شود، چون Client secret در آن است.

```json title="200 OK"
{
  "succeeded": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "expiresInSeconds": 300,
    "context": {
      "target": "extension",
      "runtimeId": "11a16d52-b89a-4d0f-ac51-55b2b8161ba7",
      "location": 2,
      "entityType": "deal",
      "entityIds": ["704e1533-cb4b-42d7-895d-ef71ff32ba5b"],
      "payload": {
        "customerEmail": "customer@example.com"
      }
    }
  },
  "error": null,
  "meta": {
    "traceId": "TRACE_ID",
    "correlationId": null,
    "timestampUtc": "2026-09-30T10:00:00Z"
  }
}
```

## Runtime Context را بخوان {#context}

`context` تنها منبع قابل‌اعتماد درباره‌ی این اجراست:

| فیلد | در مثال بالا | یعنی |
| --- | --- | --- |
| `target` | `extension` | یک اکستنشن اجرا شده (برای صفحه‌ی تنظیمات `settings_page`) |
| `runtimeId` | `11a16d52-…` | کدام اکستنشن اپ تو |
| `location` | `2` | جزئیات معامله ([جدول Locationها](/extensions#locations)) |
| `entityType` | `deal` | نوع رکوردها |
| `entityIds` | یک شناسه | رکوردهایی که این اجرا اجازه‌ی کار روی آن‌ها را دارد؛ در صفحه‌های لیست ممکن است چند شناسه باشد |
| `payload` | مقادیر فرم | چیزی که کاربر در فرم JSON وارد کرده |

> [!WARNING]
> **مرز اعتماد.** هر چیزی که در query، فرم یا frontend می‌آید context امنیتی نیست. شناسه‌ی رکورد را فقط از `context.entityIds` بگیر و `payload` را مثل هر ورودی کاربر دوباره validate کن.

## نمونه‌ی کد {#code}

```js title="routes/launch.js (Express)"
app.get("/didar/launch", async (req, res) => {
  const r = await fetch("https://marketplace.didar.me/api/v1/runtime/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      launchCode: req.query.launchCode,
      clientId: process.env.DIDAR_CLIENT_ID,
      clientSecret: process.env.DIDAR_CLIENT_SECRET,
    }),
  });
  const result = await r.json();
  if (!r.ok || !result.succeeded) {
    return res.status(r.status).json({ succeeded: false, message: "اجرا معتبر نیست؛ دوباره امتحان کن." });
  }

  const { accessToken, context } = result.data;
  if (context.target !== "extension" || context.entityType !== "deal") {
    return res.status(400).json({ succeeded: false, message: "این اکستنشن فقط روی معامله اجرا می‌شود." });
  }

  // قدم بعد: با accessToken داده‌ی همین معامله را بخوان و بنویس
  const dealId = context.entityIds[0];
  // ...
});
```

## چک‌لیست اعتبارسنجی {#validate}

- هم HTTP status و هم `succeeded` را چک کن.
- `target` و `runtimeId` را با اکستنشنی که انتظارش را داری تطبیق بده.
- برای کار روی رکوردها فقط از `entityType` و `entityIds` همین پاسخ استفاده کن.
- `payload` را از نظر الزامی بودن، نوع، طول و قالب در backend دوباره validate کن.
- token را فقط تا پایان همین اجرا در حافظه نگه دار؛ ذخیره‌اش نکن.

## وقتی خطا می‌گیری {#errors}

| کد | یعنی | چه کنی |
| --- | --- | --- |
| `INVALID_CLIENT_CREDENTIALS` | Client ID یا secret اشتباه است | مقدار Developer Hub را چک کن |
| `LAUNCH_CODE_INVALID` | کد ناشناخته یا مال اپ دیگری است | آدرس اکستنشن و Client ID را چک کن |
| `LAUNCH_CODE_ALREADY_USED` | کد قبلاً مصرف شده | هر کد را فقط یک‌بار exchange کن؛ برای تست دوباره، اکستنشن را از نو اجرا کن |
| `LAUNCH_CODE_EXPIRED` | عمر کد تمام شده | کاربر باید اکستنشن را دوباره اجرا کند |

## قدم بعدی {#next}

[۴. خواندن و نوشتن داده](/crm-data): با همین `accessToken` معامله را بخوان و یادداشت ثبت کن.
