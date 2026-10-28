---
title: پلاگین چطور کار می‌کند
section: start
order: 3
lead: این صفحه کل مسیر را یک‌جا نشان می‌دهد؛ از ساختن اپ در Developer Hub تا لحظه‌ای که پلاگین تو داده‌ی یک معامله را می‌خواند. بعد از آن، هر صفحه‌ی دیگر داک فقط یکی از این مرحله‌ها را باز می‌کند.
description: چرخه‌ی کامل یک پلاگین دیدار در چهار مرحله (ساخت، نصب، اجرا، داده)، دو دامنه‌ی دیدار و endpointهایی که سرور اپ باید داشته باشد.
---

## چهار مرحله {#stages}

| مرحله | چند بار اتفاق می‌افتد | چه کسی شروع می‌کند | نتیجه |
| --- | --- | --- | --- |
| ۱. ساخت اپ | یک‌بار | توسعه‌دهنده در Developer Hub | Client ID، Client secret، لینک نصب |
| ۲. نصب | یک‌بار برای هر کسب‌وکار | ادمین کسب‌وکار | نصب روی یک BizDomain با scopeهای تأییدشده |
| ۳. اجرا | هر بار که کاربر اکستنشن را باز می‌کند | کاربر دیدار | Runtime Token و Runtime Context |
| ۴. داده | در طول هر اجرا | سرور اپ | خواندن و نوشتن داده‌ی دیدار |

## ۱. ساخت اپ {#build}

در Developer Hub یک اپ می‌سازی: نام، Callback URL، scopeها و اکستنشن‌ها. Developer Hub به تو Client ID و Client secret می‌دهد. اپ تازه **Draft** است.

راهنمای قدم‌به‌قدم: [ساخت اپ در Developer Hub](/create-app).

## ۲. نصب {#install}

| # | از | به | چه اتفاقی می‌افتد |
| --- | --- | --- | --- |
| ۱ | ادمین | دیدار | لینک نصب را باز می‌کند و نام اپ، سازنده و دسترسی‌ها را می‌بیند. |
| ۲ | ادمین | دیدار | «تأیید دسترسی به اطلاعات و نصب» را می‌زند. |
| ۳ | دیدار | سرور تو | مرورگر را به Callback URL می‌فرستد: `?code=…&state=…` |
| ۴ | سرور تو | دیدار | `POST CompleteInstallation` با `Code`، `ClientId` و `ClientSecret` |
| ۵ | دیدار | سرور تو | `BizDomainId`، `Scopes` و `ApiKey` را برمی‌گرداند. |

سرور تو نتیجه‌ی نصب را با `BizDomainId` ذخیره می‌کند. از اینجا به بعد اپ روی آن کسب‌وکار فعال است.

راهنمای قدم‌به‌قدم: [پیاده‌سازی نصب](/installation).

## ۳. اجرا {#launch}

| # | از | به | چه اتفاقی می‌افتد |
| --- | --- | --- | --- |
| ۱ | کاربر | دیدار | اکستنشن را باز می‌کند (مثلاً «ایجاد جلسه» روی یک معامله). |
| ۲ | دیدار | سرور تو | آدرس اکستنشن را با `?launchCode=…` صدا می‌زند. |
| ۳ | سرور تو | مارکت‌پلیس | `POST /api/v1/runtime/token` با `launchCode`، `clientId` و `clientSecret` |
| ۴ | مارکت‌پلیس | سرور تو | `accessToken` و `context` همین اجرا را برمی‌گرداند. |

راهنمای قدم‌به‌قدم: [اجرای اکستنشن و گرفتن token](/launch).

## ۴. داده {#data}

| # | از | به | چه اتفاقی می‌افتد |
| --- | --- | --- | --- |
| ۱ | سرور تو | مارکت‌پلیس | `GET /api/v1/deals/{id}` با `Authorization: Bearer <token>` |
| ۲ | مارکت‌پلیس | — | چک می‌کند اپ scope لازم را دارد و `id` جزو `entityIds` همین اجراست. |
| ۳ | مارکت‌پلیس | دیدار | درخواست را می‌فرستد. |
| ۴ | مارکت‌پلیس | سرور تو | پاسخ دیدار را داخل `data.Response` برمی‌گرداند. |

راهنمای قدم‌به‌قدم: [خواندن و نوشتن داده](/crm-data).

## دو دامنه، دو کار {#domains}

| دامنه | چه چیزی آنجاست |
| --- | --- |
| `https://app.didar.me` | خود دیدار: Developer Hub، صفحه‌ی نصب، و endpoint تکمیل نصب (`CompleteInstallation`) |
| `https://marketplace.didar.me` | دریافت Runtime Token و همه‌ی APIهای داده |

## سرور تو چه چیزهایی باید داشته باشد؟ {#your-server}

| endpoint روی سرور تو | دیدار کی صدایش می‌زند | چه کار می‌کند |
| --- | --- | --- |
| Callback URL | بعد از تأیید نصب | `code` را با `CompleteInstallation` کامل و نتیجه را ذخیره می‌کند |
| URL هر اکستنشن | هر بار اجرای اکستنشن | `launchCode` را به token تبدیل می‌کند و کار اکستنشن را انجام می‌دهد |
| URL تنظیمات (اختیاری) | هر بار باز شدن تنظیمات اپ | مثل بالا؛ تنظیمات همان BizDomain را نشان می‌دهد |

قرارداد دقیق هرکدام: [endpointهای اپ تو](/api-app-endpoints).

یک پروژه‌ی نمونه می‌تواند این‌طور چیده شود (ساختار پوشه آزاد است؛ فقط قراردادهای بالا مهم‌اند):

```text title="meet-plugin/"
server.js             # app setup and routes
routes/callback.js    # Callback URL: CompleteInstallation
routes/launch.js      # extension URL: launchCode -> Runtime Token
lib/didar.js          # proxy API calls with the Runtime Token
extensions/form.json  # JSON modal form schema
.env                  # DIDAR_CLIENT_ID, DIDAR_CLIENT_SECRET (never in git)
```

## سه قاعده که همه‌جا صدق می‌کند {#rules}

- **secretها فقط روی سرور.** Client secret، کلید نصب و Runtime Token هرگز به مرورگر، URL یا log نمی‌رسند.
- **فقط به context اعتماد کن.** شناسه‌ی رکورد را از `context.entityIds` بگیر، نه از query یا فرم.
- **هر اجرا از نو.** هر launchCode یک‌بار مصرف می‌شود و هر Runtime Token فقط برای همان اجراست.

## قدم بعدی {#next}

حالا که تصویر کلی را داری، [اولین پلاگینت را بساز](/create-app). اگر با یک ابزار AI کار می‌کنی، اول [MCP دیدار را وصل کن](/build-with-mcp) تا همین قراردادها را برایت پیاده کند.
