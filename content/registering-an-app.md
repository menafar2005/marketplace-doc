---
title: ثبت پلاگین
section: start
order: 13
lead: ثبت پلاگین یعنی ساختن شناسنامه‌ی آن در Developer Hub؛ نامش، آدرس نصبش، دسترسی‌هایش و اکستنشن‌هایش. این صفحه فرم ثبت پلاگین را تب‌به‌تب و فیلدبه‌فیلد توضیح می‌دهد: هر فیلد چیست، چه مقداری می‌پذیرد و روی رفتار پلاگین چه اثری دارد.
description: ثبت پلاگین در Developer Hub دیدار؛ فیلدهای Basic info، OAuth & access scopes و App extensions، ذخیره‌ی یکجا، پیام‌های خطای فرم و نصب و تست پلاگین Draft.
---

## ثبت پلاگین چیست؟ {#what}

پیش از اینکه دیدار بتواند پلاگین تو را نصب کند یا صدا بزند، باید آن را بشناسد. ثبت پلاگین یعنی همین معرفی: در فرم Developer Hub مشخص می‌کنی پلاگین چه نامی دارد، دیدار بعد از نصب کجا برگردد، پلاگین به چه داده‌هایی نیاز دارد و کجای دیدار ظاهر شود. حاصل ثبت، پلاگینی در وضعیت **Draft** است که Client ID و Client secret دارد و می‌توانی روی BizDomain خودت تستش کنی.

برای رسیدن به فرم، با حساب ادمین BizDomain وارد دیدار شو، به `https://app.didar.me/developerhub` برو و در My apps روی **Create an app** بزن. [Developer Hub](/developer-hub)

## فرم ثبت پلاگین {#form}

فرم سه تب دارد: **Basic info**، **OAuth & access scopes** و **App extensions**. پیش از اولین Save فقط Basic info فعال است، چون Client ID و secret و اکستنشن‌ها به پلاگینی وابسته‌اند که هنوز ساخته نشده. بالای صفحه دکمه‌های **Save** و **Cancel** هستند و بعد از ساخت پلاگین، **Change to live** هم اضافه می‌شود.

> [!NOTE]
> ذخیره در این فرم یکجاست: Save داخل مودال اکستنشن‌ها فقط اکستنشن را موقتاً به فهرست اضافه می‌کند. تا Save اصلی بالای صفحه را نزنی، هیچ تغییری در هیچ تبی ذخیره نمی‌شود.

### Basic info {#basic-info}

اطلاعات پایه‌ی پلاگین؛ تنها چیزی که برای ساختن پلاگین لازم است.

