---
title: Custom modal
section: start
order: 25
lead: Custom modal صفحه‌ی اپ تو را داخل یک modal در دیدار باز می‌کند. کاربر آن را از منوی عملیات یک رکورد یا روی ردیف‌های انتخاب‌شده در لیست اجرا می‌کند.
description: اکستنشن Custom modal در دیدار؛ جای نمایش، Entry pointها، ID، افزودن در Developer Hub.
---

## Custom modal چیست؟ {#what}

یک iframe داخل modal که وقتی کاربر آن را از منوهای دیدار اجرا می‌کند باز می‌شود. برای کارهایی مناسب است که UI سفارشی می‌خواهند ولی نباید کاربر را از دیدار بیرون ببرند. [درباره‌ی Custom UI](/custom-ui-extensions)

## در UI دیدار کجاست؟ {#visibility}

- در منوی عملیات Locationهایی که به‌عنوان **Entry point** انتخاب می‌کنی؛ همان Locationهای [Links](/link-actions#visibility).
- ظرفیت هر Location منو بین Links، JSON modal و Custom modal مشترک است (حداکثر ۳). [ظرفیت‌ها](/app-extensions#limits)
- **Entry point اختیاری است.** اگر هیچ Entry pointی انتخاب نکنی، modal در منوها دیده نمی‌شود و فقط از طریق SDK اجرا می‌شود. در فهرست My added extensions، اکستنشنی که از طریق SDK قابل اجراست برچسب **SDK** دارد، کنار برچسب Entry pointهایش.

## Custom modal را چطور اضافه کنم؟ {#add}

در Developer Hub، تب **App extensions**، کارت **Custom modal** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Modal name **(الزامی)** | حداکثر ۳۰ کاراکتر. |
| Modal description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| Iframe URL **(الزامی)** | آدرس صفحه‌ی اپ تو؛ فقط HTTPS. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| ID | دیدار آن را می‌سازد؛ فقط‌خواندنی و قابل کپی. شناسه‌ی این modal برای اجرا از طریق SDK است. |
| Entry points | اختیاری؛ Locationهای منوی عملیات. |

## هنوز مستند نشده {#open}

> [!WARNING]
> SDK اجرای Custom modal و نحوه‌ی استفاده از ID آن هنوز در منبع فنی نیامده است.

## بعد از این بخوان {#read-next}

- [Custom panel](/custom-panels)
- [درباره‌ی Custom UI](/custom-ui-extensions)
