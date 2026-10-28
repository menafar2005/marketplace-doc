---
title: مقدمه‌ی API
section: reference
order: 1
lead: همه‌ی endpointهای مارکت‌پلیس در یک صفحه: کدام دامنه، کدام احراز هویت، چه قالب پاسخی، و هر endpoint کجای این مرجع است.
description: دامنه‌ها، دو نوع احراز هویت (credentials اپ و Runtime Token)، scopeها، Runtime Context، envelope پاسخ و فهرست همه‌ی endpointهای مارکت‌پلیس دیدار.
---

## سه دسته endpoint {#groups}

| دسته | چه کسی صدا می‌زند | احراز هویت | مرجع |
| --- | --- | --- | --- |
| **نصب و توکن** | سرور تو ← دیدار / مارکت‌پلیس | Client ID و Client secret در بدنه | [نصب و توکن](/api-auth) |
| **داده‌ی دیدار** (API پروکسی) | سرور تو ← مارکت‌پلیس | `Authorization: Bearer <Runtime Token>` | [اطلاعات پایه](/api-basic)، [معامله](/api-deals)، [پرونده](/api-cases)، [شخص و شرکت](/api-contacts)، [فعالیت و یادداشت](/api-activities) |
| **endpointهای اپ تو** | دیدار ← سرور تو | `code` یا `launchCode` در query | [endpointهای اپ تو](/api-app-endpoints) |

## همه‌ی endpointها {#all}

| Method | URL | کار |
| --- | --- | --- |
| `POST` | `https://app.didar.me/api/MarketplaceInstall/CompleteInstallation` | [تکمیل نصب](/api-auth#complete-installation) |
| `POST` | `https://marketplace.didar.me/api/v1/runtime/token` | [دریافت Runtime Token](/api-auth#runtime-token) |
| `GET` | `/api/v1/proxy/biz-domain/info` | [اطلاعات BizDomain](/api-basic#biz-domain-info) |
| `GET` | `/api/v1/proxy/activity-types` | [انواع فعالیت](/api-basic#activity-types) |
| `GET` | `/api/v1/proxy/lost-reasons` | [دلایل شکست معامله](/api-basic#lost-reasons) |
| `GET` | `/api/v1/proxy/pipelines/deals` و `/cases` | [کاریزها](/api-basic#pipelines-deals) |
| `GET` | `/api/v1/proxy/pipeline-stages/deals` و `/cases` | [مراحل کاریز](/api-basic#pipeline-stages-deals) |
| `GET` | `/api/v1/proxy/labels/deals` و `/cases` | [برچسب‌ها](/api-basic#labels-deals) |
| `GET` | `/api/v1/proxy/users` | [کاربران](/api-basic#users) |
| `GET` / `PUT` | `/api/v1/deals/{dealId}` | [دریافت](/api-deals#deal-get) و [ویرایش](/api-deals#deal-update) معامله |
| `GET` / `PUT` | `/api/v1/cases/{caseId}` | [دریافت](/api-cases#case-get) و [ویرایش](/api-cases#case-update) پرونده |
| `GET` / `PUT` | `/api/v1/contacts/persons/{personId}` | [دریافت](/api-contacts#person-get) و [ویرایش](/api-contacts#person-update) شخص |
| `GET` / `PUT` | `/api/v1/contacts/companies/{companyId}` | [دریافت](/api-contacts#company-get) و [ویرایش](/api-contacts#company-update) شرکت |
| `POST` | `/api/v1/activities/search` | [جستجوی فعالیت](/api-activities#activity-search) |
| `GET` / `PUT` | `/api/v1/activities/{activityId}` | [دریافت](/api-activities#activity-get) و [ویرایش](/api-activities#activity-update) فعالیت |
| `POST` | `/api/v1/activities` | [ساخت فعالیت](/api-activities#activity-create) |
| `POST` / `PUT` | `/api/v1/notes` و `/api/v1/notes/{noteId}` | [ساخت](/api-activities#note-create) و [ویرایش](/api-activities#note-update) یادداشت |

مسیرهای بدون دامنه روی `https://marketplace.didar.me` هستند.

## احراز هویت {#auth}

**نصب و توکن:** بدون هدر Authorization. اپ با `ClientId` / `ClientSecret` (برای تکمیل نصب) یا `clientId` / `clientSecret` (برای Runtime Token) در بدنه هویتش را ثابت می‌کند. این درخواست‌ها فقط از backend فرستاده می‌شوند.

**داده‌ی دیدار:** هر درخواست هدر Runtime Token را دارد:

```bash title="الگوی مشترک درخواست داده"
curl --location 'https://marketplace.didar.me/api/v1/proxy/activity-types' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Accept: application/json'
```

مارکت‌پلیس نصب، scope و context را از token درمی‌آورد. فرستادن `BizDomainId` یا کلید API دیدار لازم نیست.

## Scope و Runtime Context {#scopes}

هر درخواست داده دو بار چک می‌شود: اپ باید scope لازم را داشته باشد، و رکورد باید جزو `entityIds` همان اجرا باشد.

| Resource | scope خواندن | scope نوشتن |
| --- | --- | --- |
| اطلاعات پایه | `basicinfo` | — |
| Deal | `deals` یا `deals.fullaccess` | `deals.fullaccess` |
| Case | `cases` یا `cases.fullaccess` | `cases.fullaccess` |
| Person / Company | `contacts` یا `contacts.fullaccess` | `contacts.fullaccess` |
| Activity / Note | `activities` یا `activities.fullaccess` | `activities.fullaccess` |

## قالب پاسخ {#envelope}

پاسخ endpointهای `marketplace.didar.me` در envelope استاندارد مارکت‌پلیس است. در APIهای داده، `data.Response` همان پاسخ API دیدار است و بسته به endpoint یک object یا array است:

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

`CompleteInstallation` روی `app.didar.me` است و قالب پاسخ دیدار را دارد (PascalCase، داخل `Response`). [جزئیات](/api-auth#complete-installation)

## بدنه‌ها دقیقاً مثل API دیدار {#openapi}

بدنه‌ی endpointهای داده دقیقاً بدنه‌ی API دیدار است و جدول پارامترهای این مرجع از مستندات رسمی API دیدار آمده است. سه تفاوت:

- **شناسه در مسیر است.** برای GET، شناسه در route می‌آید؛ برای PUT، شناسه‌ی بدنه (مثل `Deal.Id`) باید با route برابر باشد.
- **احراز هویت با Runtime Token است**، نه `apikey` در query.
- **context هم چک می‌شود**، نه فقط scope.

> [!WARNING]
> نام و casing فیلدها را دقیقاً مطابق نمونه‌ها بفرست؛ از جمله `Deal`، `Case`، `Contact`، `Activity` و `ContactIds`.

خطاها: [مرجع خطاها](/errors).

> [!NOTE]
> **MCP وصل است؟** ابزار `get_api_spec` مشخصات دقیق هر endpoint را برمی‌گرداند. [اتصال به MCP](/build-with-mcp)
