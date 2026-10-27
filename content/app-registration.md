---
title: ثبت و مدیریت اپ
section: reference
order: 1
lead: این صفحه کمک می‌کند بدانی بعد از ثبت اپ چه مقادیری در اختیار داری و هرکدام را کجا نگه داری.
description: مقادیر هویتی اپ (ClientId، ClientSecret، CallbackUrl، Installation URL) و نگهداری امن آن‌ها.
---

## مقادیر بعد از ثبت اپ {#values}

پس از ثبت اپ، این مقادیر را در اختیار داری:

| مقدار | کاربرد | محل نگهداری |
| --- | --- | --- |
| `ClientId` | شناسه‌ی عمومی اپ | backend یا config |
| `ClientSecret` | اثبات هویت اپ در تبادل code | Secret Store؛ هرگز frontend |
| `CallbackUrl` | مسیر بازگشت code نصب | HTTPS و ثبت‌شده برای اپ |
| Installation URL | آدرس صفحه‌ی نصب دیدار | هنگام ثبت اپ تولید می‌شود |
| `AppPublicId` | شناسه‌ی عمومی اپ؛ در settings همان `runtimeId` است | در پاسخ `CompleteInstallation` و context تنظیمات |

> [!WARNING]
> `ClientSecret` را در URL، log، analytics، پاسخ browser یا کد frontend قرار نده.

## endpointهای اپ تو {#app-endpoints}

| endpoint | کاربرد | مرجع |
| --- | --- | --- |
| `CallbackUrl` | دریافت `code` و `state` نصب | [احراز هویت و نصب](/installation) |
| `EndpointUrl` هر اکستنشن | دریافت `launchCode` هنگام اجرا | [App Extensions](/extensions) |
| URL صفحه‌ی تنظیمات | باز شدن با `?launchCode=…` | [صفحه تنظیمات](/settings-page) |

همه‌ی این endpointها باید HTTPS باشند.

## هنوز مستند نشده {#open}

> [!WARNING]
> فیلدهای دقیق فرم ثبت اپ در Developer Hub، تفاوت اپ عمومی و خصوصی، و روند به‌روزرسانی، غیرفعال‌سازی و حذف اپ هنوز از تیم فنی دریافت نشده است و در این داک حدس زده نمی‌شود.
