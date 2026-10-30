---
title: JSON modal
section: start
order: 22
lead: JSON modal فرمی است که دیدار از روی یک فایل JSON می‌سازد. کاربر آن را از منوی عملیات باز می‌کند، پر می‌کند و ثبت می‌کند؛ پلاگین تو کار را انجام می‌دهد و نتیجه را برمی‌گرداند و دیدار پیامش را نشان می‌دهد. تو برای این فرم هیچ HTML و CSSی نمی‌نویسی. این صفحه ساختار فرم، تبادل داده هنگام ثبت، قرارداد پاسخ و تمپلیت کدش را توضیح می‌دهد.
description: اکستنشن JSON modal در دیدار؛ کاربرد، جای نمایش، ساختار schema فرم، افزودن در Developer Hub، تبادل داده هنگام submit، قرارداد پاسخ، CORS و تمپلیت کد Node.js، Python، PHP و C#.
---

## JSON modal چیست؟ {#what}

JSON modal یک گزینه در منوی عملیات است که به‌جای بردن کاربر به سایت تو، یک فرم را همان‌جا روی صفحه‌ی دیدار باز می‌کند. کاربر فرم را پر و ثبت می‌کند، پلاگین تو کار را انجام می‌دهد، و دیدار پیام موفقیت یا خطایی را که پلاگین برگردانده نشان می‌دهد. کاربر در تمام این مدت داخل دیدار است.

نکته‌ی اصلی JSON modal این است که **ظاهر فرم را دیدار می‌سازد**. تو فقط تعریف فرم را در یک فایل JSON می‌دهی (چه فیلدهایی دارد، کدام الزامی‌اند، دکمه‌ی ثبت چه متنی دارد) و دیدار آن را با اجزای آماده‌ی خودش، هماهنگ با بقیه‌ی UI دیدار و در هر دو تم، نمایش می‌دهد. پس برای این اکستنشن فقط یک endpoint در backend می‌نویسی.

JSON modal برای کارهایی مناسب است که با یک فرم ساده انجام می‌شوند. چند مثال:

- ساختن جلسه‌ی آنلاین برای یک معامله و ثبت لینکش در یادداشت‌ها ([ساخت اولین پلاگین](/tutorial-first-app) همین را می‌سازد)،
- ثبت یک درخواست در سیستم پشتیبانی،
- ارسال پیامک به یک شخص،
- انجام یک کار گروهی روی چند معامله‌ی انتخاب‌شده در لیست.

اگر فرم تو چندمرحله‌ای است یا UI خاصی می‌خواهد، [Custom modal](/custom-modals) را ببین.

## در UI دیدار کجاست؟ {#visibility}

