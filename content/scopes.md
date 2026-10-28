---
title: Scopeها و دسترسی‌ها
section: start
order: 33
lead: scopeها تعیین می‌کنند اپ تو به کدام داده‌های دیدار دسترسی دارد. ادمین همه‌ی scopeهای اپ را هنگام نصب با هم می‌بیند و تأیید می‌کند. این صفحه همه‌ی scopeها و endpointهایی را که هرکدام باز می‌کنند فهرست کرده است.
description: فهرست scopeهای مارکت‌پلیس دیدار (basicinfo، deals، cases، contacts، activities و fullaccess هرکدام)، نام هرکدام در Developer Hub و endpointهایی که باز می‌کنند.
---

## انتخاب scope {#choosing}

- **فقط scopeهای لازم را بخواه.** ادمین همه‌ی scopeها را با هم می‌پذیرد یا رد می‌کند؛ هر scope اضافه دلیلی برای رد شدن نصب است.
- **از Read only شروع کن.** Full access را فقط وقتی انتخاب کن که اپ واقعاً می‌نویسد.
- **هر scope را بتوانی توضیح بدهی.** ادمین در صفحه‌ی تأیید نصب دسترسی‌ها را به زبان ساده می‌بیند، مثل «معاملات: دسترسی کامل خواندن و نوشتن».
- **scope کافی نیست.** حتی با scope کامل، اپ فقط روی رکوردهای `entityIds` همان اجرا کار می‌کند. [Runtime Token](/runtime-token)

scopeها را در Developer Hub، تب **OAuth & access scopes** انتخاب می‌کنی. هر بخش یک تاگل دارد و با روشن کردنش **Read only** (پیش‌فرض) یا **Full access** را انتخاب می‌کنی.

## فهرست scopeها {#list}

### اطلاعات پایه {#basicinfo}

**`basicinfo`** · Access to basic information · همیشه فعال و غیرقابل‌غیرفعال‌کردن

مشاهده‌ی اطلاعات عمومی حساب و کاربر که برای شناسایی حساب و برقراری ارتباط اپ با دیدار لازم است.

| Method | endpoint |
| --- | --- |
| `GET` | [`/api/v1/proxy/biz-domain/info`](/api-basic#biz-domain-info) |
| `GET` | [`/api/v1/proxy/activity-types`](/api-basic#activity-types) |
| `GET` | [`/api/v1/proxy/lost-reasons`](/api-basic#lost-reasons) |
| `GET` | [`/api/v1/proxy/pipelines/deals`](/api-basic#pipelines-deals)، [`/pipelines/cases`](/api-basic#pipelines-cases) |
| `GET` | [`/api/v1/proxy/pipeline-stages/deals`](/api-basic#pipeline-stages-deals)، [`/pipeline-stages/cases`](/api-basic#pipeline-stages-cases) |
| `GET` | [`/api/v1/proxy/labels/deals`](/api-basic#labels-deals)، [`/labels/cases`](/api-basic#labels-cases) |
| `GET` | [`/api/v1/proxy/users`](/api-basic#users) |

### معامله {#deals}

| scope | در Developer Hub | endpointها |
| --- | --- | --- |
| `deals` | Deals · Read only | [`GET /api/v1/deals/{dealId}`](/api-deals#deal-get) |
| `deals.fullaccess` | Deals · Full access | بالا، به‌علاوه‌ی [`PUT /api/v1/deals/{dealId}`](/api-deals#deal-update) |

### پرونده {#cases}

| scope | در Developer Hub | endpointها |
| --- | --- | --- |
| `cases` | Cases · Read only | [`GET /api/v1/cases/{caseId}`](/api-cases#case-get) |
| `cases.fullaccess` | Cases · Full access | بالا، به‌علاوه‌ی [`PUT /api/v1/cases/{caseId}`](/api-cases#case-update) |

### شخص و شرکت {#contacts}

| scope | در Developer Hub | endpointها |
| --- | --- | --- |
| `contacts` | Contacts · Read only | [`GET /api/v1/contacts/persons/{personId}`](/api-contacts#person-get)، [`GET /api/v1/contacts/companies/{companyId}`](/api-contacts#company-get) |
| `contacts.fullaccess` | Contacts · Full access | بالا، به‌علاوه‌ی [`PUT` شخص](/api-contacts#person-update) و [`PUT` شرکت](/api-contacts#company-update) |

### فعالیت و یادداشت {#activities}

| scope | در Developer Hub | endpointها |
| --- | --- | --- |
| `activities` | Activities · Read only | [`POST /api/v1/activities/search`](/api-activities#activity-search)، [`GET /api/v1/activities/{activityId}`](/api-activities#activity-get) |
| `activities.fullaccess` | Activities · Full access | بالا، به‌علاوه‌ی [ساخت](/api-activities#activity-create) و [ویرایش](/api-activities#activity-update) فعالیت، [ساخت](/api-activities#note-create) و [ویرایش](/api-activities#note-update) یادداشت |

## وقتی scope کافی نیست {#denied}

درخواست به endpointی بیرون از scopeهای نصب، `403` با `PROXY_ACCESS_DENIED` برمی‌گرداند. با retry درست نمی‌شود؛ قابلیت مربوط را در اپ غیرفعال کن، یا scope را در Developer Hub اضافه کن.

> [!WARNING]
> رفتار نصب‌های موجود وقتی scopeهای یک اپ را بعد از نصب عوض می‌کنی (آیا ادمین باید دوباره تأیید کند؟) هنوز در منبع فنی نیامده است.

## بعد از این بخوان {#read-next}

- [Runtime Token](/runtime-token)
- [ثبت اپ](/registering-an-app#scopes)
- [خطاها](/errors)
