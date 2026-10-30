---
title: Custom UI
section: start
order: 24
lead: اکستنشن‌های Custom UI صفحه‌ی وب پلاگین تو را داخل یک iframe در دیدار نشان می‌دهند. ظاهر و رفتار کاملاً دست توست؛ دیدار فقط iframe را باز می‌کند و یک launchCode به آن می‌دهد. این صفحه سه نوع Custom UI، نحوه‌ی بارگذاری، الگوی امن کار با token داخل iframe و تمپلیت کدش را توضیح می‌دهد.
description: اکستنشن‌های Custom UI دیدار (Custom modal، Custom panel، App settings)؛ کاربردها، نحوه‌ی بارگذاری با launchCode، الگوی session کوتاه، کوکی در iframe، تم، JWT secret و تمپلیت کد Node.js، Python، PHP و C#.
---

## Custom UI چیست؟ {#what}

اکستنشن‌های JSON (فرم و پنل) سریع ساخته می‌شوند چون UI را دیدار می‌سازد، ولی به اجزای آماده‌ی دیدار محدودند. وقتی نیازت از این اجزا بیشتر است (جدول پیچیده، فرم چندمرحله‌ای، نمودار، پیش‌نمایش یک سند) **Custom UI** راه‌حل است: صفحه‌ی وب خودت را با هر تکنولوژی‌ای که بخواهی می‌سازی و دیدار آن را داخل یک iframe، همان‌جایی که کاربر کار می‌کند، نشان می‌دهد.

سه جا برای نمایش Custom UI داخل دیدار وجود دارد:

| اکستنشن | کجا | جزئیات |
| --- | --- | --- |
| Custom modal | یک modal که کاربر از منوی عملیات باز می‌کند | [Custom modal](/custom-modals) |
| Custom panel | پنل در ستون کناری صفحه‌ی جزئیات معامله، شخص و شرکت | [Custom panel](/custom-panels) |
| App settings (Custom UI) | iframe داخل بخش تنظیمات دیدار، برای تنظیمات پلاگین | [App settings](/app-settings) |

## چه کارهایی می‌شود کرد؟ {#uses}

- نمایش سند، فاکتور یا پیش‌فاکتور مربوط به یک معامله،
- نمایش داده‌ی سیستم دیگر (پشتیبانی، حسابداری، انبار) کنار رکورد دیدار،
- فرم‌های چندمرحله‌ای که از JSON modal پیچیده‌ترند،
- محاسبه یا اعتبارسنجی روی داده‌ی رکورد، مثل پیدا کردن معامله‌های تکراری.

## Custom UI چطور کار می‌کند؟ {#how}

صفحه‌ی پلاگین تو باید روی اینترنت با **HTTPS** در دسترس باشد؛ Developer Hub برای Iframe URL فقط آدرس HTTPS می‌پذیرد. frontend و backend آن را با هر تکنولوژی‌ای که بخواهی می‌سازی.

1. کاربر اکستنشن را باز می‌کند (یا صفحه‌ی جزئیاتی را که پنل در آن است).
2. دیدار Iframe URL تو را با `?launchCode=…` داخل iframe باز می‌کند.
3. backend تو `launchCode` را به [Runtime Token](/runtime-token) تبدیل می‌کند.
4. صفحه‌ی تو با داده‌ی همان رکوردها (`context.entityIds`) نمایش داده می‌شود.

```http title="درخواستی که iframe به سرور تو می‌فرستد"
GET https://your-app.example.com/didar/panel?launchCode=ONE_TIME_CODE
```

نکته‌ی مهم این است که درخواست اول iframe یک درخواست معمولی صفحه است که به **backend** تو می‌رسد. پس تبدیل کد همان‌جا، پیش از ساختن HTML، انجام می‌شود و هیچ secretی به مرورگر نمی‌رسد.

### امنیت: الگوی session کوتاه {#security}

