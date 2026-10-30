---
title: Custom modal
section: start
order: 25
lead: Custom modal صفحه‌ی پلاگین تو را داخل یک modal روی صفحه‌ی دیدار باز می‌کند. کاربر آن را از منوی عملیات یک رکورد، یا روی ردیف‌های انتخاب‌شده در لیست اجرا می‌کند و بدون بیرون رفتن از دیدار، با UI کاملاً سفارشی تو کار می‌کند.
description: اکستنشن Custom modal در دیدار؛ کاربرد، جای نمایش، Entry pointها، اجرا روی چند ردیف، ID، افزودن در Developer Hub و تمپلیت کد.
---

## Custom modal چیست؟ {#what}

Custom modal ترکیب دو اکستنشن دیگر است: مثل [JSON modal](/json-modals) از منوی عملیات باز می‌شود و کاربر را داخل دیدار نگه می‌دارد، و مثل [Links](/link-actions) UIش کاملاً مال توست. دیدار یک modal باز می‌کند و صفحه‌ی پلاگین تو را داخل iframe آن نشان می‌دهد.

Custom modal برای کارهایی مناسب است که UI سفارشی می‌خواهند ولی نباید کاربر را از دیدار بیرون ببرند؛ مثلاً یک فرم چندمرحله‌ای، انتخاب از یک فهرست بلند که از سیستم تو می‌آید، یا پیش‌نمایش سندی که پلاگین می‌سازد. سازوکار iframe، الگوی session و نکات امنیتی بین همه‌ی اکستنشن‌های Custom UI مشترک است: [درباره‌ی Custom UI](/custom-ui-extensions)

## در UI دیدار کجاست؟ {#visibility}

- در منوی عملیات Locationهایی که به‌عنوان **Entry point** انتخاب می‌کنی؛ همان Locationهای [Links](/link-actions#visibility).
- ظرفیت هر Location منو بین Links، JSON modal و Custom modal مشترک است (حداکثر ۳). [ظرفیت‌ها](/app-extensions#limits)
- **Entry point اختیاری است.** اگر هیچ Entry pointی انتخاب نکنی، modal در منوها دیده نمی‌شود و فقط از طریق SDK اجرا می‌شود. در فهرست My added extensions، اکستنشنی که از طریق SDK قابل اجراست برچسب **SDK** دارد، کنار برچسب Entry pointهایش.

وقتی modal از صفحه‌ی لیست اجرا می‌شود، `context.entityIds` همه‌ی ردیف‌هایی است که کاربر انتخاب کرده؛ پس صفحه‌ی تو باید برای کار روی چند رکورد آماده باشد.

![اکشن پلاگین در لیست معاملات](/images/extensions/action-menu-list.webp "اجرا از صفحه‌ی لیست روی ردیف‌های انتخاب‌شده")

![modal پلاگین روی لیست معاملات](/images/extensions/modal-list.webp "modal پلاگین روی صفحه باز می‌شود؛ context.entityIds همه‌ی ردیف‌های انتخاب‌شده است")

## Custom modal را چطور اضافه کنم؟ {#add}

در Developer Hub، تب **App extensions**، کارت **Custom modal** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Modal name **(الزامی)** | متن گزینه در منو؛ حداکثر ۳۰ کاراکتر. |
| Modal description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| Iframe URL **(الزامی)** | آدرس صفحه‌ی پلاگین تو؛ فقط HTTPS. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| ID | دیدار آن را می‌سازد؛ فقط‌خواندنی و قابل کپی. شناسه‌ی این modal برای اجرا از طریق SDK است. |
| Entry points | اختیاری؛ Locationهای منوی عملیات. |

## تمپلیت کد {#template}

Custom modal و Custom panel یک تمپلیت مشترک دارند، چون هر دو یک صفحه‌ی iframe با همان جریان‌اند: [تمپلیت Custom UI](/custom-ui-extensions#template). برای modal روی صفحه‌ی لیست، به‌جای `entityIds[0]` روی همه‌ی `entityIds` کار کن؛ تمپلیت [JSON modal](/json-modals#template) نمونه‌ی همین حلقه را دارد.

## هنوز مستند نشده {#open}

> [!WARNING]
> SDK اجرای Custom modal و نحوه‌ی استفاده از ID آن هنوز در منبع فنی نیامده است.

## بعد از این بخوان {#read-next}

- [Custom panel](/custom-panels)
- [درباره‌ی Custom UI](/custom-ui-extensions)
