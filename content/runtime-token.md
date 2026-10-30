---
title: Runtime Token
section: start
order: 32
lead: هر بار که کاربر یکی از اکستنشن‌های پلاگین تو یا صفحه‌ی تنظیماتش را باز می‌کند، یک «اجرا» شروع می‌شود. سرور تو در شروع هر اجرا یک launchCode می‌گیرد و آن را به Runtime Token تبدیل می‌کند؛ کلیدی کوتاه‌عمر که فقط برای همان اجرا و همان رکوردها معتبر است. این صفحه این جریان، فیلدهای Runtime Context و تمپلیت کدش را توضیح می‌دهد.
description: دریافت Runtime Token در مارکت‌پلیس دیدار؛ launchCode چیست، تبادل با /api/v1/runtime/token، فیلدهای Runtime Context، استفاده از token، انقضا، خطاها و تمپلیت کد Node.js، Python، PHP و C#.
---

## Runtime Token چیست؟ {#what}

پلاگین تو برای کار با داده‌ی دیدار به اجازه نیاز دارد. در خیلی از پلتفرم‌ها این اجازه یک access token بلندمدت است که بعد از نصب می‌گیری و هر وقت خواستی با آن داده می‌خوانی. مارکت‌پلیس دیدار این کار را نمی‌کند. در دیدار اجازه به **لحظه‌ی استفاده** گره خورده است: هر بار که کاربری پلاگین را باز می‌کند، پلاگین یک **Runtime Token** تازه می‌گیرد که:

- فقط برای **همین اجرا** است و چند دقیقه بیشتر عمر نمی‌کند،
- فقط به **رکوردهایی** که کاربر در این اجرا باز یا انتخاب کرده دسترسی می‌دهد،
- و فقط در محدوده‌ی **scopeهایی** کار می‌کند که ادمین هنگام نصب تأیید کرده.

همراه token، سرور تو **Runtime Context** را هم می‌گیرد: اینکه کاربر از کدام اکستنشن و کدام صفحه آمده، روی کدام رکوردها کار می‌کند، و (برای فرم JSON) چه مقادیری وارد کرده. context تنها منبع قابل اعتماد پلاگین برای این اطلاعات است.

