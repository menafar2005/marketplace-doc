---
title: App settings
section: start
order: 27
lead: اگر اپ تو برای هر کسب‌وکار پیکربندی جدا لازم دارد (مثلاً کلید API یک سرویس بیرونی)، یک App settings بساز. کاربر با یک کلیک از فهرست اپ‌های نصب‌شده به آن می‌رسد.
description: اکستنشن App settings در دیدار؛ External link یا Custom UI، جای نمایش، افزودن در Developer Hub، Runtime Context صفحه‌ی تنظیمات و الگوی پیشنهادی.
---

## App settings چیست؟ {#what}

صفحه‌ی تنظیمات اپ تو، به یکی از دو شکل:

| نوع | رفتار | مقدار فنی |
| --- | --- | --- |
| **External link** | صفحه‌ی تنظیمات تو در یک tab جدید مرورگر باز می‌شود. | `ExternalLink` (1) |
| **Custom UI** | یک iframe کاملاً سفارشی داخل بخش تنظیمات دیدار؛ UI را با HTML، CSS و JavaScript خودت می‌سازی. | `CustomUI` (2) |

## در UI دیدار کجاست؟ {#visibility}

کاربر در دیدار وارد فهرست **اپ‌های نصب‌شده** می‌شود، اپ تو را پیدا می‌کند و **تنظیمات** آن را باز می‌کند. اگر نوع External link باشد به URL تو می‌رود؛ اگر Custom UI باشد، UI اپ داخل دیدار نمایش داده می‌شود.

## App settings را چطور اضافه کنم؟ {#add}

در Developer Hub، تب **App extensions**، کارت **App settings** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Type **(الزامی)** | `External link` یا `Custom UI`. |
| URL | برای External link الزامی؛ URL معتبر. |
| Iframe URL | برای Custom UI الزامی؛ فقط HTTPS. |
| JWT secret | برای Custom UI الزامی. [توضیح](/custom-ui-extensions#jwt-secret) |

هر اپ فقط **یک** App settings دارد. اگر داری، کارت App settings دیگر اکستنشن تازه نمی‌سازد؛ همان را Edit یا Delete کن.

## صفحه‌ی تنظیمات چطور باز می‌شود؟ {#flow}

1. کاربر تنظیمات اپ را در دیدار باز می‌کند.
2. دیدار برای اپ نصب‌شده یک `launchCode` می‌سازد و URL تنظیمات تو را با `?launchCode=…` باز می‌کند.
3. backend تو کد را به [Runtime Token](/runtime-token) تبدیل می‌کند.
4. اپ تنظیمات همان BizDomain را می‌خواند یا ذخیره می‌کند.

context صفحه‌ی تنظیمات به رکورد خاصی وصل نیست:

```json title="context"
{
  "target": "settings_page",
  "runtimeId": "APP_PUBLIC_ID",
  "location": null,
  "entityType": null,
  "entityIds": [],
  "payload": {}
}
```

`runtimeId` همان `AppPublicId` است که هنگام [تکمیل نصب](/installation-authorization#step-4) گرفتی. tenant و کاربر فعلی داخل خود token هستند؛ اپ نباید `BizDomainId` را از query بپذیرد.

## الگوی پیشنهادی {#pattern}

- `launchCode` را در backend تبدیل کن.
- بعد از تبدیل، یک session امن و کوتاه برای UI خودت بساز؛ Runtime Token را در `localStorage` نگذار.
- تنظیمات را با کلید نصب یا BizDomain ذخیره کن، نه با ایمیل یا نام کاربر.
- برای تغییرات حساس، محافظت CSRF و احراز هویت مجدد اضافه کن.
- دسترسی به داده‌ی دیدار در صفحه‌ی تنظیمات هم تابع scopeهای نصب است.

## بعد از این بخوان {#read-next}

- [درباره‌ی Custom UI](/custom-ui-extensions)
- [جریان نصب اپ](/app-installation-flows): بعد از نصب، ادمین را به تنظیمات اپ ببر.
