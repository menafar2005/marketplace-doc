---
title: امنیت
section: start
order: 30
lead: پلاگین تو به داده‌ی مشتری‌های دیگران دسترسی دارد. این صفحه قواعدی را که همیشه باید رعایت شوند و چک‌لیست پیش از انتشار را یک‌جا آورده است.
description: نگهداری secretها، مرز اعتماد Runtime Context، CORS، retry و idempotency و چک‌لیست امنیتی پیش از انتشار اپ مارکت‌پلیس دیدار.
---

## چه چیزی کجا نگه‌داری شود؟ {#secrets}

| مقدار | کجا | هرگز |
| --- | --- | --- |
| Client secret | secret store سرور | frontend، git، URL، log |
| JWT secret اکستنشن‌ها | secret store سرور | frontend، git، URL، log |
| کلید نصب (`ApiKey`) | دیتابیس، رمزگذاری‌شده | هر جای دیگر |
| Runtime Token | حافظه، فقط تا پایان همان اجرا | `localStorage`، cookie بلندمدت، log |
| launchCode | هیچ‌جا؛ فوراً exchange شود | ذخیره، log، analytics |

## به چه چیزی اعتماد کنی؟ {#trust}

- تنها context معتبر، پاسخ [`/api/v1/runtime/token`](/api-auth#runtime-token) است. شناسه‌ای که از query، فرم یا frontend می‌آید context امنیتی نیست.
- `payload` فرم JSON ورودی کاربر است: الزامی بودن، نوع، طول و قالب را در backend دوباره چک کن و HTML ورودی را sanitize کن.
- در صفحه‌ی تنظیمات، `BizDomainId` را از query نپذیر؛ از نصبی که به token وصل است استفاده کن.

## خطاها را درست مدیریت کن {#errors}

- تصمیم برنامه را بر اساس HTTP status و `error.code` بگیر؛ متن `message` را parse نکن.
- در 401 و 410 token را refresh نکن؛ کاربر باید اکستنشن را دوباره اجرا کند.
- در 403 قابلیت غیرمجاز را به کاربر نشان نده؛ با retry درست نمی‌شود.
- `traceId` خطا را برای پشتیبانی log کن، بدون token.

## Retry و idempotency {#retry}

برای GETها و خطاهای موقت 502 می‌توانی retry محدود با backoff انجام بدهی. create و update را کورکورانه تکرار نکن؛ اول مطمئن شو عملیاتت idempotent است تا فعالیت یا یادداشت تکراری ساخته نشود.

## چک‌لیست انتشار {#checklist}

- [ ] Callback URL و همه‌ی آدرس‌های اکستنشن روی HTTPS هستند.
- [ ] Client secret، JWT secretها و `ApiKey` در secret manager نگه‌داری می‌شوند.
- [ ] هیچ secret، launchCode یا JWTی در log و analytics ثبت نمی‌شود.
- [ ] `payload` در backend validate و HTML ورودی sanitize می‌شود.
- [ ] `state` جریان نصب یک‌بارمصرف است و با session تطبیق داده می‌شود.
- [ ] CORS فقط originهای دقیق دیدار را می‌پذیرد، نه `*`.
- [ ] در 401/410 اجرای تازه شروع می‌شود و token قدیمی reuse نمی‌شود.
- [ ] در 403 قابلیت غیرمجاز به کاربر نمایش داده نمی‌شود.
- [ ] فقط scopeهایی درخواست شده که اپ واقعاً لازم دارد.
- [ ] `traceId` خطاها برای پشتیبانی ثبت می‌شود، بدون token.

فهرست کامل statusها و کدهای خطا: [مرجع خطاها](/errors).
