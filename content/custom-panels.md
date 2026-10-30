---
title: Custom panel
section: start
order: 26
lead: Custom panel صفحه‌ی پلاگین تو را به‌شکل یک پنل در ستون کناری صفحه‌ی جزئیات معامله، شخص و شرکت نشان می‌دهد. کاربر بدون اجرای عملیات خاصی، با باز کردن صفحه‌ی جزئیات، پنل پلاگین را کنار رکورد می‌بیند و با آن کار می‌کند.
description: اکستنشن Custom panel در دیدار؛ کاربرد، جای نمایش، ظرفیت، افزودن در Developer Hub، عیب‌یابی و تمپلیت کد.
---

## Custom panel چیست؟ {#what}

Custom panel یک iframe در ستون کناری صفحه‌ی جزئیات است. فرقش با [Custom modal](/custom-modals) در این است که منتظر کلیک کاربر نمی‌ماند: هر بار که کاربر صفحه‌ی جزئیات معامله، شخص یا شرکتی را باز می‌کند، پنل پلاگین هم همراه آن بارگذاری می‌شود. برای همین Custom panel جای خوبی برای اطلاعاتی است که کاربر باید همیشه کنار رکورد ببیند، مثل مانده‌حساب مشتری یا وضعیت سفارش‌ها.

فرقش با [JSON panel](/json-panels) این است که UI را خودت می‌سازی، پس هر نوع نمایش و تعاملی ممکن است. سازوکار iframe، الگوی session و نکات امنیتی بین همه‌ی اکستنشن‌های Custom UI مشترک است: [درباره‌ی Custom UI](/custom-ui-extensions)

## در UI دیدار کجاست؟ {#visibility}

- در ستون کناری **Deal details**، **Person details** و **Organization details**.
- هر پلاگین در هر صفحه‌ی جزئیات فقط **یک پنل** دارد: یا Custom panel یا [JSON panel](/json-panels)، نه هر دو.
- `context.entityIds` شناسه‌ی همان رکوردی است که صفحه‌ی جزئیاتش باز است.

![پنل مانده‌حساب مشتری در صفحه‌ی جزئیات معامله](/images/extensions/panel-balance.webp "پنل پلاگین در ستون کناری صفحه‌ی جزئیات معامله")

چون پنل با هر بار باز شدن صفحه‌ی جزئیات بارگذاری می‌شود، هر بار یک اجرای تازه با `launchCode` تازه است. پنل را سبک نگه دار: اول چیزی را نشان بده که کاربر بیشتر لازم دارد و داده‌ی سنگین را بعداً یا با درخواست کاربر بیاور.

## Custom panel را چطور اضافه کنم؟ {#add}

در Developer Hub، تب **App extensions**، کارت **Custom panel** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Panel name **(الزامی)** | عنوان پنل؛ حداکثر ۳۰ کاراکتر. |
| Panel description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| Iframe URL **(الزامی)** | آدرس صفحه‌ی پلاگین تو؛ فقط HTTPS. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| Panel locations **(الزامی)** | حداقل یکی از Deal details، Person details، Organization details. |

## تمپلیت کد {#template}

تمپلیت [Custom UI](/custom-ui-extensions#template) دقیقاً یک Custom panel برای صفحه‌ی جزئیات معامله است: عنوان معامله را نشان می‌دهد و با session کوتاه روی همان معامله یادداشت ثبت می‌کند. اگر پنل را برای شخص یا شرکت می‌سازی، `entityType` را چک کن و به‌جای API معامله از [API شخص و شرکت](/api-contacts) استفاده کن.

## اگر پنل نمایش داده نشد {#troubleshoot}

- آیا پلاگین روی همین BizDomain نصب است و کاربر جزو کاربرانی است که ادمین هنگام نصب انتخاب کرده؟
- آیا Iframe URL با HTTPS از اینترنت در دسترس است؟
- آیا backend تو `launchCode` را درست به token تبدیل می‌کند؟ خطای تبادل را با `traceId` log کن. [خطاهای تبادل](/runtime-token#errors)
- اگر پنل نمایش داده می‌شود ولی دکمه‌هایش کار نمی‌کنند، cookie session را چک کن: داخل iframe باید `SameSite=None` و `Secure` باشد. [cookie داخل iframe](/custom-ui-extensions#security)

## بعد از این بخوان {#read-next}

- [App settings](/app-settings)
- [درباره‌ی Custom UI](/custom-ui-extensions)