در [ساختار پلاگین](/plugin-anatomy) این همان **مسیر اجرا** است. دلیل این طراحی را در [مارکت‌پلیس چطور کار می‌کند](/about-the-marketplace#why) خواندی.

![Extension launch flowchart: launchCode, runtime token, context checks, data API, response](/images/flows/runtime-flow.png "کل جریان در یک نگاه؛ شماره‌ها همان قدم‌های این صفحه است")

## قدم ۱: دیدار اکستنشن را اجرا می‌کند {#step-1}

کاربر اکستنشن را باز می‌کند: یک گزینه‌ی منو را می‌زند، فرم JSON را ثبت می‌کند، صفحه‌ای را که پنل پلاگین در آن است باز می‌کند، یا تنظیمات پلاگین را باز می‌کند. دیدار برای همین اجرا یک `launchCode` یک‌بارمصرف می‌سازد و آدرسی را که برای اکستنشن ثبت کرده‌ای (URL، API endpoint یا Iframe URL) با آن صدا می‌زند:

```http title="GET"
https://your-app.example.com/didar/launch?launchCode=ONE_TIME_CODE
```

| پارامتر query | توضیح |
| --- | --- |
| `launchCode` | کد کوتاه‌عمر و یک‌بارمصرف این اجرا. ذخیره یا log نشود. |

> [!NOTE]
> **چرا launchCode و نه خود token؟** این درخواست از مرورگر کاربر می‌آید. اگر token و context در URL بودند، در history مرورگر، access log سرورها و هدر referrer نشت می‌کردند. launchCode بدون Client secret هیچ ارزشی ندارد، پس حتی اگر جایی ثبت شود خطری ندارد.

## قدم ۲: تبدیل launchCode به Runtime Token {#step-2}

سرور تو کد را همراه credentialهای پلاگین به مارکت‌پلیس می‌فرستد. این درخواست Bearer token نمی‌خواهد، ولی Client secret در بدنه‌اش است؛ پس **فقط از backend** فرستاده می‌شود، هرگز از JavaScript مرورگر.

```http title="POST"
https://marketplace.didar.me/api/v1/runtime/token
```

| پارامتر بدنه | توضیح |
| --- | --- |
| `launchCode` | مقدار query parameter قدم ۱. |
| `clientId` | Client ID پلاگین. |
| `clientSecret` | Client secret پلاگین. |

```bash title="cURL"
curl --location 'https://marketplace.didar.me/api/v1/runtime/token' \
--header 'Content-Type: application/json' \
--data-raw '{
  "launchCode": "ONE_TIME_CODE",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET"
}'
```

نام فیلدهای این endpoint camelCase است (برخلاف `CompleteInstallation` که PascalCase است). در جواب، token و context این اجرا را می‌گیری:

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
| `data.context.runtimeId` | شناسه‌ی اکستنشن؛ در صفحه‌ی تنظیمات، شناسه‌ی عمومی پلاگین. |
| `data.context.location` | محل اجرا ([جدول Locationها](/app-extensions#locations))؛ در تنظیمات `null`. |
| `data.context.entityType` | `deal`، `case`، `person` یا `company`؛ در تنظیمات `null`. |
| `data.context.entityIds` | رکوردهایی که این اجرا اجازه‌ی کار روی آن‌ها را دارد؛ در صفحه‌های لیست ممکن است چند شناسه باشد. |
| `data.context.payload` | مقادیر فرم JSON modal با همان keyهای schema. |

> [!WARNING]
> **مرز اعتماد.** تنها context معتبر همین پاسخ است. شناسه‌ی رکورد را فقط از `context.entityIds` بگیر، نه از query یا frontend، و `payload` را مثل هر ورودی کاربر دوباره validate کن.

## قدم ۳: استفاده از token {#step-3}

در طول اجرا، Runtime Token را در هدر `Authorization` همه‌ی درخواست‌های داده بفرست. لازم نیست `BizDomainId` یا کلید دیگری بفرستی؛ مارکت‌پلیس نصب، کاربر و context را از خود token درمی‌آورد.

```bash title="cURL"
curl --location 'https://marketplace.didar.me/api/v1/deals/704e1533-cb4b-42d7-895d-ef71ff32ba5b' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Accept: application/json'
```

مارکت‌پلیس پیش از رساندن هر درخواست به دیدار این‌ها را چک می‌کند. اگر یکی برقرار نباشد، درخواست رد می‌شود:

![Data request checks: token, scope, record type, entityIds](/images/flows/request-checks.png)

یعنی حتی اگر پلاگین تو دسترسی کامل به معامله‌ها داشته باشد، در این اجرا فقط روی معامله‌هایی کار می‌کند که در `entityIds` آمده‌اند. [Scopeها](/scopes) · [کدهای وضعیت HTTP](/errors)

## قدم ۴: انقضا و اجرای بعدی {#step-4}

- **Runtime Token فقط برای همین اجراست.** آن را برای اجرای بعدی ذخیره یا استفاده نکن. اگر کاربر در UI پلاگین تو چند کار پشت‌سرهم انجام می‌دهد، token را در session کوتاه سمت سرور نگه دار، نه در مرورگر. [الگوی Custom UI](/custom-ui-extensions#security)
- **refresh token وجود ندارد.** وقتی token منقضی شد (`401`) یا launchCode منقضی بود (`410`)، تلاش دوباره فایده ندارد؛ کاربر باید اکستنشن را دوباره باز کند تا اجرای تازه با `launchCode` تازه شروع شود. پیامی که به کاربر نشان می‌دهی باید همین را بگوید.

## خطاهای تبادل {#errors}

| HTTP | `error.code` | یعنی | چه کنی |
| --- | --- | --- | --- |
| `401` | `INVALID_CLIENT_CREDENTIALS` | Client ID یا secret اشتباه است | مقدار Developer Hub را چک کن |
| — | `LAUNCH_CODE_INVALID` | کد ناشناخته یا مال پلاگین دیگری است | آدرس اکستنشن و Client ID را چک کن |
| `409` | `LAUNCH_CODE_ALREADY_USED` | کد قبلاً مصرف شده | هر کد را فقط یک‌بار تبدیل کن |
| `410` | `LAUNCH_CODE_EXPIRED` | عمر کد تمام شده | کاربر باید اکستنشن را دوباره اجرا کند |

## تمپلیت کد {#template}

همه‌ی اکستنشن‌ها از همین جریان رد می‌شوند، پس منطق آن را یک‌بار در یک کلاینت کوچک می‌نویسیم و بقیه‌ی تمپلیت‌های این داک از آن استفاده می‌کنند. این کلاینت دو کار اصلی دارد: `exchangeLaunchCode` کد را به token و context تبدیل می‌کند، و `didarApi` با token درخواست داده می‌فرستد و `data.Response` را برمی‌گرداند یا در خطا، status و `error.code` و `traceId` را گزارش می‌دهد.

<!--TEMPLATE:client-->

و این یک مسیر اجرای کامل با همین کلاینت است: کد را تبدیل می‌کند، نوع رکورد را از context چک می‌کند و عنوان معامله را از دیدار می‌خواند.

<!--TEMPLATE:launch-->

## بعد از این بخوان {#read-next}

- [Scopeها و دسترسی‌ها](/scopes)
- [مرور اکستنشن‌ها](/app-extensions): هر اکستنشن آدرس اجرایش را کجا ثبت می‌کند و چه جوابی می‌خواهد.
- [مرجع API: دریافت Runtime Token](/api-auth#runtime-token)
