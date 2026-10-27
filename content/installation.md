---
title: احراز هویت و نصب
section: reference
order: 2
lead: این صفحه کمک می‌کند جریان نصب را پیاده کنی؛ نصب، اپ را به یک BizDomain متصل می‌کند و scopeهایی را که کاربر تأیید کرده ثبت می‌کند.
description: فرایند نصب اپ، CompleteInstallation، پارامتر state و ذخیره‌سازی امن نتیجه.
---

## مراحل نصب {#steps}

| قدم | چه اتفاقی می‌افتد |
| --- | --- |
| ۱. ارسال کاربر به صفحه‌ی نصب | از Installation URL تولیدشده هنگام ثبت اپ استفاده کن. کاربر کسب‌وکار و دسترسی‌های اپ را در دیدار می‌بیند و تأیید می‌کند. |
| ۲. دریافت code در callback | دیدار کاربر را به Callback URL برمی‌گرداند و `code` و در صورت وجود `state` را در query قرار می‌دهد. |
| ۳. Complete کردن نصب | backend اپ، `code` را همراه credentials به endpoint دیدار می‌فرستد. این درخواست به credential کاربر دیدار نیاز ندارد. |
| ۴. ثبت نتیجه | نتیجه را بر اساس `BizDomainId` ذخیره کن. یک اپ می‌تواند روی چند BizDomain نصب شود. |

## CompleteInstallation {#complete}

```http title="POST"
POST https://app.didar.me/api/MarketplaceInstall/CompleteInstallation
```

فقط server-to-server است. احراز هویت کاربر دیدار لازم نیست.

```bash title="cURL"
curl --request POST \
  --url https://app.didar.me/api/MarketplaceInstall/CompleteInstallation \
  --header "Content-Type: application/json" \
  --data '{
    "Code": "INSTALLATION_CODE",
    "ClientId": "YOUR_CLIENT_ID",
    "ClientSecret": "YOUR_CLIENT_SECRET"
  }'
```

پاسخ دیدار یک envelope بیرونی دارد (casing با PascalCase)؛ نتیجه‌ی عملیات در `Response` قرار می‌گیرد:

```json title="Response 200"
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
    "Meta": { "TraceId": "...", "CorrelationId": null }
  }
}
```

> [!NOTE]
> این envelope با envelope استاندارد APIهای مارکت‌پلیس (`succeeded` / `data` / `error` / `meta` با camelCase) فرق دارد. [مفاهیم پایه API](/api-concepts)

## استفاده از state {#state}

پیش از redirect یک مقدار تصادفی و یک‌بارمصرف بساز، آن را به session نصب متصل کن و هنگام callback با `state` دریافتی مقایسه کن. این کار جلوی متصل شدن callback جعلی به session اشتباه را می‌گیرد.

## چه چیزی ذخیره شود؟ {#store}

- `InstallationId` و `BizDomainId` برای تشخیص نصب
- scopeهای تأییدشده برای نمایش قابلیت‌های قابل استفاده
- کلید نصب (`ApiKey`) فقط به‌شکل رمزگذاری‌شده در secret storage
- زمان نصب و وضعیت فعال/لغوشده

> [!WARNING]
> **نکته‌ی امنیتی.** `ClientSecret` و `ApiKey` را در URL، log، analytics، پاسخ browser یا کد frontend قرار نده.

## خطاهای رایج {#errors}

| خطا | علت | راه‌حل |
| --- | --- | --- |
| `INVALID_CLIENT_CREDENTIALS` | `ClientId` یا `ClientSecret` اشتباه است | credentials را از secret store بخوان و مقایسه کن |
| callback جعلی یا session اشتباه | `state` مقایسه نشده | `state` یک‌بارمصرف بساز و تطبیق بده |

## قدم بعدی {#next}

- [Launch Code و Runtime](/runtime): بعد از نصب، هر اجرا با یک launch code شروع می‌شود.
