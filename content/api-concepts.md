---
title: مفاهیم پایه API
section: reference
order: 6
lead: این صفحه کمک می‌کند هر endpoint پروکسی را بدون حدس صدا بزنی: آدرس پایه، احراز هویت، scopeها، envelope پاسخ و قاعده‌ی بدنه‌ها.
description: آدرس پایه، Bearer token، scopeها، Runtime Context، envelope استاندارد و قاعده‌ی بدنه‌ی OpenAPI در APIهای پروکسی مارکت‌پلیس.
---

## آدرس پایه و احراز هویت {#base}

همه‌ی endpointها روی `https://marketplace.didar.me` هستند و به Runtime Bearer Token نیاز دارند، به‌جز endpoint تبدیل `launchCode` که Bearer نمی‌خواهد.

```bash title="الگوی مشترک درخواست"
curl --location 'https://marketplace.didar.me/api/v1/proxy/activity-types' \
  --header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
  --header 'Accept: application/json'
```

## بدنه‌ها دقیقاً مثل API دیدار {#openapi}

بدنه‌ی endpointهای پروکسی دقیقاً بدنه‌ی endpointهای OpenAPI دیدار است و همان مقادیر را می‌گیرد و برمی‌گرداند. پس برای ساختار، نوع و توضیح هر پراپرتی همان API reference دیدار مرجع است؛ جدول پارامترهای این داک از آن گرفته شده‌اند. تفاوت‌ها فقط این‌هاست:

- **شناسه در route می‌آید.** به‌جای فیلد `Id` در بدنه‌ی GET، شناسه در مسیر است؛ برای PUT، شناسه‌ی بدنه (مثل `Deal.Id`) باید با route برابر باشد.
- **احراز هویت با Runtime Token است**، نه `apikey` در query. کلید API دیدار فقط در سمت سرور مارکت‌پلیس استفاده می‌شود.
- **context بررسی می‌شود.** علاوه بر scope، نوع و شناسه‌های entity داخل Runtime Context هم کنترل می‌شود.

> [!WARNING]
> **حساسیت نام فیلدها.** نام و casing فیلدهای JSON را دقیقاً مطابق نمونه‌ها ارسال کن؛ از جمله `Deal`، `Case`، `Contact`، `Activity` و `ContactIds`.

## Scope و Runtime Context {#scopes}

| Resource | Read scope | Write scope |
| --- | --- | --- |
| اطلاعات پایه | `basicinfo` | — |
| Deal | `deals` یا `deals.fullaccess` | `deals.fullaccess` |
| Case | `cases` یا `cases.fullaccess` | `cases.fullaccess` |
| Person / Company | `contacts` یا `contacts.fullaccess` | `contacts.fullaccess` |
| Activity / Note | `activities` یا `activities.fullaccess` | `activities.fullaccess` |

## envelope استاندارد {#envelope}

پاسخ موفق در envelope استاندارد مارکت‌پلیس قرار می‌گیرد. مقدار `data.Response` بسته به endpoint یک object یا array است.

```json title="Response 200"
{
  "succeeded": true,
  "data": { "Response": { } },
  "error": null,
  "meta": {
    "traceId": "TRACE_ID",
    "timestampUtc": "2026-01-01T00:00:00Z"
  }
}
```

خطاها: [امنیت و خطاها](/security-errors).

## فهرست endpointها {#endpoints}

| صفحه | شامل |
| --- | --- |
| [اطلاعات پایه](/api-basic) | BizDomain، انواع فعالیت، دلایل شکست، pipelineها، stageها، labelها، کاربران |
| [معامله](/api-deals) | دریافت و ویرایش |
| [پرونده](/api-cases) | دریافت و ویرایش |
| [شخص و شرکت](/api-contacts) | دریافت و ویرایش |
| [فعالیت و یادداشت](/api-activities) | جستجو، دریافت، ساخت، ویرایش |

> [!NOTE]
> **MCP وصل است؟** از `get_api_spec` برای گرفتن مشخصات دقیق هر endpoint استفاده کن. [اتصال به MCP](/build-with-mcp)
