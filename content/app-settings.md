---
title: App settings
section: start
order: 27
lead: اگر پلاگین تو برای هر کسب‌وکار پیکربندی جدا لازم دارد، مثلاً کلید API یک سرویس بیرونی یا قواعد کار پلاگین، یک صفحه‌ی App settings بساز. کاربر با یک کلیک از فهرست اپ‌های نصب‌شده به آن می‌رسد. این صفحه دو نوع App settings، نحوه‌ی باز شدن صفحه‌ی تنظیمات، اینکه تنظیمات را با چه کلیدی ذخیره کنی و تمپلیت کدش را توضیح می‌دهد.
description: اکستنشن App settings در دیدار؛ External link یا Custom UI، جای نمایش، افزودن در Developer Hub، Runtime Context صفحه‌ی تنظیمات، ذخیره‌ی تنظیمات برای هر BizDomain و تمپلیت کد Node.js، Python، PHP و C#.
---

## App settings چیست؟ {#what}

پلاگینی که روی چند کسب‌وکار نصب می‌شود، اغلب برای هر کدام تنظیمات متفاوتی لازم دارد. یکی از کسب‌وکارها حساب خودش را در سرویس جلسه‌ی آنلاین دارد، دیگری می‌خواهد پلاگین فقط روی یک pipeline کار کند. **App settings** جایی است که ادمین یا کاربر این تنظیمات را برای کسب‌وکار خودش وارد می‌کند، و از داخل خود دیدار به آن می‌رسد.

App settings یکی از این دو شکل را دارد:

| نوع | رفتار | مقدار فنی |
| --- | --- | --- |
| **External link** | صفحه‌ی تنظیمات تو در یک tab جدید مرورگر باز می‌شود. | `ExternalLink` (1) |
| **Custom UI** | یک iframe کاملاً سفارشی داخل بخش تنظیمات دیدار؛ UI را با HTML، CSS و JavaScript خودت می‌سازی. | `CustomUI` (2) |

اگر پلاگین تو از قبل یک پنل مدیریت وب دارد، External link ساده‌ترین راه است. اگر می‌خواهی کاربر داخل دیدار بماند، Custom UI را انتخاب کن؛ همان سازوکار و نکات امنیتی [Custom UI](/custom-ui-extensions) را دارد.

## در UI دیدار کجاست؟ {#visibility}

کاربر در دیدار وارد فهرست **اپ‌های نصب‌شده** می‌شود، پلاگین تو را پیدا می‌کند و **تنظیمات** آن را باز می‌کند. اگر نوع External link باشد به URL تو می‌رود؛ اگر Custom UI باشد، UI پلاگین داخل دیدار نمایش داده می‌شود.

بعد از نصب، [مسیر نصب](/installation-authorization#step-5) تو هم می‌تواند ادمین را مستقیم به صفحه‌ی تنظیمات راهنمایی کند تا پلاگین را راه‌اندازی کند.

## App settings را چطور اضافه کنم؟ {#add}

در Developer Hub، تب **App extensions**، کارت **App settings** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Type **(الزامی)** | `External link` یا `Custom UI`. |
| URL | برای External link الزامی؛ URL معتبر. |
| Iframe URL | برای Custom UI الزامی؛ فقط HTTPS. |
| JWT secret | برای Custom UI الزامی. [توضیح](/custom-ui-extensions#jwt-secret) |

هر پلاگین فقط **یک** App settings دارد. اگر داری، کارت App settings دیگر اکستنشن تازه نمی‌سازد؛ همان را Edit یا Delete کن.

## صفحه‌ی تنظیمات چطور باز می‌شود؟ {#flow}

صفحه‌ی تنظیمات هم یک اجرا است و مثل بقیه‌ی اکستنشن‌ها از [Runtime Token](/runtime-token) رد می‌شود:

1. کاربر تنظیمات پلاگین را در دیدار باز می‌کند.
2. دیدار برای پلاگین نصب‌شده یک `launchCode` می‌سازد و URL تنظیمات تو را با `?launchCode=…` باز می‌کند.
3. backend تو کد را به Runtime Token تبدیل می‌کند.
4. پلاگین تنظیمات همان BizDomain را می‌خواند یا ذخیره می‌کند.

تفاوت اصلی در context است: صفحه‌ی تنظیمات به رکورد خاصی وصل نیست، پس `target` برابر `settings_page` است و `entityIds` خالی:

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

`runtimeId` همان `AppPublicId` است که هنگام [تکمیل نصب](/installation-authorization#step-4) گرفتی؛ برای همه‌ی نصب‌های پلاگین یکسان است و کسب‌وکار را مشخص نمی‌کند.

## تنظیمات را با چه کلیدی ذخیره کنم؟ {#key}

tenant و کاربر فعلی داخل خود token هستند و پلاگین نباید `BizDomainId` را از query یا فرم بپذیرد؛ وگرنه هر کسی با عوض کردن آدرس می‌تواند تنظیمات کسب‌وکار دیگری را ببیند یا تغییر دهد. راه امن این است که با همان Runtime Token از دیدار بپرسی این اجرا مال کدام کسب‌وکار است:

```bash title="cURL"
curl --location 'https://marketplace.didar.me/api/v1/proxy/biz-domain/info' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Accept: application/json'
```

`data.Response.Id` همان شناسه‌ی BizDomain است و می‌توانی تنظیمات را با آن ذخیره کنی. این endpoint با scope اطلاعات پایه کار می‌کند که همیشه فعال است. [API اطلاعات BizDomain](/api-basic#biz-domain-info)

## الگوی پیشنهادی {#pattern}

- `launchCode` را در backend تبدیل کن.
- بعد از تبدیل، یک session امن و کوتاه برای UI خودت بساز؛ Runtime Token را در `localStorage` نگذار.
- تنظیمات را با شناسه‌ی BizDomain یا کلید نصب ذخیره کن، نه با ایمیل یا نام کاربر.
- برای تغییرات حساس، محافظت CSRF و احراز هویت مجدد اضافه کن.
- دسترسی به داده‌ی دیدار در صفحه‌ی تنظیمات هم تابع scopeهای نصب است.

## تمپلیت کد {#template}

این تمپلیت یک صفحه‌ی تنظیمات Custom UI است: کد را تبدیل می‌کند، از `target` مطمئن می‌شود، BizDomain را از API می‌گیرد، یک session کوتاه با توکن CSRF می‌سازد و فرم تنظیمات را نشان می‌دهد؛ ثبت فرم هم تنظیمات را با همان BizDomain ذخیره می‌کند. آدرس آن (`/didar/settings`) را در فیلد Iframe URL ثبت کن. scope اضافه لازم ندارد. از کلاینت مشترک [Runtime Token](/runtime-token#template) و لایه‌ی ذخیره‌سازی [تکمیل نصب](/installation-authorization#template) استفاده می‌کند.

<!--TEMPLATE:settings-->

## بعد از این بخوان {#read-next}

- [درباره‌ی Custom UI](/custom-ui-extensions)
- [جریان نصب از دید ادمین](/app-installation-flows): بعد از نصب، ادمین را به تنظیمات پلاگین ببر.
