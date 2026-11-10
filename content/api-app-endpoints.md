---
title: endpointهای اپ تو
section: reference
order: 3
lead: این endpointها را تو روی سرورت پیاده می‌کنی و دیدار آن‌ها را صدا می‌زند. این صفحه قرارداد هرکدام را مشخص می‌کند - چه چیزی دریافت می‌کنی و چه چیزی باید برگردانی.
description: قرارداد Callback URL نصب، URL اکستنشن‌ها (launchCode و پارامترهای didar_*)، endpoint اکستنشن JSON (extension.load و extension.submit و پاسخ ok/message/errors/close) و URL صفحه‌ی تنظیمات.
---

همه‌ی این آدرس‌ها را در Developer Hub ثبت می‌کنی و همه باید **HTTPS** باشند.

## Callback URL نصب {#callback}

```http title="درخواستی که از دیدار می‌رسد"
GET https://your-app.example.com/didar/callback?code=INSTALLATION_CODE&state=STATE
```

| پارامتر query | توضیح |
| --- | --- |
| `code` | کد نصب. آن را به [`CompleteInstallation`](/api-auth#complete-installation) بفرست. |
| `state` | اگر پیش از فرستادن کاربر به نصب ساخته باشی، همان مقدار برمی‌گردد؛ با session مقایسه کن. |

**کجا ثبت می‌شود:** Developer Hub ← Basic info ← Callback URL.
**چه برگردانی:** این یک redirect مرورگر است؛ پس از تکمیل نصب، یک صفحه‌ی HTML به ادمین نشان بده. [تکمیل نصب](/installation-authorization)

## URL اکستنشن (launch) {#launch}

```http title="درخواستی که از دیدار می‌رسد"
GET https://your-app.example.com/didar/launch?launchCode=ONE_TIME_CODE
```

| پارامتر query | توضیح |
| --- | --- |
| `launchCode` | کد یک‌بارمصرف و کوتاه‌عمر این اجرا. آن را با [`/api/v1/runtime/token`](/api-auth#runtime-token) به Runtime Token تبدیل کن. |

**کجا ثبت می‌شود:** فیلد URL در Links، API endpoint در JSON modal و JSON panel، Iframe URL در Custom modal و Custom panel.

### پارامترهای `didar_*` {#url-params}

برای iframe و لینک، دیدار این پارامترها را هم به آدرس اضافه می‌کند:

| پارامتر | توضیح |
| --- | --- |
| `didar_runtime_id` | شناسه‌ی نمونه‌ی اکستنشن (RuntimeId). |
| `didar_location` | محل اجرا؛ همان مقدار [Locationها](/app-extensions#locations). |
| `didar_locale` | زبان فعال دیدار: `fa`، `en` یا `ar`. |
| `didar_entity_id` | در صفحه‌ی جزئیات: شناسه‌ی رکورد. |
| `didar_entity_ids` | در اجرای گروهی روی لیست: شناسه‌ی رکوردهای انتخاب‌شده. |
| `didar_all_selected` | در اجرای گروهی: کاربر همه‌ی نتایج را انتخاب کرده است. |

از `didar_locale` برای نمایش UI به زبان کاربر استفاده کن. بقیه‌ی این مقادیر از query می‌آیند و کاربر می‌تواند عوضشان کند؛ برای هر کاری که روی داده‌ی دیدار انجام می‌شود، شناسه‌ی رکوردها را فقط از Runtime Context بخوان. صفحه‌ی iframe برای ارتباط با خود دیدار (toast، confirm، بستن popup) از [Marketplace SDK](/marketplace-sdk) استفاده می‌کند.

**چه برگردانی:** بسته به نوع اکستنشن:

| نوع | پاسخ |
| --- | --- |
| Links | صفحه‌ی HTML اپ تو |
| Custom modal / Custom panel | صفحه‌ی HTML که داخل iframe دیدار نمایش داده می‌شود |
| JSON modal / JSON panel | پاسخ JSON ([پایین](#json-extension)) |

## endpoint اکستنشن JSON {#json-extension}

برای [JSON modal](/json-modals) و [JSON panel](/json-panels)، دیدار ساختار JSON تو را رندر می‌کند و API endpoint تو را با `POST` و بدنه‌ی JSON صدا می‌زند. فیلد `event` نوع درخواست را مشخص می‌کند.

### بارگذاری (`extension.load`) {#json-load}

اگر `loadOnOpen` در ساختار JSON روشن باشد، دیدار هنگام باز شدن فرم یا نمایش پنل این درخواست را می‌فرستد:

```json title="درخواستی که از دیدار می‌رسد"
{
  "event": "extension.load",
  "runtimeId": "9de20339-d819-481a-a90c-79f66692413d",
  "context": {
    "location": 4,
    "locale": "fa",
    "entityId": "person-id"
  }
}
```

```json title="پاسخ"
{
  "ok": true,
  "data": {
    "values": {
      "plan": "حرفه‌ای",
      "status": "فعال",
      "subject": "پیگیری قرارداد"
    }
  }
}
```

هر کلید `data.values` همان `key` یک آیتم است: برای فیلدهای ورودی مقدار اولیه و برای آیتم `value` مقداری که نمایش داده می‌شود.

### ثبت فرم (`extension.submit`) {#json-submit}

هنگام ثبت، دیدار مقادیر فرم را با همان `key` هر فیلد در `values` می‌فرستد:

```json title="درخواستی که از دیدار می‌رسد"
{
  "event": "extension.submit",
  "runtimeId": "9de20339-d819-481a-a90c-79f66692413d",
  "context": {
    "location": 4,
    "locale": "fa",
    "entityId": "person-id"
  },
  "values": {
    "subject": "پیگیری قرارداد",
    "priority": "normal",
    "description": "لطفاً امروز بررسی شود.",
    "confirmed": true
  }
}
```

### فیلدهای درخواست {#json-request-fields}

| فیلد | توضیح |
| --- | --- |
| `event` | `extension.load` یا `extension.submit`. |
| `runtimeId` | شناسه‌ی نمونه‌ی اکستنشن (RuntimeId). |
| `context.location` | محل اجرا؛ همان مقدار [Locationها](/app-extensions#locations). |
| `context.locale` | زبان فعال دیدار: `fa`، `en` یا `ar`. |
| `context.entityId` | در صفحه‌ی جزئیات: شناسه‌ی شخص، شرکت یا معامله. |
| `context.entityIds` | در عملیات گروهی روی فهرست‌ها: شناسه‌ی رکوردهای انتخاب‌شده. |
| `context.allSelected` | در عملیات گروهی: `true` اگر کاربر همه‌ی نتایج را انتخاب کرده باشد. |
| `values` | فقط در `extension.submit`: مقادیر فرم با `key` هر فیلد. |

به وجود همه‌ی فیلدهای `context` تکیه نکن؛ فقط مقدارهای مرتبط با محل جاری را بررسی کن. این بدنه از مرورگر می‌آید؛ `values` را دوباره validate کن و برای کار با داده‌ی دیدار، شناسه‌ی رکوردها را از Runtime Context بخوان.

### قرارداد پاسخ {#json-response}

```json title="موفق"
{
  "ok": true,
  "message": "اطلاعات ثبت شد.",
  "close": true
}
```

```json title="ناموفق، همراه با خطای فیلدها"
{
  "ok": false,
  "message": "بعضی از مقادیر معتبر نیستند.",
  "errors": {
    "subject": "عنوان الزامی است."
  }
}
```

| فیلد | نوع | توضیح |
| --- | --- | --- |
| `ok` | boolean | الزامی. نتیجه‌ی عملیات. |
| `message` | string | پیامی که به کاربر نشان داده می‌شود. |
| `errors` | object | خطای فیلدها: کلید همان `key` فیلد و مقدار پیام خطا؛ دیدار آن را روی کنترل مرتبط نمایش می‌دهد. |
| `close` | boolean | modal پس از پاسخ بسته شود. |
| `data` | object | در `extension.load`: مقدارها در `data.values`. |

دیدار برای سازگاری، پاسخی را هم که داخل envelope با نام `Response` و فیلدهای `Succeeded`، `Data`، `Message`، `Errors` و `Close` باشد می‌پذیرد، ولی قالب ترجیحی همین فیلدهای کوچک انگلیسی بالاست.

### CORS {#json-cors}

درخواست‌های اکستنشن JSON با fetch مرورگر از داخل دیدار فرستاده می‌شوند. endpoint باید HTTPS باشد، `POST` با بدنه‌ی JSON بپذیرد و مبدأهای رسمی دیدار را در سیاست CORS مجاز کند:

```http title="Response headers"
Access-Control-Allow-Origin: https://app.didar.me
Vary: Origin
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## URL صفحه‌ی تنظیمات {#settings}

```http title="درخواستی که از دیدار می‌رسد"
GET https://your-app.example.com/didar/settings?launchCode=ONE_TIME_CODE
```

مثل URL اکستنشن است؛ فقط `context.target` برابر `settings_page` است و رکوردی ندارد. **کجا ثبت می‌شود:** App settings ← URL (External link) یا Iframe URL (Custom UI). [App settings](/app-settings)
