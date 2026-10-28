---
title: مرور اکستنشن‌ها
section: start
order: 20
lead: اکستنشن‌ها قابلیت اپ تو را داخل UI دیدار می‌آورند؛ در منوی عملیات، به‌شکل پنل در صفحه‌ی جزئیات، یا در تنظیمات اپ. این صفحه همه‌ی انواع را معرفی و با هم مقایسه می‌کند.
description: اکستنشن‌های مارکت‌پلیس دیدار؛ Links، JSON modal، JSON panel، Custom modal، Custom panel و App settings، Locationها، ظرفیت‌ها و مقایسه.
---

## اکستنشن چیست؟ {#what}

اکستنشن جایی از UI دیدار است که اپ تو در آن ظاهر می‌شود. با اکستنشن‌ها کاربر می‌تواند بدون جابه‌جا شدن بین ابزارها، از داده‌ی همان معامله، شخص، شرکت یا پرونده‌ای که باز کرده در اپ تو استفاده کند.

همه‌ی اکستنشن‌ها یک قاعده‌ی مشترک دارند: وقتی کاربر اکستنشن را اجرا می‌کند، دیدار یک `launchCode` به آدرس ثبت‌شده‌ی آن اضافه می‌کند و سرور تو آن را به [Runtime Token](/runtime-token) تبدیل می‌کند. Runtime Context همان اجرا می‌گوید کاربر کجا بوده و روی کدام رکوردها (`entityIds`) کار می‌کند.

## انواع اکستنشن {#types}

### اکشن‌ها (در منوی عملیات) {#actions}

**[Links](/link-actions)**: کاربر را از دیدار به صفحه‌ای روی سایت تو می‌برد تا کاری را آنجا تمام کند.

**[JSON modal](/json-modals)**: یک فرم با اجزای از قبل تعریف‌شده که دیدار از روی فایل JSON تو می‌سازد. کاربر کار را کامل داخل خود دیدار انجام می‌دهد.

![اکشن اپ در منوی عملیات صفحه‌ی جزئیات معامله](/images/extensions/action-menu-deal.webp "اکشن اپ («صدور بیمه‌نامه / گارانتی») در منوی ⋯ صفحه‌ی جزئیات معامله")

### پنل JSON (در صفحه‌ی جزئیات) {#json-panel}

**[JSON panel](/json-panels)**: داده‌ی اپ تو را با اجزای آماده‌ی دیدار در ستون کناری صفحه‌ی جزئیات نشان می‌دهد.

![پنل اپ در ستون کناری صفحه‌ی جزئیات معامله](/images/extensions/panel-rates.webp "پنل اپ («نرخ‌های روز») در ستون کناری صفحه‌ی جزئیات معامله، زیر اطلاعات معامله")

### رابط کاربری سفارشی (Custom UI) {#custom-ui}

**[Custom modal](/custom-modals)**: iframe اپ تو داخل یک modal که از منوی عملیات باز می‌شود.

![modal اپ روی صفحه‌ی جزئیات معامله](/images/extensions/modal-deal.webp "modal اپ بعد از انتخاب اکشن از منوی عملیات معامله")

**[Custom panel](/custom-panels)**: iframe اپ تو به‌شکل پنل در ستون کناری صفحه‌ی جزئیات معامله، شخص و شرکت.

**[App settings](/app-settings)**: صفحه‌ی تنظیمات اپ؛ یک لینک خارجی یا iframe داخل بخش تنظیمات دیدار. کاربر با یک کلیک از فهرست اپ‌های نصب‌شده به آن می‌رسد.

[درباره‌ی Custom UI](/custom-ui-extensions)

## در دیدار چه شکلی است؟ {#examples}

تصویرهای این بخش نمونه‌اند: فقط اکستنشن واقعی است و بقیه‌ی صفحه‌ی دیدار ساده شده تا جای اکستنشن دیده شود.

