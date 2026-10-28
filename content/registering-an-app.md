---
title: ثبت اپ
section: start
order: 13
lead: اپ را در Developer Hub ثبت می‌کنی، آن را روی BizDomain خودت نصب و تست می‌کنی و در پایان Live می‌کنی تا با لینک نصب به کسب‌وکارهای دیگر برسد. این صفحه همه‌ی فیلدهای فرم ثبت اپ را توضیح می‌دهد.
description: ثبت اپ در Developer Hub دیدار؛ فیلدهای Basic info، OAuth & access scopes و App extensions، تست اپ Draft، Change to live و لینک نصب.
---

## Developer Hub را پیدا کن {#find}

با حساب ادمین BizDomain وارد دیدار شو و به `https://app.didar.me/developerhub` برو. [Developer Hub](/developer-hub)

## اپ جدید بساز {#create}

در My apps روی **Create an app** بزن. فرم ثبت اپ باز می‌شود. اپ‌هایی که قبلاً ساخته‌ای هم در همین فهرست هستند.

## فرم ثبت اپ {#form}

فرم سه تب دارد: **Basic info**، **OAuth & access scopes** و **App extensions**. پیش از اولین Save فقط Basic info فعال است. بالای صفحه دکمه‌های **Save** و **Cancel** هستند و بعد از ساخت اپ، **Change to live** هم اضافه می‌شود.

### Basic info {#basic-info}

| فیلد | توضیح |
| --- | --- |
| App name **(الزامی)** | نامی که ادمین هنگام نصب و کاربران در دیدار می‌بینند. خالی یا فقط فاصله پذیرفته نمی‌شود. |
| Callback URL **(الزامی)** | آدرسی روی سرور تو که دیدار بعد از تأیید نصب، `code` نصب را به آن می‌فرستد. باید URL معتبر باشد، مثلاً `https://your-app.example.com/didar/callback`. [تکمیل نصب](/installation-authorization) |
| App type | فعلاً همیشه `Private` و غیرقابل‌تغییر است. |

با Save، اپ با وضعیت **Draft** ساخته می‌شود و صفحه‌ی ویرایش آن باز می‌شود.

### OAuth & access scopes {#scopes}

| فیلد | توضیح |
| --- | --- |
| Access scopes **(الزامی)** | دسترسی‌های اپ. **Access to basic information** همیشه روشن است. برای Deals، Activities، Contacts و Cases تاگل را روشن کن و **Read only** (پیش‌فرض) یا **Full access** را انتخاب کن. [Scopeها و دسترسی‌ها](/scopes) |
| Client ID | شناسه‌ی عمومی اپ. فقط‌خواندنی و قابل کپی. |
| Client secret | رمز اپ. پیش‌فرض پنهان است؛ قابل نمایش، کپی و **Refresh**. [Client ID و Client secret](/client-id-and-client-secret) |
| Share app | لینک نصب اپ را نشان می‌دهد. [اشتراک اپ](#share) |

### App extensions {#extensions}

اکستنشن‌ها قابلیت اپ را داخل UI دیدار می‌آورند. شش کارت می‌بینی؛ با **Add** هرکدام، مودال همان نوع باز می‌شود. اکستنشن‌های اضافه‌شده در **My added extensions** فهرست می‌شوند و منوی ⋯ هرکدام **Edit extension** و **Delete** دارد. [مرور اکستنشن‌ها](/app-extensions)

> [!NOTE]
> Save داخل مودال فقط اکستنشن را موقتاً به فهرست اضافه می‌کند. تا Save اصلی صفحه را نزنی، چیزی ذخیره نمی‌شود.

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
| API endpoint **(الزامی)** | endpoint اپ تو که submit فرم به آن می‌رسد. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| JSON schema **(الزامی)** | فایل JSON معتبر که فرم را تعریف می‌کند. [ساختار schema](/json-modals#schema) |
| Locations **(الزامی)** | حداقل یک Location. |

[جزئیات JSON modal](/json-modals)

#### JSON panel {#json-panel}

| فیلد | توضیح |
| --- | --- |
| Panel name **(الزامی)** | حداکثر ۳۰ کاراکتر. |
| Panel description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| API endpoint **(الزامی)** | endpoint اپ تو. |
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

هر اپ فقط یک App settings دارد. [جزئیات App settings](/app-settings)

### پیام‌های خطای فرم {#validation}

| وقتی | پیام |
| --- | --- |
| فیلد الزامی خالی است | `[Field name] is required.` |
| URL نامعتبر است | `Enter a valid URL.` یا برای Callback URL: `Enter a valid callback URL.` |
| Iframe URL با HTTPS نیست | `Enter a valid HTTPS URL.` |
| نام بیشتر از ۳۰ کاراکتر است | `Name must be 30 characters or fewer.` |
| توضیح بیشتر از ۱۵۰ کاراکتر است | `Description must be 150 characters or fewer.` |
| JWT secret خالی است | `Enter a JWT secret.` |
| فایل JSON نامعتبر است | `This file isn’t valid JSON. Please upload a valid JSON file.` |

## اپ Draft را نصب و تست کن {#test}

پیش از Live کردن، اپ را روی BizDomain خودت نصب و تست کن:

1. لینک نصب را با **Share app** (یا Share install link در My apps) بردار.
2. آن را در مرورگری که با حساب ادمین خودت وارد دیدار شده‌ای باز کن و نصب را تأیید کن.
3. اکستنشن‌ها را از داخل صفحه‌های دیدار اجرا کن.

[چک‌لیست تست](/test-environment#checklist)

## اپ را به اشتراک بگذار {#share}

### اپ را Live کن {#live}

بالای صفحه‌ی ویرایش، **Change to live** را بزن و تأیید کن. وضعیت اپ از Draft به Live تغییر می‌کند.

> [!WARNING]
> - اپ Live دیگر به Draft برنمی‌گردد.
> - از این به بعد هر تغییری که ذخیره کنی، فوراً برای همه‌ی کاربران اپ اعمال می‌شود.

### لینک نصب را بردار {#install-link}

در My apps از منوی ⋯ گزینه‌ی **Share install link**، یا در تب OAuth & access scopes دکمه‌ی **Share app** را بزن و لینک را کپی کن. هر کسی این لینک را داشته باشد به مسیر نصب هدایت می‌شود؛ نصب نهایی را ادمین همان کسب‌وکار تأیید می‌کند.

## وضعیت اپ {#status}

| وضعیت | چه کسی می‌تواند نصب کند |
| --- | --- |
| Draft | برای تست روی BizDomain خودت؛ لینک هنوز برای کسب‌وکارهای دیگر قابل اشتراک نیست. |
| Live | هر کسب‌وکاری در دیدار که لینک نصب را داشته باشد. |

## بعد از این بخوان {#read-next}

- [جریان نصب اپ](/app-installation-flows)
- [تکمیل نصب](/installation-authorization)
- [مرور اکستنشن‌ها](/app-extensions)
