---
title: تکمیل نصب
section: start
order: 31
lead: نصب در پنج قدم کامل می‌شود؛ ادمین را به صفحه‌ی نصب می‌فرستی، او تأیید می‌کند، دیدار به Callback URL تو برمی‌گردد، سرور تو نصب را کامل می‌کند و نتیجه را ذخیره می‌کند.
description: قدم‌به‌قدم تکمیل نصب اپ دیدار؛ لینک نصب، تأیید ادمین، callback با code و state، درخواست CompleteInstallation، فیلدهای پاسخ و ذخیره‌ی نتیجه.
---

![Installation flowchart: install link, Allow & Install, Callback URL, state check, CompleteInstallation, store, account, setup](/images/flows/installation-flow.png "کل جریان در یک نگاه؛ شماره‌ها همان قدم‌های این صفحه است")

## قدم ۱: فرستادن ادمین به صفحه‌ی نصب {#step-1}

ادمین **لینک نصب** اپ را باز می‌کند. این لینک را از Developer Hub با **Share install link** برمی‌داری. [اشتراک اپ](/registering-an-app#install-link)

اگر ادمین را از سایت خودت به لینک نصب می‌فرستی، پیش از آن یک مقدار [state](/state-parameter) بساز و در session نگه دار.

## قدم ۲: ادمین اپ را تأیید می‌کند {#step-2}

دیدار نام اپ و سازنده، BizDomain، دسترسی‌ها و کاربرانی را که به اپ دسترسی خواهند داشت نشان می‌دهد. ادمین **تأیید دسترسی به اطلاعات و نصب** را می‌زند. [جریان نصب اپ](/app-installation-flows)

## قدم ۳: بازگشت به Callback URL {#step-3}

دیدار مرورگر ادمین را به Callback URL اپ برمی‌گرداند:

```http title="GET"
https://your-app.example.com/didar/callback?code=INSTALLATION_CODE&state=STATE
```

| پارامتر query | توضیح |
| --- | --- |
| `code` | کد نصب؛ در قدم ۴ استفاده می‌شود. |
| `state` | اگر ساخته باشی، همان مقدار برمی‌گردد. پیش از ادامه با مقدار session مقایسه کن. |

## قدم ۴: تکمیل نصب {#step-4}

سرور تو `code` را همراه credentials اپ به دیدار می‌فرستد. این درخواست server-to-server است و به ورود کاربر دیدار نیاز ندارد.

```http title="POST"
https://app.didar.me/api/MarketplaceInstall/CompleteInstallation
```

| هدر | مقدار |
| --- | --- |
| `Content-Type` | `application/json` |

| پارامتر بدنه | توضیح |
| --- | --- |
| `Code` | مقدار `code` از قدم ۳. |
| `ClientId` | Client ID اپ. |
| `ClientSecret` | Client secret اپ. |

```bash title="cURL"
curl --location 'https://app.didar.me/api/MarketplaceInstall/CompleteInstallation' \
--header 'Content-Type: application/json' \
--data-raw '{
  "Code": "INSTALLATION_CODE",
  "ClientId": "YOUR_CLIENT_ID",
  "ClientSecret": "YOUR_CLIENT_SECRET"
}'
```

```json title="200 OK"
{
  "Response": {
    "Succeeded": true,
    "Data": {
      "InstallationId": 14,
      "AppPublicId": "d38a8368-645d-4181-bc14-0e7b65020b5a",
      "BizDomainId": "ffc39d03-0fcf-467d-88cc-b645ad92bf7c",
      "ApiKey": "INSTALLATION_API_KEY",
      "Scopes": ["basicinfo", "deals", "activities.fullaccess"],
      "InstalledAt": "2026-09-29T09:55:22Z"
    },
    "Error": null,
    "Meta": { "TraceId": "TRACE_ID", "CorrelationId": null }
  }
}
```

| کلید JSON | توضیح |
| --- | --- |
| `Response.Succeeded` | موفق بودن تکمیل نصب. |
| `Response.Data.InstallationId` | شناسه‌ی این نصب. |
| `Response.Data.AppPublicId` | شناسه‌ی عمومی اپ؛ در صفحه‌ی تنظیمات همان `runtimeId` است. |
| `Response.Data.BizDomainId` | کسب‌وکاری که اپ رویش نصب شد. |
| `Response.Data.ApiKey` | کلید نصب؛ فقط رمزگذاری‌شده نگه‌داری شود. |
| `Response.Data.Scopes` | scopeهایی که ادمین تأیید کرد. |
| `Response.Data.InstalledAt` | زمان نصب (UTC). |
| `Response.Meta.TraceId` | شناسه‌ی پیگیری برای پشتیبانی. |

> [!NOTE]
> قالب این پاسخ با بقیه‌ی APIهای مارکت‌پلیس فرق دارد: PascalCase است و نتیجه داخل `Response` قرار دارد.

> [!WARNING]
> اگر `INVALID_CLIENT_CREDENTIALS` گرفتی، Client ID و Client secret را با Developer Hub مقایسه کن؛ شاید secret را Refresh کرده‌ای.

## قدم ۵: ذخیره‌ی نتیجه {#step-5}

| داده | چرا |
| --- | --- |
| `BizDomainId` و `InstallationId` | کلید اصلی هر نصب. یک اپ می‌تواند روی چند BizDomain نصب باشد. |
| `Scopes` | بدانی در این کسب‌وکار کدام قابلیت‌ها مجازند. |
| `ApiKey` | فقط رمزگذاری‌شده در secret storage. |
| زمان نصب و وضعیت فعال/لغوشده | مدیریت چرخه‌ی عمر نصب. |

سپس ادمین را به قدم بعدی در اپ خودت ببر. [سناریوهای بعد از تأیید](/app-installation-flows#allow-and-install)

## بعد از این بخوان {#read-next}

- [Runtime Token](/runtime-token)
- [مرجع API: تکمیل نصب](/api-auth#complete-installation)
- [پارامتر state](/state-parameter)
