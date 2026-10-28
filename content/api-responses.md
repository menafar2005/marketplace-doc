---
title: پاسخ‌ها
section: reference
order: 3
lead: پاسخ همه‌ی endpointهای marketplace.didar.me در یک قالب ثابت (envelope) است. تکمیل نصب روی app.didar.me قالب پاسخ دیدار را دارد. این صفحه هر دو را توضیح می‌دهد.
description: envelope استاندارد پاسخ مارکت‌پلیس دیدار (succeeded، data، error، meta)، data.Response در APIهای داده و قالب پاسخ CompleteInstallation.
---

## envelope استاندارد {#envelope}

```json title="Response 200"
{
  "succeeded": true,
  "data": { "Response": { } },
  "error": null,
  "meta": {
    "traceId": "TRACE_ID",
    "correlationId": null,
    "timestampUtc": "2026-01-01T00:00:00Z"
  }
}
```

| کلید | نوع | توضیح |
| --- | --- | --- |
| `succeeded` | boolean | موفق بودن درخواست. همراه HTTP status چک کن. |
| `data` | object \| null | نتیجه. در خطا `null`. |
| `error` | object \| null | در خطا: `code`، `message` و `details`. [کدهای وضعیت HTTP](/errors) |
| `meta.traceId` | string | شناسه‌ی پیگیری؛ برای پشتیبانی log کن، بدون token. |
| `meta.correlationId` | string \| null | شناسه‌ی همبستگی. |
| `meta.timestampUtc` | string | زمان پاسخ (UTC). |

## data در APIهای داده {#data}

در APIهای داده، `data.Response` همان پاسخ API دیدار است و بسته به endpoint یک object یا array است:

| endpoint | `data.Response` |
| --- | --- |
| دریافت یک رکورد (مثل `GET /api/v1/deals/{dealId}`) | object |
| فهرست اطلاعات پایه (مثل `GET /api/v1/proxy/users`) | array |
| جستجوی فعالیت | object با `List` و `Total` |

```json title="GET /api/v1/proxy/activity-types"
{
  "succeeded": true,
  "data": { "Response": [
    { "Id": "516b387f-0300-4956-81fa-8cf16f078747", "Title": "Meeting", "IsDisabled": false }
  ] },
  "error": null,
  "meta": { "traceId": "TRACE_ID", "timestampUtc": "2026-01-01T00:00:00Z" }
}
```

## data در دریافت Runtime Token {#token}

پاسخ `/api/v1/runtime/token` هم همین envelope را دارد، ولی `data` مستقیم `accessToken`، `tokenType`، `expiresInSeconds` و `context` است (بدون `Response`). [فیلدها](/api-auth#runtime-token)

## پاسخ تکمیل نصب {#complete-installation}

`CompleteInstallation` روی `app.didar.me` است و قالب پاسخ دیدار را دارد: PascalCase، و نتیجه داخل `Response`.

```json title="200 OK"
{
  "Response": {
    "Succeeded": true,
    "Data": { "InstallationId": 14, "BizDomainId": "BIZ_DOMAIN_ID" },
    "Error": null,
    "Meta": { "TraceId": "TRACE_ID", "CorrelationId": null }
  }
}
```

[همه‌ی فیلدها](/api-auth#complete-installation)