![پنل مانده‌حساب مشتری در صفحه‌ی جزئیات معامله](/images/extensions/panel-balance.webp "پنل «مانده حساب مشتری»: داده‌ی یک سیستم بیرونی کنار معامله")

![پنل کمیسیون در صفحه‌ی جزئیات معامله](/images/extensions/panel-commission.webp "پنل «کمیسیون من»: محاسبه روی داده‌ی همان معامله")

![modal توزیع لید روی لیست معاملات](/images/extensions/modal-list.webp "modal اپ («توزیع لیدها») روی معامله‌های انتخاب‌شده در لیست")

## Locationها {#locations}

Links، JSON modal و Custom modal در منوی عملیات این صفحه‌ها می‌نشینند. در صفحه‌های لیست، اکستنشن روی یک یا چند ردیف انتخاب‌شده اجرا می‌شود (از منوی ⋯ کنار عملیات گروهی) و `entityIds` می‌تواند چند شناسه داشته باشد.

| در Developer Hub | `location` در Runtime Context | `entityType` |
| --- | --- | --- |
| Deals list | `1` | `deal` |
| Deal details | `2` | `deal` |
| People list | `3` | `person` |
| Person details | `4` | `person` |
| Organizations list | `5` | `company` |
| Organization details | `6` | `company` |
| Case list | `7` | `case` |
| Case details | `8` | `case` |

![اکشن اپ در لیست معاملات روی ردیف‌های انتخاب‌شده](/images/extensions/action-menu-list.webp "در صفحه‌های لیست: چند ردیف انتخاب می‌شود و اکشن اپ («توزیع لید») از منوی ⋯ کنار عملیات گروهی اجرا می‌شود")

JSON panel و Custom panel فقط در سه صفحه‌ی جزئیات نمایش داده می‌شوند: **Deal details**، **Person details** و **Organization details**.

## ظرفیت هر اپ {#limits}

| قاعده | مقدار |
| --- | --- |
| Links + JSON modal + Custom modal در هر Location منو (Deals list، Deal details، People list، Person details، Organizations list، Organization details) | حداکثر ۳، با هر ترکیبی |
| Links + JSON modal + Custom modal در کل اپ | حداکثر ۱۸ |
| پنل در هر صفحه‌ی جزئیات | ۱ (یا JSON panel یا Custom panel، نه هر دو) |
| App settings | ۱ |
| نام اکستنشن | حداکثر ۳۰ کاراکتر |
| توضیح اکستنشن | حداکثر ۱۵۰ کاراکتر |

## مقایسه‌ی اکستنشن‌ها {#comparison}

| | Links | JSON | Custom UI |
| --- | --- | --- | --- |
| **انواع** | Links | JSON modal، JSON panel | Custom modal، Custom panel، App settings |
| **چیست** | لینک به صفحه‌ی اپ تو | UI از قبل تعریف‌شده‌ی دیدار، از روی فایل JSON | UI کامل خودت داخل iframe |
| **چه کسی UI را می‌سازد** | تو، روی سایت خودت | دیدار | تو |
| **کجا** | منوی عملیات | منوی عملیات (modal)، ستون کناری جزئیات (panel) | منوی عملیات (modal)، ستون کناری جزئیات (panel)، تنظیمات اپ |
| **آدرسی که ثبت می‌کنی** | URL | API endpoint | Iframe URL (فقط HTTPS) |
| **دیدار چطور صدا می‌زند** | باز کردن URL با `?launchCode=…` | fetch مرورگر به API endpoint | باز کردن iframe با `?launchCode=…` |
| **مناسب برای** | کارهایی که روی سایت تو انجام می‌شوند | فرم‌ها و نمایش داده‌ی ساده بدون نوشتن frontend | تجربه‌ی کاملاً سفارشی |

## بعد از این بخوان {#read-next}

- [Links](/link-actions)
- [JSON modal](/json-modals)
- [JSON panel](/json-panels)
- [Custom UI](/custom-ui-extensions)
