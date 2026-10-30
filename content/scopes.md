---
title: Scopeها و دسترسی‌ها
section: start
order: 33
lead: scopeها تعیین می‌کنند پلاگین تو به کدام داده‌های دیدار دسترسی دارد و فقط می‌خواند یا می‌نویسد. ادمین همه‌ی scopeهای پلاگین را هنگام نصب می‌بیند و با هم تأیید می‌کند. این صفحه توضیح می‌دهد scope چطور کار می‌کند، چطور انتخابش کنی، و فهرست همه‌ی scopeها و endpointهایی را که هرکدام باز می‌کنند آورده است.
description: فهرست scopeهای مارکت‌پلیس دیدار (basicinfo، deals، cases، contacts، activities و fullaccess هرکدام)، نحوه‌ی انتخاب، نام هرکدام در Developer Hub، endpointهایی که باز می‌کنند و رفتار در نبود scope.
---

## scope چیست؟ {#what}

**scope** اجازه‌ی پلاگین برای کار با یک نوع داده در دیدار است؛ مثلاً «خواندن معامله‌ها» یا «خواندن و نوشتن فعالیت‌ها». تو در Developer Hub مشخص می‌کنی پلاگین به کدام scopeها نیاز دارد، ادمین هنگام نصب همین فهرست را به زبان ساده می‌بیند (مثل «معاملات: دسترسی کامل خواندن و نوشتن») و تأیید می‌کند، و از آن به بعد مارکت‌پلیس هر درخواست پلاگین را با این فهرست چک می‌کند.

هر نوع داده دو سطح دارد: **Read only** که فقط خواندن را باز می‌کند، و **Full access** که خواندن و نوشتن را باز می‌کند. در API، سطح Full access با پسوند `.fullaccess` مشخص می‌شود؛ مثلاً `deals` و `deals.fullaccess`.

scope فقط یکی از دو لایه‌ی دسترسی است. لایه‌ی دوم Runtime Context است: حتی با scope کامل، پلاگین فقط روی رکوردهای `entityIds` همان اجرا کار می‌کند. scope می‌گوید «چه نوع داده‌ای»، context می‌گوید «کدام رکوردها». [Runtime Token](/runtime-token)

## انتخاب scope {#choosing}

- **فقط scopeهای لازم را بخواه.** ادمین همه‌ی scopeها را با هم می‌پذیرد یا رد می‌کند؛ نمی‌تواند بخشی را بدهد و بخشی را نه. هر scope اضافه دلیلی برای رد شدن نصب است.
- **از Read only شروع کن.** Full access را فقط وقتی انتخاب کن که پلاگین واقعاً می‌نویسد.
- **هر scope را بتوانی توضیح بدهی.** اگر ادمین پرسید «چرا این پلاگین به فعالیت‌های من دسترسی کامل می‌خواهد؟»، باید جواب روشنی داشته باشی.
- **ساختن یادداشت هم نوشتن فعالیت است.** یادداشت در دیدار با مدل فعالیت ساخته می‌شود، پس به `activities.fullaccess` نیاز دارد.

scopeها را در Developer Hub، تب **OAuth & access scopes** انتخاب می‌کنی. هر بخش یک تاگل دارد و با روشن کردنش **Read only** (پیش‌فرض) یا **Full access** را انتخاب می‌کنی.

## فهرست scopeها {#list}

### اطلاعات پایه {#basicinfo}

**`basicinfo`** · Access to basic information · همیشه فعال و غیرقابل‌غیرفعال‌کردن

مشاهده‌ی اطلاعات عمومی حساب و کاربر که برای شناسایی حساب و برقراری ارتباط پلاگین با دیدار لازم است. این scope همیشه هست، پس endpointهای زیر در هر پلاگینی در دسترس‌اند؛ مثلاً [صفحه‌ی تنظیمات](/app-settings#key) با `biz-domain/info` می‌فهمد مال کدام کسب‌وکار است.

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

درخواست به endpointی بیرون از scopeهای نصب، `403` با `PROXY_ACCESS_DENIED` برمی‌گرداند. این خطا با retry درست نمی‌شود. اگر قابلیتی در یک کسب‌وکار مجاز نیست، آن را در پلاگین به کاربر نشان نده (scopeهای هر نصب را هنگام [تکمیل نصب](/installation-authorization#step-5) ذخیره کرده‌ای)، یا اگر واقعاً لازم است، scope را در Developer Hub اضافه کن.

> [!WARNING]
> رفتار نصب‌های موجود وقتی scopeهای یک پلاگین را بعد از نصب عوض می‌کنی (آیا ادمین باید دوباره تأیید کند؟) هنوز در منبع فنی نیامده است.

## بعد از این بخوان {#read-next}

- [Runtime Token](/runtime-token)
- [ثبت پلاگین](/registering-an-app#scopes)
- [خطاها](/errors)
