---
title: مرور اکستنشن‌ها
section: start
order: 20
lead: اکستنشن‌ها قابلیت پلاگین تو را داخل UI دیدار می‌آورند؛ در منوی عملیات، به‌شکل پنل در صفحه‌ی جزئیات، یا در تنظیمات پلاگین. کاربر به‌لطف آن‌ها بدون جابه‌جا شدن بین ابزارها از پلاگین تو استفاده می‌کند. این صفحه همه‌ی انواع اکستنشن را معرفی و مقایسه می‌کند تا بدانی برای نیازت کدام را انتخاب کنی.
description: اکستنشن‌های مارکت‌پلیس دیدار؛ Links، JSON modal، JSON panel، Custom modal، Custom panel و App settings، سازوکار مشترک، ساختار JSON، Marketplace SDK، Locationها، ظرفیت‌ها، مقایسه و راهنمای انتخاب.
---

## اکستنشن چیست؟ {#what}

**اکستنشن** جایی از UI دیدار است که پلاگین تو در آن ظاهر می‌شود. بدون اکستنشن، پلاگین تو فقط یک سرور است که دیدار از وجودش خبر دارد ولی کاربر هیچ‌جا آن را نمی‌بیند. با اکستنشن‌ها کاربر می‌تواند همان‌جا که کار می‌کند (روی همان معامله، شخص یا شرکتی که باز کرده) از پلاگین تو استفاده کند.

اکستنشن‌ها در سه جای دیدار می‌نشینند: **منوی عملیات** صفحه‌های جزئیات و لیست، **ستون کناری** صفحه‌های جزئیات، و **تنظیمات** اپ‌های نصب‌شده. در هر جا هم دو راه داری: UI را دیدار از روی یک فایل JSON بسازد، یا UI را خودت بسازی.

## سازوکار مشترک همه‌ی اکستنشن‌ها {#common}

همه‌ی اکستنشن‌ها، با هر شکل و جایی، از یک قاعده پیروی می‌کنند: وقتی کاربر اکستنشن را اجرا می‌کند، دیدار یک `launchCode` به آدرس ثبت‌شده‌ی آن اضافه می‌کند و سرور تو آن را به [Runtime Token](/runtime-token) تبدیل می‌کند. Runtime Context همان اجرا می‌گوید کاربر کجا بوده و روی کدام رکوردها (`entityIds`) کار می‌کند.

این یعنی وقتی یک اکستنشن را ساختی، ساختن بقیه بیشتر انتخاب جای نمایش و نوع UI است؛ بخش اصلی سرور (تبدیل کد، چک کردن context، کار با API) یکی است.

فرق اصلی در این است که دیدار چطور با اکستنشن حرف می‌زند:

