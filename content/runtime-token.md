---
title: Runtime Token
section: start
order: 32
lead: هر بار که کاربر اکستنشن یا تنظیمات اپ را اجرا می‌کند، سرور تو یک launchCode می‌گیرد و آن را به Runtime Token تبدیل می‌کند. این صفحه چهار قدم این جریان را با درخواست و پاسخ هرکدام نشان می‌دهد.
description: قدم‌به‌قدم دریافت Runtime Token در دیدار؛ درخواست launch با launchCode، تبادل با /api/v1/runtime/token، فیلدهای Runtime Context، استفاده از token و انقضا.
---

## قدم ۱: دیدار اکستنشن را اجرا می‌کند {#step-1}

کاربر اکستنشن را باز می‌کند. دیدار یک `launchCode` یک‌بارمصرف برای همین اجرا می‌سازد و آدرس ثبت‌شده‌ی اکستنشن (URL، API endpoint یا Iframe URL) را با آن صدا می‌زند:

```http title="GET"
https://your-app.example.com/didar/launch?launchCode=ONE_TIME_CODE
```

| پارامتر query | توضیح |
| --- | --- |
| `launchCode` | کد کوتاه‌عمر و یک‌بارمصرف این اجرا. ذخیره یا log نشود. |

> [!NOTE]
> **چرا launchCode و نه خود token؟** قرار دادن JWT و context در URL باعث نشت آن در history مرورگر، access log و referrer می‌شود. کد یک‌بارمصرف بدون Client secret بی‌ارزش است.

## قدم ۲: تبدیل launchCode به Runtime Token {#step-2}

این درخواست Bearer token نمی‌خواهد و **فقط از backend** فرستاده می‌شود.

```http title="POST"
https://marketplace.didar.me/api/v1/runtime/token
```

| پارامتر بدنه | توضیح |
| --- | --- |
| `launchCode` | مقدار query parameter قدم ۱. |
| `clientId` | Client ID اپ. |
| `clientSecret` | Client secret اپ. |

```bash title="cURL"
curl --location 'https://marketplace.didar.me/api/v1/runtime/token' \
--header 'Content-Type: application/json' \
--data-raw '{
  "launchCode": "ONE_TIME_CODE",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET"
}'
```

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

| کلید JSON | توضیح |
| --- | --- |
| `data.accessToken` | Runtime Token. |
| `data.tokenType` | همیشه `Bearer`. |
| `data.expiresInSeconds` | عمر token به ثانیه. |
| `data.context.target` | `extension` یا `settings_page`. |
| `data.context.runtimeId` | شناسه‌ی اکستنشن؛ در صفحه‌ی تنظیمات، شناسه‌ی عمومی اپ. |
| `data.context.location` | محل اجرا ([جدول Locationها](/app-extensions#locations))؛ در تنظیمات `null`. |
| `data.context.entityType` | `deal`، `case`، `person` یا `company`؛ در تنظیمات `null`. |
| `data.context.entityIds` | رکوردهایی که این اجرا اجازه‌ی کار روی آن‌ها را دارد؛ در صفحه‌های لیست ممکن است چند شناسه باشد. |
| `data.context.payload` | مقادیر فرم JSON modal با همان keyهای schema. |

> [!WARNING]
> **مرز اعتماد.** تنها context معتبر همین پاسخ است. شناسه‌ی رکورد را فقط از `context.entityIds` بگیر و `payload` را مثل هر ورودی کاربر دوباره validate کن.

## قدم ۳: استفاده از token {#step-3}

Runtime Token را در هدر `Authorization` درخواست‌های داده بفرست:

```bash title="cURL"
curl --location 'https://marketplace.didar.me/api/v1/deals/704e1533-cb4b-42d7-895d-ef71ff32ba5b' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Accept: application/json'
```

مارکت‌پلیس هر درخواست را دو بار چک می‌کند: آیا اپ [scope](/scopes) لازم را دارد، و آیا رکورد جزو `entityIds` همین اجراست. [درباره‌ی API](/api-concepts)

## قدم ۴: انقضا و اجرای بعدی {#step-4}

- Runtime Token فقط برای همین اجراست. آن را ذخیره نکن و برای اجرای بعدی استفاده نکن.
- refresh token وجود ندارد. وقتی token منقضی شد (`401`) یا کد منقضی بود (`410`)، کاربر باید اکستنشن را دوباره اجرا کند تا `launchCode` تازه ساخته شود.

## خطاهای تبادل {#errors}

| HTTP | `error.code` | یعنی | چه کنی |
| --- | --- | --- | --- |
| `401` | `INVALID_CLIENT_CREDENTIALS` | Client ID یا secret اشتباه است | مقدار Developer Hub را چک کن |
| — | `LAUNCH_CODE_INVALID` | کد ناشناخته یا مال اپ دیگری است | آدرس اکستنشن و Client ID را چک کن |
| `409` | `LAUNCH_CODE_ALREADY_USED` | کد قبلاً مصرف شده | هر کد را فقط یک‌بار تبدیل کن |
| `410` | `LAUNCH_CODE_EXPIRED` | عمر کد تمام شده | کاربر باید اکستنشن را دوباره اجرا کند |

## بعد از این بخوان {#read-next}

- [Scopeها و دسترسی‌ها](/scopes)
- [مرجع API: دریافت Runtime Token](/api-auth#runtime-token)
- [خطاها](/errors)
