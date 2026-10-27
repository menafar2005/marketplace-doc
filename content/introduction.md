---
title: مارکت‌پلیس دیدار را بشناس
section: start
order: 1
lead: این صفحه کمک می‌کند بفهمی اپ third-party چطور به دیدار وصل می‌شود، چه چیزی را می‌بیند و چه چیزی را نمی‌بیند.
description: مسیر کامل ساخت، نصب و اجرای یک اپ Third-party روی مارکت‌پلیس دیدار؛ از کد نصب تا Runtime Token و دسترسی کنترل‌شده به داده‌های CRM.
---

> [!NOTE]
> **MCP وصل است؟** از آن بپرس «ساختار مارکت‌پلیس دیدار را توضیح بده». [اتصال به MCP](/build-with-mcp)

## دو دامنه، دو مسئولیت {#domains}

| دامنه | کاربرد |
| --- | --- |
| `https://app.didar.me` | جریان نصب؛ تکمیل نصب با `CompleteInstallation` |
| `https://marketplace.didar.me` | دریافت Runtime Token و فراخوانی APIهای پروکسی |

## معماری کلی {#architecture}

مرورگر کاربر هرگز کلید API دیدار یا Client Secret اپ را دریافت نمی‌کند. دیدار یک `launchCode` کوتاه‌عمر می‌سازد و آن را به endpoint اپ تو می‌فرستد. backend اپ این کد را همراه credentials خودش با یک JWT کوتاه‌عمر عوض می‌کند.

| قدم | چه اتفاقی می‌افتد |
| --- | --- |
| ۱. نصب اپ | کاربر نصب را در دیدار تأیید می‌کند. callback تو یک `code` می‌گیرد و آن را در دیدار Complete می‌کند. |
| ۲. اجرای اکستنشن | دیدار اکستنشن را با `launchCode` باز می‌کند؛ برای JSON، iframe و action link همین اصل برقرار است. |
| ۳. تبادل کد | backend اپ، launch code را با Runtime Token و context اجرا عوض می‌کند. |
| ۴. دسترسی به CRM | اپ فقط از APIهای پروکسی مارکت‌پلیس و فقط در محدوده‌ی scope و entityهای context استفاده می‌کند. |

## چرخه عمر یک اپ {#lifecycle}

ثبت اپ ← نصب ← اجرا ← (حذف نصب). هر مرحله صفحه‌ی خودش را دارد:

| اگر می‌خواهی… | برو… |
| --- | --- |
| بدانی اپ از چه بخش‌هایی ساخته می‌شود | [آناتومی یک پلاگین](/anatomy) |
| یک launch code را به token تبدیل کنی و اولین درخواست را بفرستی | [شروع سریع](/quick-start) |
| ClientId و ClientSecret بگیری | [ثبت و مدیریت اپ](/app-registration) |
| نصب را پیاده کنی | [احراز هویت و نصب](/installation) |
| بدانی context اجرا چیست | [Launch Code و Runtime](/runtime) |
| UI داخل دیدار نشان بدهی | [App Extensions](/extensions) |
| داده‌ی CRM بخوانی یا بنویسی | [API دیدار](/api-concepts) |

## قواعدی که باید همیشه رعایت شوند {#rules}

- `ClientSecret`، کلید نصب و Runtime Token را فقط در backend نگه دار.
- هر `launchCode` یک‌بارمصرف و کوتاه‌عمر است؛ آن را ذخیره یا log نکن.
- هر درخواست پروکسی هم scope اپ و هم محدوده‌ی entity موجود در Runtime Context را بررسی می‌کند.
- endpointهای launch باید HTTPS باشند. برای JSON extension، CORS را فقط برای origin دقیق دیدار باز کن.
- به HTTP status و فیلد `succeeded` توجه کن؛ متن خطا را به‌عنوان قرارداد منطقی parse نکن.

## پلاگین چه کارهایی نمی‌تواند بکند {#limits}

- به داده‌ای خارج از scopeهایی که کاربر هنگام نصب تأیید کرده دسترسی ندارد.
- روی entityای که در `entityIds` همان اجرا نیست، عملیات نمی‌تواند انجام دهد (`RUNTIME_ENTITY_ACCESS_DENIED`).
- کلید API دیدار را نمی‌بیند؛ آن فقط در سمت سرور مارکت‌پلیس استفاده می‌شود.
- Runtime Token را نمی‌شود برای اجرای بعدی reuse کرد.

> [!NOTE]
> قبل از انتشار عمومی، نمونه درخواست‌ها و نام دامنه‌ها را در محیط staging هم بررسی کن.
