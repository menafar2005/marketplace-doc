---
title: واژه‌نامه
section: start
order: 6
lead: اصطلاح‌های فنی این داک انگلیسی می‌مانند. این صفحه هرکدام را یک‌بار تعریف می‌کند.
description: تعریف اصطلاحات مارکت‌پلیس دیدار.
---

| اصطلاح | معنی |
| --- | --- |
| BizDomain | کسب‌وکار (tenant) در دیدار. هر نصب اپ به یک BizDomain وصل است. |
| اپ Third-party | اپ توسعه‌دهنده‌ی بیرونی که روی مارکت‌پلیس ثبت و در دیدار نصب می‌شود. |
| ClientId / ClientSecret | شناسه‌ی عمومی اپ و اثبات هویت اپ در تبادل code؛ Secret فقط در backend. |
| Installation URL | آدرسی که کاربر را به صفحه‌ی نصب دیدار می‌برد؛ هنگام ثبت اپ تولید می‌شود. |
| CallbackUrl | مسیر HTTPS ثبت‌شده برای بازگشت `code` نصب. |
| ApiKey (کلید نصب) | کلیدی که پس از `CompleteInstallation` می‌گیری؛ فقط رمزگذاری‌شده در secret store. |
| scope | سطح دسترسی تأییدشده‌ی اپ هنگام نصب، مثل `deals` یا `deals.fullaccess`. |
| state | مقدار تصادفی یک‌بارمصرف که callback نصب را به session درست متصل می‌کند. |
| Extension (اکستنشن) | قابلیت اپ داخل UI دیدار؛ از نوع IFrame، Link یا Json. |
| Location | محلی از UI دیدار که اکستنشن در آن اجرا می‌شود (مثلاً جزئیات معامله). |
| launchCode | کد کوتاه‌عمر و یک‌بارمصرف که دیدار هنگام اجرا به endpoint اپ می‌فرستد. |
| Runtime Token | JWT کوتاه‌عمر که backend اپ با launchCode می‌گیرد؛ فقط برای همان اجرا. |
| Runtime Context | `target`، `runtimeId`، `location`، `entityType`، `entityIds` و `payload` همان اجرا. |
| payload | مقادیر فرم JSON که بر اساس keyهای schema جمع‌آوری شده‌اند؛ untrusted input. |
| envelope | قالب استاندارد پاسخ مارکت‌پلیس: `succeeded`، `data`، `error`، `meta`. |
| traceId | شناسه‌ی پیگیری خطا برای پشتیبانی. |
| API پروکسی | APIهای `marketplace.didar.me` که با Runtime Token به داده‌ی CRM دسترسی کنترل‌شده می‌دهند. |