مثل [Links](/link-actions#visibility): در منوی عملیات صفحه‌های جزئیات، و در صفحه‌های لیست روی ردیف‌های انتخاب‌شده. ظرفیت هر Location منو بین Links، JSON modal و Custom modal مشترک است (حداکثر ۳). [ظرفیت‌ها](/app-extensions#limits)

![اکشن پلاگین در منوی عملیات صفحه‌ی جزئیات معامله](/images/extensions/action-menu-deal.webp "۱. کاربر گزینه‌ی پلاگین را از منوی ⋯ معامله انتخاب می‌کند")

![modal پلاگین روی صفحه‌ی جزئیات معامله](/images/extensions/modal-deal.webp "۲. modal روی همان صفحه باز می‌شود؛ کاربر فرم را پر و ثبت می‌کند")

## ساختار فرم (schema) {#schema}

فرم با یک فایل JSON تعریف می‌شود که در Developer Hub آپلود می‌کنی. همه‌ی متن‌هایی که کاربر می‌بیند دوزبانه‌اند (`fa` و `en`)، چون دیدار آن‌ها را به زبان کاربر نشان می‌دهد.

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

مهم‌ترین کلید هر جزء **`key`** است. وقتی کاربر فرم را ثبت می‌کند، مقدار هر جزء با همان `key` در `context.payload` به پلاگین تو می‌رسد. پس keyها را مثل نام فیلدهای یک API انتخاب کن: یکتا، ثابت و بدون فاصله، چون کد backend تو به آن‌ها وابسته است.

این نمونه‌ی رسمی فرمی برای ساختن جلسه است:

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

## قدم‌های ساخت {#create}

1. **کاربرد را مشخص کن.** کاربر از کدام صفحه و روی چه رکوردی این فرم را باز می‌کند؟ جواب این سؤال Locationها و `entityType`ی را که backend باید انتظار داشته باشد مشخص می‌کند.
2. **اجزای فرم را انتخاب کن** و برای هرکدام یک `key` یکتا بگذار.
3. **schema را بنویس** و مطمئن شو JSON معتبر است؛ Developer Hub فایل نامعتبر را نمی‌پذیرد.
4. **endpoint را بساز** که `launchCode` را به token تبدیل کند، `payload` را validate کند، کار را انجام دهد و پاسخ JSON برگرداند.
5. **CORS را برای origin دیدار باز کن.**
6. **اکستنشن را در Developer Hub اضافه کن.**

### افزودن در Developer Hub {#add}

در تب **App extensions**، کارت **JSON modal** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Action name **(الزامی)** | متن گزینه در منوی عملیات؛ حداکثر ۳۰ کاراکتر. |
| Action description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| API endpoint **(الزامی)** | endpoint پلاگین تو که ثبت فرم به آن می‌رسد؛ URL معتبر و HTTPS. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| JSON schema **(الزامی)** | فایل `.json` معتبر. فایل نامعتبر پذیرفته نمی‌شود. |
| Locations **(الزامی)** | حداقل یک Location؛ حداکثر ۳ اکستنشن منو در هر Location. |

## وقتی کاربر فرم را ثبت می‌کند {#submit}

1. کاربر فرم را پر می‌کند و دکمه‌ی ثبت را می‌زند.
2. دیدار API endpoint تو را با یک `launchCode` تازه صدا می‌زند. این درخواست با **fetch مرورگر** فرستاده می‌شود، نه از سرور دیدار؛ برای همین CORS لازم است.
3. سرور تو کد را به [Runtime Token](/runtime-token) تبدیل می‌کند. مقادیر فرم در `context.payload` و رکوردها در `context.entityIds` هستند:

```json title="context.payload"
{
  "customerEmail": "customer@example.com",
  "inviterEmail": "sales@example.com",
  "meetingDescription": "جلسه معرفی محصول",
  "isUsePersonEmail": false
}
```

4. سرور تو `payload` را **دوباره** validate می‌کند (الزامی بودن، نوع، طول، قالب). حتی اگر در schema قواعدی مثل `required` و `maxLength` گذاشته‌ای، `payload` ورودی کاربر است و endpoint تو باید مثل هر API دیگری با آن رفتار کند.
5. سرور تو کار را انجام می‌دهد و یک پاسخ JSON با قرارداد زیر برمی‌گرداند. دیدار بر اساس `succeeded` و `message` به کاربر پیام نشان می‌دهد.

### قرارداد پاسخ {#response}

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

| فیلد | نوع | توضیح |
| --- | --- | --- |
| `succeeded` | boolean | الزامی. نتیجه‌ی عملیات. |
| `message` | string | پیامی که به کاربر نشان داده می‌شود. در خطا الزامی است؛ آن را برای کاربر بنویس، نه برای برنامه‌نویس. |
| `data` | object | اختیاری؛ داده‌ی دلخواه پلاگین. |

[قرارداد کامل پاسخ](/api-app-endpoints#json-response)

### CORS {#cors}

چون endpoint با fetch مرورگر از داخل دیدار صدا زده می‌شود، مرورگر جواب را فقط وقتی به دیدار می‌دهد که endpoint تو origin دیدار را مجاز کرده باشد. endpoint باید HTTPS باشد، به درخواست `OPTIONS` جواب بدهد، و دقیقاً origin دیدار را مجاز کند:

```http title="Response headers"
Access-Control-Allow-Origin: https://app.didar.me
Vary: Origin
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

> [!WARNING]
> از wildcard (`*`) استفاده نکن. CORS فقط به مرورگر می‌گوید چه کسی جواب را بخواند؛ جای launchCode، token و validation سمت سرور را نمی‌گیرد.

## تمپلیت کد {#template}

این تمپلیت فرمی را پیاده می‌کند که روی یک یا چند معامله یادداشت ثبت می‌کند: CORS را باز می‌کند، کد را تبدیل می‌کند، `payload` را دوباره چک می‌کند، روی هر معامله‌ی `entityIds` یک یادداشت می‌سازد و پاسخ را با قرارداد بالا برمی‌گرداند. آدرس آن (`/didar/note-form`) را در فیلد API endpoint ثبت کن. scope لازم: **Activities · Full access**. از کلاینت مشترک [Runtime Token](/runtime-token#template) استفاده می‌کند.

فرمی که این تمپلیت انتظار دارد فقط یک جزء دارد:

```json title="form.json (برای تمپلیت)"
{
  "schemaVersion": 1,
  "layout": "form",
  "title": { "fa": "ثبت یادداشت", "en": "Add note" },
  "description": { "fa": "روی معامله‌های انتخاب‌شده یادداشت ثبت کنید.", "en": "Add a note to the selected deals." },
  "loadOnOpen": false,
  "sections": [{
    "id": "note",
    "title": { "fa": "یادداشت", "en": "Note" },
    "items": [
      { "type": "textarea", "key": "noteText", "label": { "fa": "متن یادداشت", "en": "Note text" }, "required": true, "maxLength": 2000 }
    ]
  }],
  "submit": {
    "label": { "fa": "ثبت", "en": "Save" },
    "closeOnSuccess": true,
    "successMessage": { "fa": "یادداشت ثبت شد.", "en": "Note saved." }
  }
}
```

<!--TEMPLATE:json-modal-->

## هنوز مستند نشده {#open}

> [!WARNING]
> این موارد هنوز در منبع فنی نیامده‌اند و در این داک حدس زده نمی‌شوند: فهرست کامل انواع اجزای فرم بیشتر از `text`، `textarea` و `checkbox`، رفتار دقیق `loadOnOpen`، و حداکثر حجم فایل schema.

## بعد از این بخوان {#read-next}

- [ساخت اولین پلاگین](/tutorial-first-app): یک JSON modal کامل، قدم‌به‌قدم.
- [JSON panel](/json-panels)
- [endpointهای پلاگین تو](/api-app-endpoints)
