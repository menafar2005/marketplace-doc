---
title: درخواست‌ها
section: reference
order: 2
lead: هر درخواست به APIهای مارکت‌پلیس از یکی از دو دامنه، با یکی از دو نوع احراز هویت و با بدنه‌ی JSON فرستاده می‌شود. این صفحه قواعد مشترک همه‌ی درخواست‌ها را می‌گوید.
description: دامنه‌ها، احراز هویت، هدرها، شناسه در مسیر و قواعد بدنه‌ی درخواست‌های API مارکت‌پلیس دیدار.
---

## دامنه‌ها {#domains}

| دامنه | endpointها |
| --- | --- |
| `https://app.didar.me` | فقط [تکمیل نصب](/api-auth#complete-installation) |
| `https://marketplace.didar.me` | [دریافت Runtime Token](/api-auth#runtime-token) و همه‌ی APIهای داده |

همه‌ی درخواست‌ها روی HTTPS هستند.

## احراز هویت {#auth}

| دسته | احراز هویت |
| --- | --- |
| نصب و توکن | بدون هدر `Authorization`. `ClientId` / `ClientSecret` (تکمیل نصب) یا `clientId` / `clientSecret` (Runtime Token) در بدنه. فقط از backend. |
| داده‌ی دیدار | هدر `Authorization: Bearer <Runtime Token>` |

مارکت‌پلیس نصب، scope و context را از Runtime Token درمی‌آورد. فرستادن `BizDomainId` یا کلید API دیدار لازم نیست. [مرور احراز هویت](/authentication)

## هدرها {#headers}

| هدر | کی |
| --- | --- |
| `Authorization: Bearer RUNTIME_ACCESS_TOKEN` | همه‌ی APIهای داده |
| `Content-Type: application/json` | هر درخواستی که بدنه دارد (POST و PUT) |
| `Accept: application/json` | درخواست‌های GET |

```bash title="GET"
curl --location 'https://marketplace.didar.me/api/v1/proxy/activity-types' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Accept: application/json'
```

```bash title="PUT"
curl --location --request PUT 'https://marketplace.didar.me/api/v1/deals/704e1533-cb4b-42d7-895d-ef71ff32ba5b' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "Deal": {
    "Id": "704e1533-cb4b-42d7-895d-ef71ff32ba5b",
    "Title": "Enterprise renewal"
  }
}'
```

## بدنه‌ها دقیقاً مثل API دیدار {#body}

بدنه‌ی APIهای داده دقیقاً بدنه‌ی API دیدار است و جدول پارامترهای این مرجع از مستندات رسمی API دیدار آمده است. سه تفاوت:

- **شناسه در مسیر است.** برای GET، شناسه در route می‌آید و در بدنه نیست. برای PUT، شناسه‌ی بدنه (مثل `Deal.Id`) باید با route برابر باشد.
- **احراز هویت با Runtime Token است**، نه `apikey` در query.
- **context هم چک می‌شود.** شناسه‌ها و associationهای بدنه (مثل `DealId` یا `ContactIds`) باید جزو رکوردهای همان اجرا باشند.

> [!WARNING]
> **نام فیلدها حساس به حروف است.** `Deal`، `Case`، `Contact`، `Activity`، `ContactIds` و بقیه را دقیقاً با همان casing نمونه‌ها بفرست. endpointهای نصب و توکن هم casing متفاوت دارند: `CompleteInstallation` با PascalCase و `runtime/token` با camelCase.

## Retry {#retry}

GETها و خطاهای موقت `502` را می‌توانی با backoff محدود دوباره امتحان کنی. create و update را کورکورانه تکرار نکن تا رکورد تکراری ساخته نشود. [چک‌لیست امنیت](/security#retry)