صفحه‌ی Custom UI معمولاً بعد از بارگذاری هم کار دارد: کاربر دکمه‌ای می‌زند، فرمی ثبت می‌کند یا داده‌ی بیشتری می‌خواهد. این درخواست‌ها دیگر launchCode ندارند. الگوی درست این است:

- **launchCode را در backend تبدیل کن**، نه در JavaScript صفحه؛ تبدیل به Client secret نیاز دارد.
- **Runtime Token را به مرورگر نفرست** و در `localStorage` یا cookie نگذار. بعد از تبدیل، token و context را در یک **session کوتاه سمت سرور** نگه دار و فقط شناسه‌ی آن session را در یک cookie به مرورگر بده. عمر session را به `expiresInSeconds` همان token محدود کن.
- **درخواست‌های داده را از backend بفرست.** صفحه‌ی تو به backend خودت درخواست می‌دهد، backend با token همان session به API دیدار.
- **فقط به context اعتماد کن.** شناسه‌ای که از query یا frontend می‌آید context امنیتی نیست؛ شناسه‌ی رکورد را از context ذخیره‌شده در session بخوان.

> [!NOTE]
> **cookie داخل iframe.** صفحه‌ی تو داخل iframe روی دامنه‌ای غیر از دیدار باز می‌شود، پس مرورگر cookie آن را third-party حساب می‌کند. cookie session باید `SameSite=None` و `Secure` باشد تا مرورگر آن را داخل iframe بفرستد. بعضی مرورگرها cookieهای third-party را محدود می‌کنند؛ اگر صفحه‌ات بدون cookie هم باید کار کند، شناسه‌ی session را به‌جای cookie در فرم یا هدر درخواست‌های بعدی بفرست.

### تم روشن و تیره {#theme}

دیدار تم روشن و تیره دارد و صفحه‌ی تو داخل هر دو دیده می‌شود. مطمئن شو UI تو در هر دو حالت خوانا است؛ ساده‌ترین شروع `color-scheme: light dark` در CSS است. تم دیدار را می‌توانی از پروفایل بالای صفحه عوض کنی و هر دو را تست کنی.

## JWT secret {#jwt-secret}

Developer Hub برای هر اکستنشن (به‌جز App settings از نوع External link) یک **JWT secret** می‌خواهد. یک رشته‌ی تصادفی و طولانی بساز (مثلاً ۳۲ بایت تصادفی) و آن را مثل Client secret فقط روی سرورت نگه دار. برای هر اکستنشن یک مقدار جدا بساز.

## تمپلیت کد {#template}

این تمپلیت یک پنل کامل با الگوی session کوتاه است: در درخواست اول کد را تبدیل می‌کند، token و context را سمت سرور نگه می‌دارد، عنوان معامله را نشان می‌دهد و یک فرم دارد که با همان session روی معامله یادداشت ثبت می‌کند. آدرس آن (`/didar/panel`) را در فیلد Iframe URL یک [Custom panel](/custom-panels) یا [Custom modal](/custom-modals) ثبت کن. scopeهای لازم: **Deals · Read only** و **Activities · Full access**. از کلاینت مشترک [Runtime Token](/runtime-token#template) استفاده می‌کند.

<!--TEMPLATE:custom-ui-->

session این تمپلیت در حافظه‌ی همان سرور است؛ اگر پلاگین تو روی چند سرور اجرا می‌شود، آن را در یک store مشترک (مثل Redis) با همان انقضا نگه دار.

## هنوز مستند نشده {#open}

> [!WARNING]
> این موارد هنوز در منبع فنی نیامده‌اند و در این داک حدس زده نمی‌شوند: دیدار JWT secret هر اکستنشن را دقیقاً کجا و چطور استفاده می‌کند، SDK مربوط به Custom UI (از جمله اجرای Custom modal بدون Entry point)، و اندازه‌ی مجاز iframe در modal و پنل.

## بعد از این بخوان {#read-next}

- [Custom modal](/custom-modals)
- [Custom panel](/custom-panels)
- [App settings](/app-settings)