- **اکستنشن JSON** (JSON modal و JSON panel): دیدار ساختار JSON تو را رندر می‌کند و endpoint تو را با `POST` و رویدادهای `extension.load` و `extension.submit` صدا می‌زند. [ساختار JSON اکستنشن](/json-extension-schema)
- **iframe و لینک** (Custom UI و Links): دیدار آدرس تو را باز می‌کند و پارامترهای `didar_*` (مثل `didar_locale` و `didar_runtime_id`) را به آن اضافه می‌کند. [پارامترهای آدرس](/api-app-endpoints#url-params)
- صفحه‌ی iframe اگر بخواهد از داخل دیدار toast نشان بدهد، از کاربر تأیید بگیرد یا modal جاری را ببندد، از [Marketplace SDK](/marketplace-sdk) استفاده می‌کند.

## انواع اکستنشن {#types}

### اکشن‌ها (در منوی عملیات) {#actions}

**[Links](/link-actions)** کاربر را از دیدار به صفحه‌ای روی سایت تو می‌برد تا کاری را آنجا تمام کند. وقتی مناسب است که پلاگین تو از قبل یک وب‌اپ کامل دارد.

**[JSON modal](/json-modals)** یک فرم با اجزای از قبل تعریف‌شده است که دیدار از روی فایل JSON تو می‌سازد. کاربر کار را کامل داخل خود دیدار انجام می‌دهد و تو frontend نمی‌نویسی.

![اکشن پلاگین در منوی عملیات صفحه‌ی جزئیات معامله](/images/extensions/action-menu-deal.webp "گزینه‌ی پلاگین («صدور بیمه‌نامه / گارانتی») در منوی ⋯ صفحه‌ی جزئیات معامله")

### پنل JSON (در صفحه‌ی جزئیات) {#json-panel}

**[JSON panel](/json-panels)** داده‌ی پلاگین تو را با اجزای آماده‌ی دیدار در ستون کناری صفحه‌ی جزئیات نشان می‌دهد.

![پنل پلاگین در ستون کناری صفحه‌ی جزئیات معامله](/images/extensions/panel-rates.webp "پنل پلاگین («نرخ‌های روز») در ستون کناری صفحه‌ی جزئیات معامله، زیر اطلاعات معامله")

### رابط کاربری سفارشی (Custom UI) {#custom-ui}

**[Custom modal](/custom-modals)** صفحه‌ی خودت را داخل iframe یک modal نشان می‌دهد که از منوی عملیات باز می‌شود.

![modal پلاگین روی صفحه‌ی جزئیات معامله](/images/extensions/modal-deal.webp "modal پلاگین بعد از انتخاب گزینه از منوی عملیات معامله")

**[Custom panel](/custom-panels)** صفحه‌ی خودت را به‌شکل پنل در ستون کناری صفحه‌ی جزئیات معامله، شخص و شرکت نشان می‌دهد.

**[App settings](/app-settings)** صفحه‌ی تنظیمات پلاگین است؛ یک لینک خارجی یا iframe داخل بخش تنظیمات دیدار. کاربر با یک کلیک از فهرست اپ‌های نصب‌شده به آن می‌رسد.

[درباره‌ی Custom UI](/custom-ui-extensions) · صفحه‌ی iframe با [Marketplace SDK](/marketplace-sdk) با دیدار ارتباط می‌گیرد.

## کدام را انتخاب کنم؟ {#choose}

| نیاز تو | اکستنشن پیشنهادی |
| --- | --- |
| کاربر یک کار را با یک فرم ساده انجام دهد و در دیدار بماند | [JSON modal](/json-modals) |
| کاربر به سیستم تو برود و کار را آنجا ادامه دهد | [Links](/link-actions) |
| کاربر داخل دیدار بماند ولی UI پیچیده‌تر از فرم لازم باشد | [Custom modal](/custom-modals) |
| داده‌ای ساده همیشه کنار رکورد دیده شود | [JSON panel](/json-panels) |
| داده‌ای با نمایش آزاد یا تعامل پیچیده کنار رکورد دیده شود | [Custom panel](/custom-panels) |
| صفحه‌ی iframe تو toast دیدار نشان بدهد، تأیید بگیرد یا modal را ببندد | [Marketplace SDK](/marketplace-sdk) |
| هر کسب‌وکار تنظیمات جدا داشته باشد | [App settings](/app-settings) |
| کار روی چند رکورد با هم | Links، JSON modal یا Custom modal در یک Location لیست |

یک پلاگین می‌تواند چند اکستنشن از انواع مختلف داشته باشد؛ مثلاً یک JSON modal برای کار اصلی، یک Custom panel برای نمایش نتیجه، و یک App settings برای پیکربندی.

## در دیدار چه شکلی است؟ {#examples}

تصویرهای این بخش نمونه‌اند: فقط اکستنشن واقعی است و بقیه‌ی صفحه‌ی دیدار ساده شده تا جای اکستنشن دیده شود.

![پنل مانده‌حساب مشتری در صفحه‌ی جزئیات معامله](/images/extensions/panel-balance.webp "پنل «مانده حساب مشتری»: داده‌ی یک سیستم بیرونی کنار معامله")

![پنل کمیسیون در صفحه‌ی جزئیات معامله](/images/extensions/panel-commission.webp "پنل «کمیسیون من»: محاسبه روی داده‌ی همان معامله")

![modal توزیع لید روی لیست معاملات](/images/extensions/modal-list.webp "modal پلاگین («توزیع لیدها») روی معامله‌های انتخاب‌شده در لیست")

## Locationها {#locations}

**Location** صفحه‌ای است که اکستنشن در آن اجرا می‌شود. Links، JSON modal و Custom modal در منوی عملیات این صفحه‌ها می‌نشینند. در صفحه‌های لیست، اکستنشن روی یک یا چند ردیف انتخاب‌شده اجرا می‌شود (از منوی ⋯ کنار عملیات گروهی) و `entityIds` می‌تواند چند شناسه داشته باشد. ستون دوم همان مقداری است که در `context.location` به سرور تو می‌رسد.

| در Developer Hub | `location` در Runtime Context | `entityType` |
| --- | --- | --- |
| Deals list | `1` | `deal` |
| Deal details | `2` | `deal` |
| People list | `3` | `person` |
| Person details | `4` | `person` |
| Organizations list | `5` | `company` |
| Organization details | `6` | `company` |

![اکشن پلاگین در لیست معاملات روی ردیف‌های انتخاب‌شده](/images/extensions/action-menu-list.webp "در صفحه‌های لیست: چند ردیف انتخاب می‌شود و گزینه‌ی پلاگین («توزیع لید») از منوی ⋯ کنار عملیات گروهی اجرا می‌شود")

JSON panel و Custom panel فقط در سه صفحه‌ی جزئیات نمایش داده می‌شوند: **Deal details**، **Person details** و **Organization details**. صفحه‌های لیست پنل دائمی ندارند و فقط اکشن نشان می‌دهند.

رفتار نمایش هر نوع:

- اکشن‌هایی که پنل نیستند در منوی عملیات رکورد یا بخش عملیات گروهی ظاهر می‌شوند.
- Links در تب جدید و با `noopener,noreferrer` باز می‌شوند.
- Custom modal داخل popup دیدار و JSON modal با renderer داخلی دیدار باز می‌شود.
- JSON panel و Custom panel در پنل صفحه‌ی جزئیات رندر می‌شوند.

## ظرفیت هر پلاگین {#limits}

| قاعده | مقدار |
| --- | --- |
| Links + JSON modal + Custom modal در هر Location منو (Deals list، Deal details، People list، Person details، Organizations list، Organization details) | حداکثر ۳، با هر ترکیبی |
| Links + JSON modal + Custom modal در کل پلاگین | حداکثر ۱۸ |
| پنل در هر صفحه‌ی جزئیات | ۱ (یا JSON panel یا Custom panel، نه هر دو) |
| App settings | ۱ |
| نام اکستنشن | حداکثر ۳۰ کاراکتر |
| توضیح اکستنشن | حداکثر ۱۵۰ کاراکتر |

## مقایسه‌ی اکستنشن‌ها {#comparison}

| | Links | JSON | Custom UI |
| --- | --- | --- | --- |
| **انواع** | Links | JSON modal، JSON panel | Custom modal، Custom panel، App settings |
| **چیست** | لینک به صفحه‌ی پلاگین تو | UI از قبل تعریف‌شده‌ی دیدار، از روی فایل JSON | UI کامل خودت داخل iframe |
| **چه کسی UI را می‌سازد** | تو، روی سایت خودت | دیدار | تو |
| **کجا** | منوی عملیات | منوی عملیات (modal)، ستون کناری جزئیات (panel) | منوی عملیات (modal)، ستون کناری جزئیات (panel)، تنظیمات پلاگین |
| **آدرسی که ثبت می‌کنی** | URL | API endpoint | Iframe URL (فقط HTTPS) |
| **دیدار چطور صدا می‌زند** | باز کردن URL در تب جدید با `?launchCode=…` و پارامترهای `didar_*` | `POST` از مرورگر به API endpoint با `extension.load` و `extension.submit` | باز کردن iframe با `?launchCode=…` و پارامترهای `didar_*` |
| **ارتباط از داخل UI با دیدار** | - | لازم نیست | [Marketplace SDK](/marketplace-sdk) |
| **مناسب برای** | کارهایی که روی سایت تو انجام می‌شوند | فرم‌ها و نمایش داده‌ی ساده بدون نوشتن frontend | تجربه‌ی کاملاً سفارشی |
| **ساختار** | - | [ساختار JSON اکستنشن](/json-extension-schema) | HTML خودت |
| **تمپلیت کد** | [دارد](/link-actions#template) | [JSON modal](/json-modals#template) | [دارد](/custom-ui-extensions#template) |

## بعد از این بخوان {#read-next}

- [Links](/link-actions)
- [JSON modal](/json-modals)
- [JSON panel](/json-panels)
- [ساختار JSON اکستنشن](/json-extension-schema)
- [Custom UI](/custom-ui-extensions)
- [Marketplace SDK](/marketplace-sdk)
