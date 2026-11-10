---
title: JSON modal
section: start
order: 22
lead: JSON modal فرمی است که دیدار از روی یک فایل JSON می‌سازد. کاربر آن را از منوی عملیات باز می‌کند، پر می‌کند و ثبت می‌کند؛ پلاگین تو کار را انجام می‌دهد و نتیجه را برمی‌گرداند و دیدار پیامش را نشان می‌دهد. تو برای این فرم هیچ HTML و CSSی نمی‌نویسی. این صفحه ساختار فرم، تبادل داده هنگام ثبت، قرارداد پاسخ و تمپلیت کدش را توضیح می‌دهد.
description: اکستنشن JSON modal در دیدار؛ کاربرد، جای نمایش، ساختار schema فرم (نسخه‌ی ۱)، افزودن در Developer Hub، رویدادهای extension.load و extension.submit، قرارداد پاسخ ok/message/errors/close، CORS و تمپلیت کد Node.js، Python، PHP و C#.
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

فرم با یک فایل JSON تعریف می‌شود که در Developer Hub آپلود می‌کنی؛ برای فرم، `layout` برابر `form` است. مرجع کامل این ساختار (همه‌ی فیلدها، انواع آیتم، محدودیت‌ها و فایل JSON Schema ماشین‌خوان) در صفحه‌ی [ساختار JSON اکستنشن](/json-extension-schema) است. خلاصه‌اش:

