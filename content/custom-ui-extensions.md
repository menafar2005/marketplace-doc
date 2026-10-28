---
title: Custom UI
section: start
order: 24
lead: اکستنشن‌های Custom UI صفحه‌ی وب اپ تو را داخل یک iframe در دیدار نشان می‌دهند. ظاهر و رفتار کاملاً دست توست؛ دیدار فقط iframe را باز می‌کند و یک launchCode به آن می‌دهد.
description: اکستنشن‌های Custom UI دیدار (Custom modal، Custom panel، App settings)؛ کاربردها، نحوه‌ی بارگذاری با launchCode، امنیت، تم و JWT secret.
---

## Custom UI چیست؟ {#what}

سه جای نمایش برای UI خودت داخل دیدار وجود دارد:

| اکستنشن | کجا | جزئیات |
| --- | --- | --- |
| Custom modal | یک modal که کاربر از منوی عملیات باز می‌کند | [Custom modal](/custom-modals) |
| Custom panel | پنل در سایدبار سمت چپ صفحه‌ی جزئیات معامله، شخص و شرکت | [Custom panel](/custom-panels) |
| App settings (Custom UI) | iframe داخل بخش تنظیمات دیدار، برای تنظیمات اپ | [App settings](/app-settings) |

## چه کارهایی می‌شود کرد؟ {#uses}

- نمایش سند، فاکتور یا پیش‌فاکتور مربوط به یک معامله
- نمایش داده‌ی سیستم دیگر (پشتیبانی، حسابداری، انبار) کنار رکورد دیدار
- فرم‌های چندمرحله‌ای که از JSON modal پیچیده‌ترند
- محاسبه یا اعتبارسنجی روی داده‌ی رکورد، مثل پیدا کردن معامله‌های تکراری

## Custom UI چطور کار می‌کند؟ {#how}

صفحه‌ی اپ تو باید روی اینترنت با **HTTPS** در دسترس باشد. frontend و backend آن را با هر تکنولوژی‌ای که بخواهی می‌سازی.

1. کاربر اکستنشن را باز می‌کند (یا صفحه‌ی جزئیاتی را که پنل در آن است).
2. دیدار Iframe URL تو را با `?launchCode=…` داخل iframe باز می‌کند.
3. backend تو `launchCode` را به [Runtime Token](/runtime-token) تبدیل می‌کند.
4. صفحه‌ی تو با داده‌ی همان رکوردها (`context.entityIds`) نمایش داده می‌شود.

```http title="درخواستی که iframe به سرور تو می‌فرستد"
GET https://your-app.example.com/didar/panel?launchCode=ONE_TIME_CODE
```

### امنیت {#security}

- **launchCode را در backend تبدیل کن**، نه در JavaScript صفحه؛ تبدیل به Client secret نیاز دارد.
- **Runtime Token را به مرورگر نفرست** و در `localStorage` نگذار. بعد از تبدیل، یک session امن و کوتاه برای UI خودت بساز و درخواست‌های داده را از backend بفرست.
- **فقط به context اعتماد کن.** شناسه‌ای که از query یا frontend می‌آید context امنیتی نیست.

### تم روشن و تیره {#theme}

دیدار تم روشن و تیره دارد. مطمئن شو UI تو در هر دو حالت خوانا و قابل مشاهده است. تم دیدار را می‌توانی از پروفایل بالای صفحه عوض کنی و هر دو را تست کنی.

## JWT secret {#jwt-secret}

Developer Hub برای هر اکستنشن (به‌جز App settings از نوع External link) یک **JWT secret** می‌خواهد. یک رشته‌ی تصادفی و طولانی بساز و آن را مثل Client secret فقط روی سرورت نگه دار.

## هنوز مستند نشده {#open}

> [!WARNING]
> این موارد هنوز در منبع فنی نیامده‌اند و در این داک حدس زده نمی‌شوند: دیدار JWT secret هر اکستنشن را دقیقاً کجا و چطور استفاده می‌کند، SDK مربوط به Custom UI (از جمله اجرای Custom modal بدون Entry point)، و اندازه‌ی مجاز iframe در modal و پنل.

## بعد از این بخوان {#read-next}

- [Custom modal](/custom-modals)
- [Custom panel](/custom-panels)
- [App settings](/app-settings)
