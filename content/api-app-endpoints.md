---
title: endpointهای اپ تو
section: reference
order: 3
lead: این endpointها را تو روی سرورت پیاده می‌کنی و دیدار آن‌ها را صدا می‌زند. این صفحه قرارداد هرکدام را مشخص می‌کند - چه چیزی دریافت می‌کنی و چه چیزی باید برگردانی.
description: قرارداد Callback URL نصب، URL اکستنشن‌ها (launchCode)، پاسخ JSON اکستنشن‌های فرم و URL صفحه‌ی تنظیمات.
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

**چه برگردانی:** بسته به نوع اکستنشن:

| نوع | پاسخ |
| --- | --- |
| Links | صفحه‌ی HTML اپ تو |
| Custom modal / Custom panel | صفحه‌ی HTML که داخل iframe دیدار نمایش داده می‌شود |
| JSON modal | پاسخ JSON ([پایین](#json-response)) |

## پاسخ اکستنشن JSON {#json-response}

بعد از submit فرم JSON، دیدار پاسخ endpoint تو را می‌خواند و بر اساس آن پیام نشان می‌دهد:

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
| `message` | string | پیامی که به کاربر نشان داده می‌شود. در خطا الزامی است. |
| `data` | object | اختیاری؛ داده‌ی دلخواه اپ. |

این قرارداد پیام فقط برای submit فرم JSON است؛ برای iframe و لینک، دیدار آن را پردازش نمی‌کند.

چون فرم JSON با fetch مرورگر صدا زده می‌شود، endpoint باید CORS را برای origin دقیق دیدار باز کند:

```http title="Response headers"
Access-Control-Allow-Origin: https://app.didar.me
Vary: Origin
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## URL صفحه‌ی تنظیمات {#settings}

```http title="درخواستی که از دیدار می‌رسد"
GET https://your-app.example.com/didar/settings?launchCode=ONE_TIME_CODE
```

مثل URL اکستنشن است؛ فقط `context.target` برابر `settings_page` است و رکوردی ندارد. **کجا ثبت می‌شود:** App settings ← URL (External link) یا Iframe URL (Custom UI). [App settings](/app-settings)