| کلید | توضیح |
| --- | --- |
| `schemaVersion` | **الزامی.** نسخه‌ی قالب؛ در نسخه‌ی فعلی `1`. |
| `layout` | **الزامی.** برای فرم قابل ثبت `form`. |
| `title`، `description` | عنوان و توضیح بالای فرم. |
| `loadOnOpen` | اگر `true` باشد، دیدار هنگام باز شدن فرم مقدارهای اولیه را از endpoint تو می‌گیرد ([extension.load](/api-app-endpoints#json-load)). |
| `sections[]` | **الزامی.** ۱ تا ۲۰ بخش؛ هرکدام `id` یکتا و ۱ تا ۵۰ آیتم در `items[]` دارد. |
| `sections[].items[]` | اجزای فرم. ورودی‌ها: `text`، `textarea`، `number`، `date`، `select`، `radio`، `checkbox`. نمایشی‌ها: `value`، `link`، `message`، `divider`. |
| `submit` | دکمه‌ی ثبت: `label`، `closeOnSuccess` و `successMessage`. |

همه‌ی متن‌هایی که کاربر می‌بیند می‌توانند رشته‌ی ساده یا شیء سه‌زبانه (`fa`، `en`، `ar`) باشند؛ دیدار آن‌ها را به زبان فعال کاربر نشان می‌دهد و اگر ترجمه‌ی آن زبان نباشد، به‌ترتیب از فارسی، انگلیسی و عربی استفاده می‌کند. [متن‌های سه‌زبانه](/json-extension-schema#localized-text)

مهم‌ترین کلید هر جزء ورودی **`key`** است. وقتی کاربر فرم را ثبت می‌کند، مقدار هر جزء با همان `key` در `values` بدنه‌ی درخواست به پلاگین تو می‌رسد، و خطایی که برای همان `key` برگردانی کنار همان فیلد نمایش داده می‌شود. پس keyها را مثل نام فیلدهای یک API انتخاب کن: در کل فرم یکتا، ثابت و بدون فاصله، چون کد backend تو به آن‌ها وابسته است.

این نمونه فرمی برای ساختن جلسه است:

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

نمونه‌ی کامل‌تر با همه‌ی انواع آیتم (`select`، `radio`، `number`، `date`، `message`، `value`، `link` و `divider`): [نمونه‌ی کامل](/json-extension-schema#full-example)

## قدم‌های ساخت {#create}

1. **کاربرد را مشخص کن.** کاربر از کدام صفحه و روی چه رکوردی این فرم را باز می‌کند؟ جواب این سؤال Locationها و `entityType`ی را که backend باید انتظار داشته باشد مشخص می‌کند.
2. **اجزای فرم را انتخاب کن** و برای هرکدام یک `key` یکتا بگذار.
3. **schema را بنویس** و پیش از آپلود با [فایل JSON Schema](/json-extension-schema#machine-readable) چکش کن؛ Developer Hub فایل نامعتبر را نمی‌پذیرد و دیدار ساختار نامعتبر را رندر نمی‌کند.
4. **endpoint را بساز** که درخواست `POST` با بدنه‌ی JSON بپذیرد: برای `extension.submit` مقدارهای `values` را validate کند، کار را انجام دهد و پاسخ JSON برگرداند؛ اگر `loadOnOpen` روشن است، `extension.load` را هم جواب بدهد.
5. **CORS را برای origin دیدار باز کن** (برای `POST`).
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

## وقتی فرم باز و ثبت می‌شود {#submit}

دیدار endpoint تو را با `POST` و بدنه‌ی JSON صدا می‌زند. این درخواست با **fetch مرورگر** از داخل دیدار فرستاده می‌شود، نه از سرور دیدار؛ برای همین [CORS](#cors) لازم است. فیلد `event` می‌گوید درخواست برای چیست:

| `event` | کی | چه برگردانی |
| --- | --- | --- |
| `extension.load` | هنگام باز شدن فرم، فقط اگر `loadOnOpen` برابر `true` باشد | مقدارهای اولیه‌ی فیلدها در `data.values` |
| `extension.submit` | وقتی کاربر دکمه‌ی ثبت را می‌زند | نتیجه‌ی ثبت: `ok`، `message`، و در خطا `errors` |

```json title="بدنه‌ی extension.submit"
{
  "event": "extension.submit",
  "runtimeId": "9de20339-d819-481a-a90c-79f66692413d",
  "context": {
    "location": 2,
    "locale": "fa",
    "entityId": "704e1533-cb4b-42d7-895d-ef71ff32ba5b"
  },
  "values": {
    "customerEmail": "customer@example.com",
    "inviterEmail": "sales@example.com",
    "meetingDescription": "جلسه معرفی محصول",
    "isUsePersonEmail": false
  }
}
```

1. کاربر فرم را پر می‌کند و دکمه‌ی ثبت را می‌زند. دیدار پیش از ارسال، قواعد schema (مثل `required` و `maxLength`) را در UI چک می‌کند.
2. دیدار درخواست `extension.submit` را به endpoint تو می‌فرستد. مقدار هر فیلد با همان `key` در `values` است.
3. سرور تو `values` را **دوباره** validate می‌کند (الزامی بودن، نوع، طول، قالب). اعتبارسنجی UI دیدار جای اعتبارسنجی سمت سرور تو را نمی‌گیرد؛ `values` ورودی کاربر است.
4. سرور تو کار را انجام می‌دهد (برای کار با داده‌ی دیدار، با [Runtime Token](/runtime-token)) و پاسخ JSON برمی‌گرداند. دیدار بر اساس `ok` و `message` به کاربر پیام نشان می‌دهد، خطای هر فیلد را کنار همان فیلد می‌گذارد و اگر `close` (یا `submit.closeOnSuccess`) بخواهد، modal را می‌بندد.

`context` بدنه می‌گوید کاربر کجاست: `location` محل اجرا، `locale` زبان فعال دیدار (`fa`، `en` یا `ar`)، و در صفحه‌ی جزئیات `entityId`؛ در اجرای گروهی روی لیست به‌جایش `entityIds` می‌آید و اگر کاربر همه‌ی نتایج را انتخاب کرده باشد `allSelected` برابر `true` است. به وجود همه‌ی این فیلدها تکیه نکن؛ فقط مقدارهای مرتبط با محل جاری را بررسی کن. این بدنه از مرورگر می‌آید، پس برای کار با داده‌ی دیدار، شناسه‌ی رکوردها را از Runtime Context بخوان. [قرارداد کامل endpoint](/api-app-endpoints#json-extension)

### قرارداد پاسخ {#response}

```json title="موفق"
{
  "ok": true,
  "message": "جلسه ساخته شد و یادداشت معامله ذخیره شد.",
  "close": true
}
```

```json title="ناموفق، با خطای فیلدها"
{
  "ok": false,
  "message": "بعضی از مقادیر معتبر نیستند.",
  "errors": {
    "inviterEmail": "ایمیل دعوت‌کننده معتبر نیست."
  }
}
```

| فیلد | نوع | توضیح |
| --- | --- | --- |
| `ok` | boolean | الزامی. نتیجه‌ی عملیات. |
| `message` | string | پیامی که به کاربر نشان داده می‌شود؛ آن را برای کاربر بنویس، نه برای برنامه‌نویس. |
| `errors` | object | در خطا: کلید هر پراپرتی همان `key` فیلد و مقدارش پیام خطای آن فیلد است. |
| `close` | boolean | modal پس از پاسخ بسته شود. |
| `data` | object | برای `extension.load`: مقدارهای اولیه در `data.values`. |

[قرارداد کامل پاسخ](/api-app-endpoints#json-response)

### CORS {#cors}

چون endpoint با fetch مرورگر از داخل دیدار صدا زده می‌شود، مرورگر جواب را فقط وقتی به دیدار می‌دهد که endpoint تو مبدأهای رسمی دیدار را در سیاست CORS مجاز کرده باشد. endpoint باید HTTPS باشد، درخواست `POST` با بدنه‌ی JSON را بپذیرد و به درخواست `OPTIONS` جواب بدهد:

```http title="Response headers"
Access-Control-Allow-Origin: https://app.didar.me
Vary: Origin
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

> [!WARNING]
> از wildcard (`*`) استفاده نکن. CORS فقط به مرورگر می‌گوید چه کسی جواب را بخواند؛ جای Runtime Token و validation سمت سرور را نمی‌گیرد.

## تمپلیت کد {#template}

این تمپلیت فرمی را پیاده می‌کند که روی یک یا چند معامله یادداشت ثبت می‌کند: CORS را برای `POST` باز می‌کند، به `extension.load` مقدار اولیه می‌دهد، در `extension.submit` مقدار `values` را دوباره چک می‌کند و خطای فیلد را برمی‌گرداند، کد را به Runtime Token تبدیل می‌کند، روی هر معامله‌ی `entityIds` یک یادداشت می‌سازد و پاسخ را با قرارداد بالا برمی‌گرداند. آدرس آن (`/didar/note-form`) را در فیلد API endpoint ثبت کن. scope لازم: **Activities · Full access**. از کلاینت مشترک [Runtime Token](/runtime-token#template) استفاده می‌کند.

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
> قرارداد جدید تیم فنی (`extension.load` و `extension.submit`) نمی‌گوید endpoint اکستنشن JSON چطور به Runtime Token می‌رسد. تمپلیت‌های این داک فرض می‌کنند دیدار مثل بقیه‌ی اکستنشن‌ها `launchCode` را به آدرس endpoint اضافه می‌کند ([Runtime Token](/runtime-token)). این فرض و رابطه‌ی `values` بدنه با `context.payload` در Runtime Context هنوز باید با تیم فنی تأیید شود. حداکثر حجم فایل schema هم هنوز منتشر نشده است.

## بعد از این بخوان {#read-next}

- [ساخت اولین پلاگین](/tutorial-first-app): یک JSON modal کامل، قدم‌به‌قدم.
- [ساختار JSON اکستنشن](/json-extension-schema)
- [JSON panel](/json-panels)
- [endpointهای پلاگین تو](/api-app-endpoints)
