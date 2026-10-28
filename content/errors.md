---
title: کدهای وضعیت HTTP
section: reference
order: 4
lead: قرارداد خطا پایدار است. تصمیم برنامه را بر اساس HTTP status و error.code بگیر و traceId را برای پیگیری نگه دار.
description: envelope خطای مارکت‌پلیس، HTTP statusها با رفتار پیشنهادی، و همه‌ی کدهای خطا.
---

## Envelope خطا {#envelope}

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

متن `message` برای انسان است؛ آن را parse نکن.

## HTTP statusها {#status}

<!--STATUS_TABLE-->

## کدهای خطا {#codes}

<!--ERROR_TABLE-->

راهنمای رفتار امن در برابر خطا و retry: [چک‌لیست امنیت](/security#errors). کدهای خطای تبادل launchCode: [Runtime Token](/runtime-token#errors).
