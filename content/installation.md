---
title: ۲. پیاده‌سازی نصب
section: start
order: 11
lead: در این قدم Callback URL را روی سرورت پیاده می‌کنی و اپ را روی BizDomain خودت نصب می‌کنی. نصب، اپ را به یک کسب‌وکار وصل می‌کند و دسترسی‌هایی را که ادمین تأیید کرده ثبت می‌کند.
description: جریان نصب اپ مارکت‌پلیس دیدار، پیاده‌سازی Callback URL، فراخوانی CompleteInstallation، state و ذخیره‌ی امن نتیجه.
---

## نصب از دید ادمین {#admin-view}

1. ادمین **لینک نصب** اپ را باز می‌کند. این لینک را در Developer Hub از منوی ⋯ کنار اپ با **Share install link** (یا دکمه‌ی **Share app** در صفحه‌ی ویرایش) برمی‌داری.
2. دیدار صفحه‌ی تأیید را نشان می‌دهد: نام اپ و سازنده، BizDomainی که اپ رویش نصب می‌شود، فهرست دسترسی‌ها، و اینکه کدام کاربران به اپ دسترسی داشته باشند.
3. ادمین **تأیید دسترسی به اطلاعات و نصب** را می‌زند.
4. دیدار مرورگر ادمین را به **Callback URL** اپ تو برمی‌گرداند و `code` (و اگر داشته باشی `state`) را در query می‌گذارد.

از قدم ۴ به بعد کار سرور توست.

## کار سرور تو: سه قدم {#steps}

| قدم | چه کار کنی |
| --- | --- |
| ۱. code را بگیر | `code` و `state` را از query درخواست callback بخوان. |
| ۲. نصب را کامل کن | `code` را همراه Client ID و Client secret به `CompleteInstallation` بفرست. این درخواست server-to-server است و به ورود کاربر دیدار نیاز ندارد. |
| ۳. نتیجه را ذخیره کن | `BizDomainId`، scopeها و کلید نصب را ذخیره کن و به ادمین یک صفحه‌ی «نصب شد» نشان بده. |

## درخواست CompleteInstallation {#complete}

```bash title="cURL"
curl --location 'https://app.didar.me/api/MarketplaceInstall/CompleteInstallation' \
--header 'Content-Type: application/json' \
--data-raw '{
  "Code": "INSTALLATION_CODE",
  "ClientId": "YOUR_CLIENT_ID",
  "ClientSecret": "YOUR_CLIENT_SECRET"
}'
```

پاسخ موفق:

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

> [!NOTE]
> قالب این پاسخ با بقیه‌ی APIهای مارکت‌پلیس فرق دارد: PascalCase است و نتیجه داخل `Response` قرار دارد. همه‌ی فیلدها در [مرجع API: تکمیل نصب](/api-auth#complete-installation).

## نمونه‌ی کد callback {#code}

```js title="routes/callback.js (Express)"
app.get("/didar/callback", async (req, res) => {
  const { code, state } = req.query;

  // اگر state ساخته‌ای، اینجا با مقدار session مقایسه کن
  if (state && state !== req.session.installState) {
    return res.status(400).send("Invalid state");
  }

  const r = await fetch(
    "https://app.didar.me/api/MarketplaceInstall/CompleteInstallation",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Code: code,
        ClientId: process.env.DIDAR_CLIENT_ID,
        ClientSecret: process.env.DIDAR_CLIENT_SECRET,
      }),
    }
  );
  const result = (await r.json()).Response;
  if (!r.ok || !result?.Succeeded) {
    return res.status(502).send("Installation failed");
  }

  const { InstallationId, BizDomainId, Scopes, ApiKey, InstalledAt } = result.Data;
  await db.installations.upsert({
    bizDomainId: BizDomainId,
    installationId: InstallationId,
    scopes: Scopes,
    apiKey: encrypt(ApiKey), // فقط رمزگذاری‌شده
    installedAt: InstalledAt,
    active: true,
  });

  res.send("نصب کامل شد. می‌توانی به دیدار برگردی.");
});
```

## state چیست و چرا مهم است؟ {#state}

اگر کاربر را از سایت خودت به صفحه‌ی نصب می‌فرستی، پیش از آن یک مقدار تصادفی و یک‌بارمصرف بساز، در session کاربر نگه دار و در callback با `state` برگشتی مقایسه کن. این کار نمی‌گذارد یک callback جعلی به session اشتباه وصل شود.

## چه چیزی ذخیره کنی؟ {#store}

| داده | چرا |
| --- | --- |
| `BizDomainId` و `InstallationId` | کلید اصلی هر نصب. یک اپ می‌تواند روی چند BizDomain نصب باشد. |
| `Scopes` | بدانی در این کسب‌وکار کدام قابلیت‌ها مجازند. |
| `ApiKey` | فقط رمزگذاری‌شده در secret storage. |
| زمان نصب و وضعیت فعال/لغوشده | مدیریت چرخه‌ی عمر نصب. |

> [!WARNING]
> Client secret و `ApiKey` را در URL، log، analytics، پاسخ مرورگر یا کد frontend قرار نده.

## امتحانش کن {#try}

1. سرورت را با Callback URL ثبت‌شده بالا بیاور.
2. در Developer Hub لینک نصب اپ را بردار و در مرورگری که با ادمین BizDomain خودت وارد شده‌ای باز کن.
3. نصب را تأیید کن. باید به callback تو برگردی و رکورد نصب در دیتابیس ساخته شود.

اگر `INVALID_CLIENT_CREDENTIALS` گرفتی، Client ID و Client secret را با مقدار Developer Hub مقایسه کن (شاید secret را Refresh کرده باشی).

## قدم بعدی {#next}

[۳. اجرای اکستنشن و گرفتن token](/launch): وقتی کاربر «ایجاد جلسه» را می‌زند، چه اتفاقی روی سرور تو می‌افتد.
