---
title: درباره‌ی API
section: reference
order: 1
lead: APIهای مارکت‌پلیس دیدار سه دسته‌اند؛ نصب و توکن، داده‌ی دیدار، و endpointهایی که اپ تو پیاده می‌کند. این صفحه هر سه را معرفی می‌کند و همه‌ی endpointها را یک‌جا فهرست کرده است.
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

## قبل از شروع {#basics}

| موضوع | صفحه |
| --- | --- |
| دامنه‌ها، هدرها، احراز هویت و قاعده‌ی بدنه‌ها | [درخواست‌ها](/api-requests) |
| قالب پاسخ موفق و فیلدهای `meta` | [پاسخ‌ها](/api-responses) |
| HTTP statusها و کدهای خطا | [کدهای وضعیت HTTP](/errors) |
| scope لازم برای هر endpoint | [Scopeها و دسترسی‌ها](/scopes) |

> [!NOTE]
> **MCP وصل است؟** ابزار `get_api_spec` مشخصات دقیق هر endpoint را برمی‌گرداند. [اتصال به MCP](/build-with-mcp)
