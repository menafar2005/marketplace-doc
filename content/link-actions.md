---
title: Links
section: start
order: 21
lead: Links اکشن‌هایی هستند که کاربر را از دیدار به صفحه‌ای روی سایت تو می‌برند تا کاری را با داده‌ی همان رکورد در اپ تو تمام کند.
description: اکستنشن Links در مارکت‌پلیس دیدار؛ جای نمایش، نحوه‌ی کار با launchCode، نمونه‌ی URL و فیلدهای Developer Hub.
---

## Links چیست؟ {#what}

Link یک گزینه در منوی عملیات دیدار است که آدرسی روی سایت تو را باز می‌کند. کاربر کار را در اپ تو ادامه می‌دهد و اپ با Runtime Token به داده‌ی همان رکوردها دسترسی دارد. چند مثال: ساختن پیش‌فاکتور برای یک معامله، افزودن چند شخص انتخاب‌شده به یک لیست ایمیل، یا باز کردن پرونده‌ی مشتری در سیستم پشتیبانی تو.

## در UI دیدار کجاست؟ {#visibility}

- **صفحه‌های جزئیات** (Deal details، Person details، Organization details، Case details): در منوی عملیات همان رکورد.
- **صفحه‌های لیست** (Deals list، People list، Organizations list، Case list): کاربر یک یا چند ردیف را انتخاب می‌کند، روی ⋯ کنار عملیات گروهی می‌زند و گزینه‌ی اپ را انتخاب می‌کند. بدون انتخاب ردیف، اکشن در دسترس نیست.

هر اپ در هر Location منو حداکثر ۳ اکستنشن از Links، JSON modal و Custom modal دارد و در کل حداکثر ۱۸. [ظرفیت‌ها](/app-extensions#limits)

## Links چطور کار می‌کند؟ {#how}

1. کاربر اکشن را انتخاب می‌کند.
2. دیدار یک `launchCode` برای همین اجرا می‌سازد و URL ثبت‌شده‌ی تو را با آن باز می‌کند.
3. سرور تو `launchCode` را به [Runtime Token](/runtime-token) تبدیل می‌کند و از `context.entityIds` می‌فهمد کاربر کدام رکوردها را انتخاب کرده.
4. صفحه‌ی اپ تو نمایش داده می‌شود.

```http title="آدرسی که دیدار باز می‌کند"
GET https://your-app.example.com/didar/invoice?launchCode=ONE_TIME_CODE
```

```json title="context بعد از تبادل (از لیست معاملات، دو ردیف انتخاب‌شده)"
{
  "target": "extension",
  "runtimeId": "RUNTIME_ID",
  "location": 1,
  "entityType": "deal",
  "entityIds": ["DEAL_ID_1", "DEAL_ID_2"],
  "payload": {}
}
```

> [!WARNING]
> شناسه‌ی رکوردها را فقط از `context.entityIds` بگیر. هیچ شناسه‌ای در خود URL به اپ تو نمی‌رسد و نباید هم برسد.

## Links را چطور اضافه کنم؟ {#add}

در Developer Hub، تب **App extensions**، کارت **Links** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Action name **(الزامی)** | متنی که در منوی عملیات دیده می‌شود؛ حداکثر ۳۰ کاراکتر. |
| Action description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| URL **(الزامی)** | آدرس صفحه‌ی اپ تو؛ URL معتبر. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| Locations **(الزامی)** | حداقل یک Location؛ حداکثر ۳ اکستنشن منو در هر Location. |

سپس Save اصلی صفحه را بزن.

## بعد از این بخوان {#read-next}

- [JSON modal](/json-modals)
- [Runtime Token](/runtime-token)
- [مرور اکستنشن‌ها](/app-extensions)
