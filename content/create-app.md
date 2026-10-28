---
title: ۱. ساخت اپ در Developer Hub
section: start
order: 10
lead: اولین قدم ساختن پلاگین، تعریف آن در Developer Hub است. در پایان این صفحه یک اپ Draft با Client ID، Client secret، scope و اولین اکستنشن داری.
description: ورود به Developer Hub، ساخت اپ، انتخاب scopeها، دریافت Client ID و Client secret و افزودن اولین اکستنشن.
---

> [!NOTE]
> **در این آموزش چه می‌سازیم؟** پلاگینی که در صفحه‌ی جزئیات معامله یک گزینه‌ی «ایجاد جلسه» اضافه می‌کند. کاربر یک فرم کوتاه پر می‌کند و سرور تو یک یادداشت روی همان معامله ثبت می‌کند. پنج صفحه‌ی این بخش را به ترتیب جلو برو.

## پیش‌نیازها {#prereq}

- ادمین یک BizDomain در دیدار باشی. همین BizDomain محیط تست تو است.
- یک سرور با آدرس عمومی **HTTPS** داشته باشی. برای توسعه‌ی محلی می‌توانی سرور لوکال را پشت یک tunnel با HTTPS بگذاری.

## قدم ۱: Developer Hub را باز کن {#open}

Developer Hub منویی داخل دیدار ندارد. وقتی در دیدار وارد شده‌ای، مستقیم به این آدرس برو:

```text title="آدرس Developer Hub"
https://app.didar.me/developerhub
```

صفحه‌ی **My apps** باز می‌شود: فهرست اپ‌هایی که ساخته‌ای، با وضعیت (Draft یا Live) و تعداد اکستنشن‌های هرکدام. اگر ادمین نباشی، پیام «شما دسترسی این بخش را ندارید!» را می‌بینی.

## قدم ۲: اپ را بساز {#create}

روی **Create an app** بزن و فرم **Basic info** را پر کن:

| فیلد | چه بنویسی |
| --- | --- |
| App name | نامی که ادمین هنگام نصب می‌بیند. الزامی. |
| Callback URL | آدرسی روی سرور تو که بعد از تأیید نصب، دیدار کاربر را با یک `code` به آن برمی‌گرداند. الزامی و باید URL معتبر باشد؛ مثلاً `https://your-app.example.com/didar/callback`. |
| App type | فعلاً همیشه `Private` و غیرقابل‌تغییر است. |

روی **Save** بزن. اپ با وضعیت **Draft** ساخته می‌شود و صفحه‌ی ویرایش آن باز می‌شود. تب‌های **OAuth & access scopes** و **App extensions** حالا فعال‌اند.

## قدم ۳: scopeها را انتخاب کن {#scopes}

در تب **OAuth & access scopes**:

- **Access to basic information** همیشه روشن است (scope `basicinfo`): کاربران، کاریزها، مراحل، برچسب‌ها و انواع فعالیت.
- برای هر بخش دیگر (Deals، Activities، Contacts، Cases) که لازم داری، تاگل را روشن کن. پیش‌فرض **Read only** است؛ اگر اپ باید بنویسد، **Full access** را انتخاب کن.

برای پلاگین این آموزش: **Deals** با Read only (خواندن معامله) و **Activities** با Full access (ساخت یادداشت).

جدول کامل scopeها: [مفاهیم کلیدی](/concepts#scope).

## قدم ۴: Client ID و Client secret را بردار {#credentials}

پایین همین تب، **Client ID** و **Client secret** را می‌بینی. secret به‌صورت پیش‌فرض پنهان است؛ هر دو را کپی کن و در تنظیمات سرورت بگذار:

```bash title=".env"
DIDAR_CLIENT_ID=YOUR_CLIENT_ID
DIDAR_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

> [!WARNING]
> Client secret را در کد frontend، مخزن git، URL یا log نگذار. اگر لو رفت، با **Refresh** یک secret جدید بساز؛ secret قبلی همان لحظه از کار می‌افتد. [مدیریت اپ](/manage-app#secret)

## قدم ۵: اولین اکستنشن را اضافه کن {#extension}

در تب **App extensions** کارت **JSON modal** را انتخاب کن و **Add** بزن:

| فیلد | مقدار برای این آموزش |
| --- | --- |
| Action name | `ایجاد جلسه` (حداکثر ۳۰ کاراکتر) |
| Action description | اختیاری، حداکثر ۱۵۰ کاراکتر |
| API endpoint | `https://your-app.example.com/didar/launch` |
| JWT secret | الزامی؛ یک رشته‌ی تصادفی طولانی بساز و مثل Client secret نگه دار ([توضیح](/extensions#jwt-secret)) |
| JSON schema | فایل JSON فرم؛ نمونه‌ی آماده در [اکستنشن‌ها](/extensions#json-form) |
| Locations | `Deal details` |

Save داخل مودال، اکستنشن را فقط به‌صورت موقت به فهرست **My added extensions** اضافه می‌کند. **تا Save اصلی صفحه را نزنی، هیچ تغییری ذخیره نمی‌شود.**

## قدم ۶: ذخیره {#save}

دکمه‌ی اصلی **Save** را بزن. Basic info، scopeها و اکستنشن‌ها با هم ذخیره می‌شوند. **Cancel** همه‌ی تغییرات ذخیره‌نشده را دور می‌ریزد.

## الان چه داری؟ {#result}

- یک اپ Draft با Client ID و Client secret
- scopeهای `basicinfo`، `deals` و `activities.fullaccess`
- یک اکستنشن JSON modal در جزئیات معامله

اما اپ هنوز روی هیچ BizDomainی نصب نشده و سرور تو هنوز چیزی پیاده نکرده است.

## قدم بعدی {#next}

[۲. پیاده‌سازی نصب](/installation): Callback URL را پیاده کن و اپ را روی BizDomain خودت نصب کن.
