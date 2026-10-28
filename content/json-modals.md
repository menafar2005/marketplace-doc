---
title: JSON modal
section: start
order: 22
lead: JSON modal فرمی است که دیدار از روی یک فایل JSON می‌سازد. کاربر آن را از منوی عملیات باز می‌کند، پر می‌کند و ثبت می‌کند؛ اپ تو کار را انجام می‌دهد و نتیجه را برمی‌گرداند، بی‌آنکه frontend بنویسی.
description: اکستنشن JSON modal در دیدار؛ جای نمایش، ساختار schema فرم، افزودن در Developer Hub، تبادل داده هنگام submit و پاسخ اپ.
---

## JSON modal چیست؟ {#what}

JSON modal یک اکشن به‌شکل modal است که با آن کاربر کاری را کامل داخل دیدار انجام می‌دهد. چند مثال: ساختن جلسه‌ی آنلاین برای یک معامله، ثبت درخواست در سیستم پشتیبانی، یا ارسال پیامک به یک شخص.

ظاهر فرم را دیدار با اجزای آماده‌ی خودش می‌سازد؛ تو فقط تعریف فرم (JSON schema) و endpointی که submit به آن می‌رسد را می‌دهی.

## در UI دیدار کجاست؟ {#visibility}

مثل [Links](/link-actions#visibility): در منوی عملیات صفحه‌های جزئیات، و در صفحه‌های لیست روی ردیف‌های انتخاب‌شده. ظرفیت هر Location منو بین Links، JSON modal و Custom modal مشترک است (حداکثر ۳). [ظرفیت‌ها](/app-extensions#limits)

![اکشن اپ در منوی عملیات صفحه‌ی جزئیات معامله](/images/extensions/action-menu-deal.webp "۱. کاربر اکشن اپ را از منوی ⋯ معامله انتخاب می‌کند")

![modal اپ روی صفحه‌ی جزئیات معامله](/images/extensions/modal-deal.webp "۲. modal روی همان صفحه باز می‌شود؛ کاربر فرم را پر و ثبت می‌کند")

## ساختار schema {#schema}

schema از این بخش‌ها ساخته می‌شود. متن‌ها دوزبانه‌اند (`fa` و `en`).

| کلید | توضیح |
| --- | --- |
| `schemaVersion` | نسخه‌ی قالب schema؛ در نمونه `1`. |
| `layout` | نوع چیدمان؛ در نمونه `form`. |
| `title`، `description` | عنوان و توضیح بالای فرم. |
| `loadOnOpen` | در نمونه `false`. |
| `sections[]` | بخش‌های فرم؛ هرکدام `id`، `title` و `items[]` دارد. |
| `sections[].items[]` | اجزای فرم. هر جزء `type`، `key` و `label` دارد و می‌تواند `required`، `maxLength` و `defaultValue` داشته باشد. |
| `submit` | دکمه‌ی ثبت: `label`، `closeOnSuccess` و `successMessage`. |

نوع اجزایی که در نمونه‌ی رسمی آمده‌اند: `text`، `textarea` و `checkbox`.

مقدار هر جزء با همان `key` در `context.payload` به اپ تو می‌رسد.

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

## JSON modal را چطور بسازم؟ {#create}

### قدم‌های کلیدی {#key-steps}

1. **کاربرد را مشخص کن:** کاربر از کدام صفحه و روی چه رکوردی این فرم را باز می‌کند؟
2. **اجزای فرم را انتخاب کن** و برای هرکدام یک `key` یکتا بگذار.
3. **schema را بنویس** و مطمئن شو JSON معتبر است.
4. **endpoint را بساز** که `launchCode` را به token تبدیل کند، `payload` را validate کند، کار را انجام دهد و پاسخ JSON برگرداند.
5. **CORS را برای origin دیدار باز کن.**
6. **اکستنشن را در Developer Hub اضافه کن.**

### افزودن در Developer Hub {#add}

در تب **App extensions**، کارت **JSON modal** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Action name **(الزامی)** | حداکثر ۳۰ کاراکتر. |
| Action description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| API endpoint **(الزامی)** | endpoint اپ تو؛ URL معتبر و HTTPS. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| JSON schema **(الزامی)** | فایل `.json` معتبر. فایل نامعتبر پذیرفته نمی‌شود. |
| Locations **(الزامی)** | حداقل یک Location؛ حداکثر ۳ اکستنشن منو در هر Location. |

## تبادل داده هنگام submit {#submit}

1. کاربر فرم را پر می‌کند و ثبت می‌کند.
2. دیدار API endpoint تو را با یک `launchCode` تازه صدا می‌زند (fetch مرورگر).
3. سرور تو کد را به [Runtime Token](/runtime-token) تبدیل می‌کند. مقادیر فرم در `context.payload` و رکوردها در `context.entityIds` هستند:

```json title="context.payload"
{
  "customerEmail": "customer@example.com",
  "inviterEmail": "sales@example.com",
  "meetingDescription": "جلسه معرفی محصول",
  "isUsePersonEmail": false
}
```

4. سرور تو `payload` را دوباره validate می‌کند (الزامی بودن، نوع، طول، قالب)، کار را انجام می‌دهد و پاسخ JSON برمی‌گرداند:

```json title="موفق"
{
  "succeeded": true,
  "message": "جلسه ساخته شد و یادداشت معامله ذخیره شد.",
  "data": {
    "dealId": "704e1533-cb4b-42d7-895d-ef71ff32ba5b",
    "url": "https://meet.google.com/mock-53c79f7df0"
  }
}
```

```json title="خطا"
{
  "succeeded": false,
  "message": "ایمیل دعوت‌کننده معتبر نیست."
}
```

دیدار بر اساس `succeeded` و `message` به کاربر پیام نشان می‌دهد. [قرارداد کامل پاسخ](/api-app-endpoints#json-response)

### CORS {#cors}

چون endpoint با fetch مرورگر صدا زده می‌شود، باید HTTPS باشد و origin دقیق دیدار را مجاز کند:

```http title="Response headers"
Access-Control-Allow-Origin: https://app.didar.me
Vary: Origin
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

> [!WARNING]
> از wildcard (`*`) استفاده نکن. CORS جای launchCode، token و validation سمت سرور را نمی‌گیرد.

## هنوز مستند نشده {#open}

> [!WARNING]
> این موارد هنوز در منبع فنی نیامده‌اند و در این داک حدس زده نمی‌شوند: فهرست کامل انواع اجزای فرم بیشتر از `text`، `textarea` و `checkbox`، رفتار دقیق `loadOnOpen`، و حداکثر حجم فایل schema.

## بعد از این بخوان {#read-next}

- [JSON panel](/json-panels)
- [آموزش ساخت اولین اپ](/tutorial-first-app): همین فرم، با کد کامل.
- [endpointهای اپ تو](/api-app-endpoints)