| فیلد | توضیح |
| --- | --- |
| App name **(الزامی)** | نامی که ادمین در صفحه‌ی تأیید نصب و کاربران در دیدار می‌بینند. خالی یا فقط فاصله پذیرفته نمی‌شود. نامی بگذار که ادمین با دیدنش بفهمد پلاگین چه کاری می‌کند. |
| Callback URL **(الزامی)** | آدرسی روی سرور تو که دیدار بعد از تأیید نصب، `code` نصب را به آن می‌فرستد؛ همان [مسیر نصب](/plugin-anatomy#install-route). باید URL معتبر باشد، مثلاً `https://your-app.example.com/didar/callback`. [تکمیل نصب](/installation-authorization) |
| App type | فعلاً همیشه `Private` و غیرقابل‌تغییر است. [انتشار](/publishing#what) |

با Save، پلاگین با وضعیت **Draft** ساخته می‌شود و صفحه‌ی ویرایش آن باز می‌شود.

### OAuth & access scopes {#scopes}

دسترسی‌های پلاگین و credentialهای آن. این تب تعیین می‌کند ادمین هنگام نصب چه فهرستی از دسترسی‌ها را ببیند.

| فیلد | توضیح |
| --- | --- |
| Access scopes **(الزامی)** | دسترسی‌های پلاگین. **Access to basic information** همیشه روشن است. برای Deals، Activities، Contacts و Cases تاگل را روشن کن و **Read only** (پیش‌فرض) یا **Full access** را انتخاب کن. فقط چیزی را بخواه که لازم داری. [Scopeها و دسترسی‌ها](/scopes) |
| Client ID | شناسه‌ی عمومی پلاگین. فقط‌خواندنی و قابل کپی. |
| Client secret | رمز پلاگین. پیش‌فرض پنهان است؛ قابل نمایش، کپی و **Refresh**. [Client ID و Client secret](/client-id-and-client-secret) |
| Share app | لینک نصب پلاگین را نشان می‌دهد. [لینک نصب](/publishing#install-link) |

### App extensions {#extensions}

جاهایی که پلاگین در دیدار ظاهر می‌شود. شش کارت می‌بینی، یکی برای هر نوع اکستنشن؛ با **Add** هرکدام، مودال همان نوع باز می‌شود. اکستنشن‌های اضافه‌شده در **My added extensions** فهرست می‌شوند و منوی ⋯ هرکدام **Edit extension** و **Delete** دارد. اگر نمی‌دانی کدام نوع را انتخاب کنی: [کدام اکستنشن؟](/app-extensions#choose)

#### Links {#links}

| فیلد | توضیح |
| --- | --- |
| Action name **(الزامی)** | نام گزینه در منوی عملیات؛ حداکثر ۳۰ کاراکتر. |
| Action description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| URL **(الزامی)** | صفحه‌ای روی سایت تو که با `?launchCode=…` باز می‌شود. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| Locations **(الزامی)** | حداقل یک Location. [Locationها](/app-extensions#locations) |

[جزئیات Links](/link-actions)

#### JSON modal {#json-modal}

| فیلد | توضیح |
| --- | --- |
| Action name **(الزامی)** | حداکثر ۳۰ کاراکتر. |
| Action description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| API endpoint **(الزامی)** | endpoint پلاگین تو که ثبت فرم به آن می‌رسد. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| JSON schema **(الزامی)** | فایل JSON معتبر که فرم را تعریف می‌کند. [ساختار schema](/json-modals#schema) |
| Locations **(الزامی)** | حداقل یک Location. |

[جزئیات JSON modal](/json-modals)

#### JSON panel {#json-panel}

| فیلد | توضیح |
| --- | --- |
| Panel name **(الزامی)** | حداکثر ۳۰ کاراکتر. |
| Panel description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| API endpoint **(الزامی)** | endpoint پلاگین تو. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| JSON data structure **(الزامی)** | فایل JSON معتبر که ساختار پنل را تعریف می‌کند. |
| Panel locations **(الزامی)** | حداقل یکی از Deal details، Person details، Organization details. |

[جزئیات JSON panel](/json-panels)

#### Custom modal {#custom-modal}

| فیلد | توضیح |
| --- | --- |
| Modal name **(الزامی)** | حداکثر ۳۰ کاراکتر. |
| Modal description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| Iframe URL **(الزامی)** | فقط HTTPS. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| ID | دیدار می‌سازد؛ فقط‌خواندنی و قابل کپی. |
| Entry points | اختیاری؛ Locationهای منوی عملیات. بدون Entry point، modal فقط از طریق SDK اجرا می‌شود. |

[جزئیات Custom modal](/custom-modals)

#### Custom panel {#custom-panel}

| فیلد | توضیح |
| --- | --- |
| Panel name **(الزامی)** | حداکثر ۳۰ کاراکتر. |
| Panel description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| Iframe URL **(الزامی)** | فقط HTTPS. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| Panel locations **(الزامی)** | حداقل یکی از Deal details، Person details، Organization details. |

[جزئیات Custom panel](/custom-panels)

#### App settings {#app-settings}

| فیلد | توضیح |
| --- | --- |
| Type **(الزامی)** | `External link` یا `Custom UI`. |
| URL | برای External link الزامی. |
| Iframe URL | برای Custom UI الزامی؛ فقط HTTPS. |
| JWT secret | برای Custom UI الزامی. |

هر پلاگین فقط یک App settings دارد. [جزئیات App settings](/app-settings)

### پیام‌های خطای فرم {#validation}

اگر Save خطا داد، یکی از این پیام‌ها نشان داده می‌شود و تغییرات در صفحه می‌مانند تا اصلاحشان کنی:

| وقتی | پیام |
| --- | --- |
| فیلد الزامی خالی است | `[Field name] is required.` |
| URL نامعتبر است | `Enter a valid URL.` یا برای Callback URL: `Enter a valid callback URL.` |
| Iframe URL با HTTPS نیست | `Enter a valid HTTPS URL.` |
| نام بیشتر از ۳۰ کاراکتر است | `Name must be 30 characters or fewer.` |
| توضیح بیشتر از ۱۵۰ کاراکتر است | `Description must be 150 characters or fewer.` |
| JWT secret خالی است | `Enter a JWT secret.` |
| فایل JSON نامعتبر است | `This file isn’t valid JSON. Please upload a valid JSON file.` |

## پلاگین Draft را نصب و تست کن {#test}

بعد از ثبت، پلاگین را روی همان شرکتی که در آن ثبتش کرده‌ای ([شرکت آزمایشی](/test-environment)) نصب و تست کن:

1. لینک نصب را با **Share app** (یا Share install link در My apps) بردار.
2. آن را در مرورگری که در آن داخل همان شرکت هستی باز کن و نصب را تأیید کن.
3. اکستنشن‌ها را از داخل صفحه‌های دیدار اجرا کن.

[چک‌لیست تست](/test-environment#checklist) · وقتی همه‌چیز درست بود: [انتشار و نگهداری](/publishing)

## بعد از این بخوان {#read-next}

- [Client ID و Client secret](/client-id-and-client-secret)
- [تکمیل نصب](/installation-authorization)
- [مرور اکستنشن‌ها](/app-extensions)
