---
title: اکستنشن‌ها
section: start
order: 20
lead: اکستنشن جایی است که کاربر اپ تو را داخل دیدار می‌بیند. این صفحه شش نوع اکستنشن Developer Hub، جای نمایش هرکدام، محدودیت‌ها و قرارداد فرم JSON را توضیح می‌دهد.
description: انواع اکستنشن در Developer Hub (Links، JSON modal، JSON panel، Custom modal، Custom panel، App settings)، Locationها، ظرفیت‌ها، فرم JSON، پاسخ submit و CORS.
---

## کدام نوع را انتخاب کنم؟ {#choose}

| اگر می‌خواهی… | نوع |
| --- | --- |
| کاربر با یک کلیک به صفحه‌ای روی سایت تو برود | **Links** |
| کاربر با یک فرم از قبل تعریف‌شده یک کار کامل را داخل خود دیدار انجام بدهد، بدون نوشتن UI | **JSON modal** |
| UI کامل خودت را در یک پنجره‌ی modal نشان بدهی | **Custom modal** |
| داده‌ی اپ تو (مثلاً مانده‌حساب مشتری) با اجزای آماده‌ی دیدار در صفحه‌ی جزئیات دیده شود، بدون نوشتن UI | **JSON panel** |
| UI کامل خودت را به‌شکل پنل در صفحه‌ی جزئیات نشان بدهی | **Custom panel** |
| کاربر با یک کلیک از فهرست اپ‌های نصب‌شده به تنظیمات اپ تو برسد | **App settings** ([صفحه‌ی تنظیمات](/settings-page)) |

## شش نوع اکستنشن {#types}

| نوع | کجا دیده می‌شود | چه کسی UI را می‌سازد | چه چیزی ثبت می‌کنی |
| --- | --- | --- | --- |
| Links | منوی عملیات | — (به سایت تو می‌رود) | Action name، URL، JWT secret، Locations |
| JSON modal | منوی عملیات ← modal | دیدار، از روی schema | Action name، API endpoint، JWT secret، JSON schema، Locations |
| Custom modal | منوی عملیات ← modal | تو (iframe) | Modal name، Iframe URL، JWT secret، Entry points |
| JSON panel | پنل در سایدبار صفحه‌ی جزئیات | دیدار، با اجزای آماده | Panel name، API endpoint، JWT secret، JSON data structure، Panel locations |
| Custom panel | پنل در سایدبار سمت چپ صفحه‌ی جزئیات | تو (iframe) | Panel name، Iframe URL، JWT secret، Panel locations |
| App settings | تنظیمات اپ نصب‌شده | تو (لینک خارجی یا iframe) | Type، URL یا Iframe URL، JWT secret |

توضیح (description) در همه‌ی انواع اختیاری است.

## Locationها {#locations}

**Links، JSON modal و Custom modal** در منوی عملیات این صفحه‌ها می‌نشینند. در صفحه‌های لیست، اکستنشن روی یک یا چند ردیف انتخاب‌شده اجرا می‌شود (از منوی ⋯ کنار عملیات گروهی) و `entityIds` می‌تواند چند شناسه داشته باشد.

| در Developer Hub | `location` در context | `entityType` |
| --- | --- | --- |
| Deals list | `1` | `deal` |
| Deal details | `2` | `deal` |
| People list | `3` | `person` |
| Person details | `4` | `person` |
| Organizations list | `5` | `company` |
| Organization details | `6` | `company` |
| Case list | `7` | `case` |
| Case details | `8` | `case` |

**JSON panel و Custom panel** به‌شکل یک پنل در سایدبار سمت چپ صفحه‌های جزئیات نمایش داده می‌شوند: Deal details، Person details و Organization details. کاربر بدون اجرای عملیات خاصی پنل را می‌بیند.

## ظرفیت هر اپ {#limits}

