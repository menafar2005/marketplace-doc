---
title: مرور احراز هویت
section: start
order: 30
lead: پلاگین دیدار با دو چیز احراز هویت می‌شود؛ credentials پلاگین (Client ID و Client secret) که هویت خود پلاگین است، و Runtime Token که برای هر اجرای اکستنشن جدا صادر می‌شود و درخواست‌های داده با آن فرستاده می‌شوند. این صفحه تصویر کلی این دو را می‌دهد؛ اینکه هر کدام چیست، کجا به کار می‌رود، به چه چیزی گره خورده و چرا این‌طور طراحی شده.
description: مدل احراز هویت مارکت‌پلیس دیدار؛ credentials پلاگین، کلید نصب، Runtime Token و آنچه به آن گره خورده، تفاوت با OAuth رایج، قدم‌های رسیدن به token و احراز هویت درخواست‌ها.
---

> [!NOTE]
> اگر با MCP دیدار کار می‌کنی، ابزار `scaffold_plugin` کل جریان نصب و تبدیل launchCode را برایت می‌سازد. [ساخت با MCP](/build-with-mcp)

## دو سؤال، دو credential {#credentials}

هر بار که سرور تو با دیدار حرف می‌زند، دیدار باید جواب دو سؤال را بداند: «این واقعاً همان پلاگین است؟» و «این پلاگین الان اجازه‌ی چه کاری را دارد؟». مارکت‌پلیس برای هر سؤال یک credential جدا دارد:

| credential | به چه سؤالی جواب می‌دهد | کی ساخته می‌شود | با آن چه کار می‌کنی | کجا نگه‌داری می‌شود |
| --- | --- | --- | --- | --- |
| **Client ID و Client secret** | این کدام پلاگین است؟ | یک‌بار، هنگام [ثبت پلاگین](/registering-an-app) | تکمیل نصب و تبدیل `launchCode` به Runtime Token | secret store سرور |
| **Runtime Token** | این پلاگین الان روی چه چیزی اجازه دارد؟ | هر بار که کاربر یک اکستنشن یا تنظیمات پلاگین را اجرا می‌کند | درخواست به APIهای داده‌ی دیدار | فقط در حافظه، تا پایان همان اجرا |

credentials پلاگین هیچ‌وقت مستقیم برای خواندن داده به کار نمی‌روند؛ فقط برای گرفتن چیزهای دیگرند (تکمیل نصب، Runtime Token). و Runtime Token هیچ‌وقت بیشتر از یک اجرا عمر نمی‌کند.

بعد از نصب یک **کلید نصب** (`ApiKey`) هم می‌گیری که باید رمزگذاری‌شده ذخیره شود. درخواست‌های داده با این کلید فرستاده نمی‌شوند؛ مارکت‌پلیس خودش نصب را از Runtime Token تشخیص می‌دهد.

## Runtime Token به چه چیزی گره خورده است؟ {#token}

هر Runtime Token به این‌ها گره خورده و فقط در همین محدوده کار می‌کند:

- **نصب:** پلاگین تو روی یک BizDomain مشخص
- **کاربر:** کاربری که اکستنشن را اجرا کرده
- **scopeها:** دسترسی‌هایی که ادمین هنگام نصب تأیید کرده
- **context:** اکستنشن، Location و رکوردهایی (`entityIds`) که این اجرا روی آن‌ها کار می‌کند
- **زمان انقضا:** در نمونه‌ی مستند ۳۰۰ ثانیه

![Data request checks: token, scope, record type, entityIds](/images/flows/request-checks.png "هر درخواست داده با Runtime Token از این بررسی‌ها رد می‌شود")

پس حتی با scope کامل، پلاگین فقط روی رکوردهای همان اجرا کار می‌کند.

## فرقش با OAuth رایج چیست؟ {#vs-oauth}

اگر قبلاً با OAuth کار کرده باشی، نصب در دیدار آشنا به نظر می‌رسد: ادمین دسترسی‌ها را می‌بیند و تأیید می‌کند، و سرور تو یک `code` را با Client ID و secret مبادله می‌کند. ولی از اینجا به بعد مدل دیدار فرق دارد:

| | OAuth رایج | مارکت‌پلیس دیدار |
| --- | --- | --- |
| بعد از نصب | access token و refresh token بلندمدت می‌گیری | نتیجه‌ی نصب و کلید نصب می‌گیری، نه token داده |
| کی می‌توانی داده بخوانی | هر وقت، با token ذخیره‌شده | فقط در طول یک اجرا که کاربر شروع کرده |
| دامنه‌ی دسترسی | همه‌ی داده‌ی مجاز با scope | فقط رکوردهای همان اجرا، در محدوده‌ی scope |
| مدیریت token | ذخیره، رمزگذاری و refresh با تو | لازم نیست؛ هر اجرا token خودش را می‌گیرد |

این طراحی یعنی پلاگین تو هیچ‌وقت کلیدی ندارد که با آن بتوان بدون حضور کاربر کل داده‌ی یک کسب‌وکار را خواند. [چرا این‌طور طراحی شده](/about-the-marketplace#why)

## قدم‌های رسیدن به Runtime Token {#steps}

![Extension launch flowchart: launchCode, runtime token, context checks, data API, response](/images/flows/runtime-flow.png)

1. **[محیط تست](/test-environment) را آماده کن:** ادمین یک BizDomain باش.
2. **[پلاگین را ثبت کن](/registering-an-app):** Client ID و Client secret بگیر و scopeها را انتخاب کن.
3. **[نصب را کامل کن](/installation-authorization):** `code` نصب را با `CompleteInstallation` تبدیل کن.
4. **[launchCode را تبدیل کن](/runtime-token):** در هر اجرا `launchCode` را با `/api/v1/runtime/token` به Runtime Token تبدیل کن.

## درخواست‌ها را چطور احراز هویت کنم؟ {#requests}

Runtime Token را در هدر `Authorization` همه‌ی درخواست‌های داده بفرست:

```bash title="cURL"
curl --location 'https://marketplace.didar.me/api/v1/deals/704e1533-cb4b-42d7-895d-ef71ff32ba5b' \
--header 'Authorization: Bearer RUNTIME_ACCESS_TOKEN' \
--header 'Accept: application/json'
```

فرستادن `BizDomainId` یا کلید API دیدار لازم نیست. [درخواست‌ها](/api-requests) · [تمپلیت کلاینت](/runtime-token#template)

## بعد از این بخوان {#read-next}

- [جریان نصب از دید ادمین](/app-installation-flows)
- [تکمیل نصب](/installation-authorization)
- [Runtime Token](/runtime-token)
- [Scopeها و دسترسی‌ها](/scopes)
