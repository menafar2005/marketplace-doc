---
title: Custom panel
section: start
order: 26
lead: Custom panel صفحه‌ی اپ تو را به‌شکل یک پنل در سایدبار سمت چپ صفحه‌ی جزئیات معامله، شخص و شرکت نشان می‌دهد.
description: اکستنشن Custom panel در دیدار؛ جای نمایش، ظرفیت و افزودن در Developer Hub.
---

## Custom panel چیست؟ {#what}

یک iframe داخل پنل سایدبار. کاربر بدون اجرای عملیات خاصی، با باز کردن صفحه‌ی جزئیات، پنل اپ را می‌بیند و با آن کار می‌کند. [درباره‌ی Custom UI](/custom-ui-extensions)

## در UI دیدار کجاست؟ {#visibility}

- در سایدبار سمت چپ **Deal details**، **Person details** و **Organization details**.
- هر اپ در هر صفحه‌ی جزئیات فقط **یک پنل** دارد: یا Custom panel یا [JSON panel](/json-panels)، نه هر دو.
- `context.entityIds` شناسه‌ی همان رکوردی است که صفحه‌ی جزئیاتش باز است.

## Custom panel را چطور اضافه کنم؟ {#add}

در Developer Hub، تب **App extensions**، کارت **Custom panel** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Panel name **(الزامی)** | حداکثر ۳۰ کاراکتر. |
| Panel description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| Iframe URL **(الزامی)** | آدرس صفحه‌ی اپ تو؛ فقط HTTPS. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| Panel locations **(الزامی)** | حداقل یکی از Deal details، Person details، Organization details. |

## اگر پنل نمایش داده نشد {#troubleshoot}

- آیا اپ روی همین BizDomain نصب است و کاربر جزو کاربرانی است که ادمین هنگام نصب انتخاب کرده؟
- آیا Iframe URL با HTTPS از اینترنت در دسترس است؟
- آیا backend تو `launchCode` را درست به token تبدیل می‌کند؟ خطای تبادل را با `traceId` log کن. [Runtime Token](/runtime-token#errors)

## بعد از این بخوان {#read-next}

- [App settings](/app-settings)
- [درباره‌ی Custom UI](/custom-ui-extensions)