| قاعده | مقدار |
| --- | --- |
| Links + JSON modal + Custom modal در هر Location منو (Deals list، Deal details، People list، Person details، Organizations list، Organization details) | حداکثر ۳، با هر ترکیبی |
| Links + JSON modal + Custom modal در کل اپ | حداکثر ۱۸ |
| پنل در هر صفحه‌ی جزئیات | ۱ (یا JSON panel یا Custom panel، نه هر دو) |
| App settings | ۱ |
| Links و JSON modal | حداقل یک Location الزامی |
| JSON panel و Custom panel | حداقل یک Panel location الزامی |
| Custom modal | Entry point اختیاری ([پایین‌تر](#custom-modal)) |

## قواعد فیلدها {#validation}

| فیلد | قاعده | پیام خطای Developer Hub |
| --- | --- | --- |
| نام (Action / Modal / Panel name) | الزامی، حداکثر ۳۰ کاراکتر | `Name must be 30 characters or fewer.` |
| Description | اختیاری، حداکثر ۱۵۰ کاراکتر | `Description must be 150 characters or fewer.` |
| URL و API endpoint | URL معتبر | `Enter a valid URL.` |
| Iframe URL | فقط HTTPS | `Enter a valid HTTPS URL.` |
| JWT secret | الزامی | `Enter a JWT secret.` |
| JSON schema / JSON data structure | فایل JSON معتبر | `This file isn’t valid JSON. Please upload a valid JSON file.` |

## اجرای اکستنشن {#flow}

همه‌ی انواع یک الگو دارند:

1. دیدار اکستنشن‌های اپ‌های نصب‌شده برای Location فعلی را نشان می‌دهد.
2. کاربر یکی را اجرا می‌کند؛ دیدار یک `launchCode` برای همان اکستنشن و رکوردها می‌سازد.
3. دیدار `launchCode` را به آدرس ثبت‌شده‌ی اکستنشن (URL، API endpoint یا Iframe URL) اضافه می‌کند.
4. backend تو کد را به Runtime Token تبدیل می‌کند ([قدم ۳](/launch)).
5. iframe یا لینک، UI خودش را نشان می‌دهد؛ endpoint اکستنشن JSON نتیجه‌ی ساختاریافته برمی‌گرداند.

## فرم JSON modal {#json-form}

برای JSON modal یک فایل schema آپلود می‌کنی و دیدار از روی آن فرم را می‌سازد. هر input یک `key` دارد؛ مقدار واردشده با همان key در `context.payload` به دستت می‌رسد. متن‌ها دوزبانه (`fa` و `en`) هستند.

```json title="form.json"
{
  "schemaVersion": 1,
  "layout": "form",
  "title": { "fa": "ایجاد جلسه گوگل میت", "en": "Create Google Meet" },
  "description": {
    "fa": "یک جلسه آزمایشی بسازید و لینک آن را در یادداشت معامله ثبت کنید.",
    "en": "Create a mock meeting and save its link as a deal note."
  },
  "loadOnOpen": false,
  "sections": [{
    "id": "meeting-information",
    "title": { "fa": "اطلاعات جلسه", "en": "Meeting information" },
    "items": [
      {
        "type": "text",
        "key": "customerEmail",
        "label": { "fa": "ایمیل مشتری", "en": "Customer email" },
        "required": false,
        "maxLength": 320
      },
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
        "required": true,
        "maxLength": 2000
      },
      {
        "type": "checkbox",
        "key": "isUsePersonEmail",
        "label": { "fa": "استفاده از ایمیل شخص معامله", "en": "Use the deal person's email" },
        "required": false,
        "defaultValue": false
      }
    ]
  }],
  "submit": {
    "label": { "fa": "ایجاد جلسه", "en": "Create meeting" },
    "closeOnSuccess": true,
    "successMessage": {
      "fa": "جلسه ایجاد و به یادداشت‌های معامله اضافه شد.",
      "en": "The meeting was created and added to the deal notes."
    }
  }
}
```

بعد از submit، `context.payload` این‌طور است:

```json title="context.payload"
{
  "customerEmail": "customer@example.com",
  "inviterEmail": "sales@example.com",
  "meetingDescription": "جلسه معرفی محصول",
  "isUsePersonEmail": false
}
```

endpoint تو با یک پاسخ JSON کوتاه جواب می‌دهد و دیدار بر اساس آن پیام موفقیت یا خطا نشان می‌دهد. [قرارداد پاسخ](/api-app-endpoints#json-response)

## HTTPS و CORS برای اکستنشن‌های JSON {#cors}

اکستنشن JSON با fetch مرورگر صدا زده می‌شود؛ endpoint باید HTTPS باشد و origin دقیق دیدار را مجاز کند:

```http title="Response headers"
Access-Control-Allow-Origin: https://app.didar.me
Vary: Origin
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

> [!WARNING]
> از wildcard (`*`) استفاده نکن؛ اگر محیط دیگری داری، allowlist صریح بساز. CORS جای launchCode، token و validation سمت سرور را نمی‌گیرد.

## اکستنشن‌های iframe (Custom modal و Custom panel) {#iframe}

دیدار Iframe URL تو را با `?launchCode=…` داخل modal یا پنل باز می‌کند. صفحه‌ی تو باید کد را در backend به token تبدیل کند و بعد UI خودش را نشان بدهد. دیدار تم روشن و تیره دارد؛ مطمئن شو UI تو در هر دو خواناست.

### Custom modal و Entry point {#custom-modal}

Developer Hub برای هر Custom modal یک **ID** می‌سازد که قابل کپی است. Entry pointها همان Locationهای منوی عملیات‌اند و انتخابشان اختیاری است؛ اگر هیچ Entry pointی انتخاب نکنی، modal فقط از طریق SDK اجرا می‌شود.

## JWT secret {#jwt-secret}

Developer Hub برای هر اکستنشن (و برای App settings از نوع Custom UI) یک JWT secret می‌خواهد. یک رشته‌ی تصادفی و طولانی بساز و آن را مثل Client secret فقط روی سرورت نگه دار.

## هنوز مستند نشده {#open}

> [!WARNING]
> این موارد هنوز در منبع فنی نیامده‌اند و در این داک حدس زده نمی‌شوند: دیدار JWT secret هر اکستنشن را دقیقاً کجا و چطور استفاده می‌کند، قالب «JSON data structure» در JSON panel و نحوه‌ی خواندن داده‌ی پنل از API endpoint، و SDK اجرای Custom modal.

## قدم بعدی {#next}

- [صفحه‌ی تنظیمات](/settings-page)
- [endpointهای اپ تو](/api-app-endpoints): قرارداد دقیق درخواست‌هایی که دیدار به سرور تو می‌فرستد.
