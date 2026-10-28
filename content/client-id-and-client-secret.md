---
title: Client ID و Client secret
section: start
order: 14
lead: Client ID و Client secret هویت اپ تو را به دیدار ثابت می‌کنند. سرور تو با این دو، نصب را کامل می‌کند و هر launchCode را به Runtime Token تبدیل می‌کند.
description: کجا Client ID و Client secret اپ دیدار را پیدا کنی، کجا استفاده می‌شوند و چطور Client secret را عوض کنی.
---

## کجا استفاده می‌شوند؟ {#usage}

| درخواست | نام فیلدها در بدنه | مرجع |
| --- | --- | --- |
| تکمیل نصب | `ClientId`، `ClientSecret` (PascalCase) | [CompleteInstallation](/api-auth#complete-installation) |
| دریافت Runtime Token | `clientId`، `clientSecret` (camelCase) | [runtime/token](/api-auth#runtime-token) |

هر دو درخواست فقط از backend فرستاده می‌شوند.

## Client ID و Client secret را کجا پیدا کنم؟ {#find}

### اپ جدید {#new-apps}

1. در [Developer Hub](/developer-hub) روی **Create an app** بزن.
2. App name و Callback URL را وارد کن و Save بزن.
3. در صفحه‌ی ویرایش، به تب **OAuth & access scopes** برو. Client ID و Client secret پایین همین تب هستند.

### اپ موجود {#existing-apps}

در My apps از منوی ⋯ اپ گزینه‌ی **Edit app** را بزن و به تب **OAuth & access scopes** برو. Client secret پیش‌فرض پنهان است؛ با آیکون چشم نمایشش بده یا مستقیم کپی کن.

> [!WARNING]
> Client secret را در کد frontend، مخزن git، URL، log یا analytics قرار نده. آن را در secret store سرورت نگه دار.

## Client secret را چطور عوض کنم؟ {#refresh}

اگر secret لو رفته یا سیاست امنیتی‌ات می‌خواهد:

1. در تب **OAuth & access scopes**، روی **Refresh** بالای فیلد Client secret بزن.
2. در پنجره‌ی تأیید، **Generate new client secret** را بزن.
3. secret جدید را کپی کن و فوراً در تنظیمات سرورت بگذار.

بعد از عوض کردن:

- **secret قبلی همان لحظه از کار می‌افتد.** تا secret جدید را در سرورت نگذاری، تکمیل نصب و دریافت token با `INVALID_CLIENT_CREDENTIALS` شکست می‌خورند.
- tokenهایی که قبلاً صادر شده‌اند باطل نمی‌شوند.
- Client ID تغییر نمی‌کند. Client ID یک اپ موجود را نمی‌توان عوض کرد.

## بعد از این بخوان {#read-next}

- [مرور احراز هویت](/authentication)
- [تکمیل نصب](/installation-authorization)
- [Runtime Token](/runtime-token)
