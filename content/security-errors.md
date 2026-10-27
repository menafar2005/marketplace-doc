---
title: امنیت و خطاها
section: reference
order: 20
lead: قرارداد خطا پایدار است: تصمیم برنامه را بر اساس HTTP status و error.code بگیر و از traceId برای پیگیری استفاده کن.
description: envelope خطا، HTTP statusها، کدهای خطا، چک‌لیست امنیتی و قاعده‌ی retry.
---

## Envelope استاندارد مارکت‌پلیس {#envelope}

```json title="Error response"
{
  "succeeded": false,
  "data": null,
  "error": {
    "code": "RUNTIME_ENTITY_ACCESS_DENIED",
    "message": "The requested entity is outside the runtime context.",
    "details": null
  },
  "meta": {
    "traceId": "0HN...",
    "correlationId": null,
    "timestampUtc": "2026-09-30T10:00:00Z"
  }
}
```

## HTTP statusها {#status}

<!--STATUS_TABLE-->

## کدهای مهم {#codes}

<!--ERROR_TABLE-->

## چک‌لیست انتشار {#checklist}

- [ ] تمام endpointهای callback و launch روی HTTPS هستند.
- [ ] `ClientSecret` و `ApiKey` در secret manager نگهداری می‌شوند.
- [ ] هیچ secret، launch code یا JWT در log و analytics ثبت نمی‌شود.
- [ ] JSON payload در backend validate و HTMLهای ورودی sanitize می‌شوند.
- [ ] `state` جریان نصب یک‌بارمصرف و قابل تطبیق با session است.
- [ ] CORS فقط originهای دقیق دیدار و محیط‌های موردنیاز را می‌پذیرد.
- [ ] در 401/410 launch تازه شروع می‌شود و token قدیمی reuse نمی‌شود.
- [ ] در 403 قابلیت غیرمجاز به کاربر نمایش داده نمی‌شود.
- [ ] `traceId` خطا برای پشتیبانی ثبت می‌شود، بدون ثبت token.

## Retry و idempotency {#retry}

برای GETها و خطاهای موقت 502 می‌توانی retry محدود با backoff انجام بدهی. عملیات create/update را کورکورانه retry نکن؛ ابتدا idempotency عملیات خودت را تضمین کن تا فعالیت یا یادداشت تکراری ایجاد نشود.
