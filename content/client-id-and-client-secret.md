---
title: Client ID و Client secret
section: start
order: 14
lead: Client ID و Client secret هویت پلاگین تو را به دیدار ثابت می‌کنند؛ مثل نام کاربری و رمز، ولی برای خود پلاگین. سرور تو با این دو، نصب را کامل می‌کند و هر launchCode را به Runtime Token تبدیل می‌کند. این صفحه می‌گوید این دو کجا پیدا می‌شوند، کجا به کار می‌روند، چطور نگه‌داری شوند و چطور secret را عوض کنی.
description: Client ID و Client secret پلاگین دیدار؛ چیست، کجا پیدا کنی، در کدام درخواست‌ها به کار می‌روند، نگه‌داری امن و Refresh کردن Client secret.
---

## Client ID و Client secret چیست؟ {#what}

دیدار باید مطمئن باشد درخواستی که می‌گوید «من پلاگین Meet هستم» واقعاً از سرور سازنده‌ی Meet می‌آید. **Client ID** شناسه‌ی عمومی پلاگین است و گفتنش رازی را فاش نمی‌کند. **Client secret** رمز پلاگین است و فقط سرور تو آن را می‌داند. وقتی سرور تو هر دو را می‌فرستد، دیدار مطمئن می‌شود طرف مقابل واقعاً همان پلاگین است.

این دو را دیدار هنگام ساخت پلاگین در Developer Hub می‌سازد. Client ID هیچ‌وقت عوض نمی‌شود؛ Client secret را هر وقت لازم بود می‌توانی عوض کنی.

## کجا استفاده می‌شوند؟ {#usage}

credentials پلاگین فقط در دو درخواست به کار می‌روند، و در هر دو در بدنه‌ی درخواست می‌روند، نه در هدر:

| درخواست | کی | نام فیلدها در بدنه | مرجع |
| --- | --- | --- | --- |
| تکمیل نصب | یک‌بار برای هر کسب‌وکار | `ClientId`، `ClientSecret` (PascalCase) | [CompleteInstallation](/api-auth#complete-installation) |
| دریافت Runtime Token | در هر اجرای اکستنشن | `clientId`، `clientSecret` (camelCase) | [runtime/token](/api-auth#runtime-token) |

به casing متفاوت دقت کن؛ نام اشتباه یعنی خطای `INVALID_CLIENT_CREDENTIALS`. هر دو درخواست فقط از backend فرستاده می‌شوند. درخواست‌های داده با credentials پلاگین فرستاده نمی‌شوند؛ آن‌ها Runtime Token لازم دارند.

## Client ID و Client secret را کجا پیدا کنم؟ {#find}

### پلاگین جدید {#new-apps}

1. در [Developer Hub](/developer-hub) روی **Create an app** بزن.
2. App name و Callback URL را وارد کن و Save بزن.
3. در صفحه‌ی ویرایش، به تب **OAuth & access scopes** برو. Client ID و Client secret پایین همین تب هستند.

### پلاگین موجود {#existing-apps}

در My apps از منوی ⋯ پلاگین گزینه‌ی **Edit app** را بزن و به تب **OAuth & access scopes** برو. Client secret پیش‌فرض پنهان است؛ با آیکون چشم نمایشش بده یا مستقیم کپی کن.

## نگه‌داری امن {#storing}

Client secret را مثل رمز پایگاه داده نگه دار: در متغیر محیطی یا secret manager سرورت، و فقط جایی که backend به آن نیاز دارد. همه‌ی تمپلیت‌های این داک آن را از متغیر محیطی `DIDAR_CLIENT_SECRET` می‌خوانند.

> [!WARNING]
> Client secret را در کد frontend، مخزن git، URL، log یا analytics قرار نده. هر کسی secret را داشته باشد می‌تواند خودش را جای پلاگین تو جا بزند.

## Client secret را چطور عوض کنم؟ {#refresh}

اگر secret لو رفته یا سیاست امنیتی‌ات می‌خواهد:

1. در تب **OAuth & access scopes**، روی **Refresh** بالای فیلد Client secret بزن.
2. در پنجره‌ی تأیید، **Generate new client secret** را بزن.
3. secret جدید را کپی کن و فوراً در تنظیمات سرورت بگذار.

بعد از عوض کردن:

- **secret قبلی همان لحظه از کار می‌افتد.** تا secret جدید را در سرورت نگذاری، تکمیل نصب و دریافت token با `INVALID_CLIENT_CREDENTIALS` شکست می‌خورند. اگر پلاگین Live است، یعنی در این فاصله هیچ کاربری نمی‌تواند از آن استفاده کند؛ پس عوض کردن secret و به‌روز کردن سرور را پشت سر هم انجام بده.
- tokenهایی که قبلاً صادر شده‌اند باطل نمی‌شوند.
- Client ID تغییر نمی‌کند. Client ID یک پلاگین موجود را نمی‌توان عوض کرد.

## بعد از این بخوان {#read-next}

- [مرور احراز هویت](/authentication)
- [تکمیل نصب](/installation-authorization)
- [Runtime Token](/runtime-token)
