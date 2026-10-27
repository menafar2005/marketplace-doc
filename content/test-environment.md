---
title: حساب و محیط تست
section: start
order: 5
lead: این صفحه کمک می‌کند اپ را پیش از انتشار روی یک BizDomain امتحان کنی و بدانی کدام بخش‌های محیط تست هنوز تأیید نشده‌اند.
description: آنچه امروز درباره‌ی تست اپ روی مارکت‌پلیس دیدار مستند است.
---

## آنچه امروز مستند است {#known}

- نصب، اپ را به یک `BizDomain` وصل می‌کند و یک اپ می‌تواند روی چند BizDomain نصب شود. برای تست، اپ را روی یک BizDomain آزمایشی نصب کن و نتیجه را با `BizDomainId` ذخیره کن.
- هر اجرا با یک `launchCode` یک‌بارمصرف شروع می‌شود. برای تکرار تست، اکستنشن را دوباره از داخل دیدار اجرا کن؛ کد قبلی (`LAUNCH_CODE_ALREADY_USED`) یا منقضی (`LAUNCH_CODE_EXPIRED`) دیگر کار نمی‌کند.
- در نمونه‌ی مستند، Runtime Token حدود ۳۰۰ ثانیه (`expiresInSeconds: 300`) اعتبار دارد.
- نمونه‌ی درخواست‌ها با داده‌ی placeholder (`RUNTIME_ACCESS_TOKEN`، `TRACE_ID`) نوشته شده‌اند؛ پیش از انتشار عمومی، آن‌ها و نام دامنه‌ها را در staging بررسی کن.
- برای تست محلی endpoint launch می‌توانی `launchCode` واقعی را از یک اجرای اکستنشن بگیری و به endpoint محلی (پشت یک tunnel با HTTPS) بدهی.

## چک‌لیست تست {#checklist}

- [ ] نصب: callback یک `code` می‌گیرد و `CompleteInstallation` موفق است.
- [ ] launch: `succeeded: true` و `context` مطابق location مورد انتظار.
- [ ] scope: درخواست خارج از scope، `PROXY_ACCESS_DENIED` (403) می‌گیرد.
- [ ] entity: شناسه‌ی خارج از `entityIds`، `RUNTIME_ENTITY_ACCESS_DENIED` می‌گیرد.
- [ ] کد مصرف‌شده: استفاده‌ی دوباره از همان code، خطای `LAUNCH_CODE_ALREADY_USED` می‌دهد.

## هنوز مستند نشده {#open}

> [!WARNING]
> این موارد هنوز از تیم فنی دریافت نشده‌اند و در این داک حدس زده نمی‌شوند:
> مسیر ساخت خودکار حساب و BizDomain تست بدون درخواست از تیم دیدار، داده‌ی تست، مخزن اپ نمونه، SDK یا کلاینت رسمی، و تفاوت دقیق محیط تست با محیط واقعی.
