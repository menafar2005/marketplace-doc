---
title: مرور احراز هویت
section: start
order: 30
lead: اپ دیدار با دو چیز احراز هویت می‌شود؛ credentials اپ (Client ID و Client secret) که هویت خود اپ است، و Runtime Token که برای هر اجرای اکستنشن جدا صادر می‌شود و درخواست‌های داده با آن فرستاده می‌شوند.
description: مدل احراز هویت مارکت‌پلیس دیدار؛ credentials اپ، Runtime Token و آنچه به آن گره خورده، قدم‌های رسیدن به token و احراز هویت درخواست‌ها.
---

> [!NOTE]
> اگر با MCP دیدار کار می‌کنی، ابزار `scaffold_plugin` کل جریان نصب و تبدیل launchCode را برایت می‌سازد. [ساخت با MCP](/build-with-mcp)

## دو نوع credential {#credentials}

| credential | کی ساخته می‌شود | با آن چه کار می‌کنی | کجا نگه‌داری می‌شود |
| --- | --- | --- | --- |
| **Client ID و Client secret** | یک‌بار، هنگام [ثبت اپ](/registering-an-app) | تکمیل نصب و تبدیل `launchCode` به Runtime Token | secret store سرور |
| **Runtime Token** | هر بار که کاربر یک اکستنشن یا تنظیمات اپ را اجرا می‌کند | درخواست به APIهای داده‌ی دیدار | فقط در حافظه، تا پایان همان اجرا |

بعد از نصب یک **کلید نصب** (`ApiKey`) هم می‌گیری که باید رمزگذاری‌شده ذخیره شود. درخواست‌های داده با این کلید فرستاده نمی‌شوند؛ مارکت‌پلیس خودش نصب را از Runtime Token تشخیص می‌دهد.

## Runtime Token به چه چیزی گره خورده است؟ {#token}

هر Runtime Token به این‌ها گره خورده و فقط در همین محدوده کار می‌کند:

- **نصب:** اپ تو روی یک BizDomain مشخص
- **کاربر:** کاربری که اکستنشن را اجرا کرده
- **scopeها:** دسترسی‌هایی که ادمین هنگام نصب تأیید کرده
- **context:** اکستنشن، Location و رکوردهایی (`entityIds`) که این اجرا روی آن‌ها کار می‌کند
- **زمان انقضا:** در نمونه‌ی مستند ۳۰۰ ثانیه

پس حتی با scope کامل، اپ فقط روی رکوردهای همان اجرا کار می‌کند. این بزرگ‌ترین تفاوت دیدار با مدل‌های OAuth رایج است: token بلندمدت و refresh token وجود ندارد.

## قدم‌های رسیدن به Runtime Token {#steps}

1. **[محیط تست](/test-environment) را آماده کن:** ادمین یک BizDomain باش.
2. **[اپ را ثبت کن](/registering-an-app):** Client ID و Client secret بگیر و scopeها را انتخاب کن.
3. **[نصب را کامل کن](/installation-authorization):** `code` نصب را با `CompleteInstallation` تبدیل کن.
4. **[launchCode را تبدیل کن](/runtime-token):** در هر اجرا `launchCode` را با `/api/v1/runtime/token` به Runtime Token تبدیل کن.

## درخواست‌ها را چطور احراز هویت کنم؟ {#requests}

Runtime Token را در هدر `Authorization` همه‌ی درخواست‌های داده بفرست:

```bash title="cURL"
curl --location 'https://marketplace.didar.me/api/v1/deals/704e1533-cb4b-42d7-895d-ef71ff32ba5b' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Accept: application/json'
```

فرستادن `BizDomainId` یا کلید API دیدار لازم نیست. [درخواست‌ها](/api-requests)

## بعد از این بخوان {#read-next}

- [تکمیل نصب](/installation-authorization)
- [Runtime Token](/runtime-token)
- [Scopeها و دسترسی‌ها](/scopes)
- [پارامتر state](/state-parameter)
