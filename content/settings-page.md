---
title: صفحه‌ی تنظیمات اپ
section: start
order: 21
lead: اگر اپ تو برای هر کسب‌وکار پیکربندی جدا لازم دارد (مثلاً کلید API یک سرویس بیرونی)، یک App settings بساز. این صفحه هم مثل اکستنشن‌ها با launchCode باز می‌شود تا بدون گذاشتن اطلاعات حساس در URL بدانی کدام کسب‌وکار آن را باز کرده.
description: اکستنشن App settings (External link یا Custom UI)، مسیر باز شدن آن در دیدار، Runtime Context صفحه‌ی تنظیمات و الگوی پیشنهادی.
---

## کاربر کجا آن را می‌بیند؟ {#where}

کاربر در دیدار وارد فهرست **اپ‌های نصب‌شده** می‌شود، اپ تو را پیدا می‌کند و **تنظیمات** آن را باز می‌کند. هر اپ فقط **یک** App settings دارد.

## دو نوع {#types}

| در Developer Hub | مقدار فنی | رفتار | چه ثبت می‌کنی |
| --- | --- | --- | --- |
| External link | `ExternalLink` (1) | صفحه‌ی تنظیمات تو در یک tab جدید مرورگر باز می‌شود. | URL |
| Custom UI | `CustomUI` (2) | UI تنظیمات تو در یک iframe داخل بخش تنظیمات دیدار نمایش داده می‌شود. | Iframe URL (فقط HTTPS) و JWT secret |

## جریان اجرا {#flow}

1. کاربر تنظیمات اپ را در دیدار باز می‌کند.
2. دیدار برای اپ نصب‌شده یک launchCode می‌سازد.
3. کاربر به URL تنظیمات تو با `?launchCode=…` هدایت می‌شود.
4. backend تو کد را با [`/api/v1/runtime/token`](/api-auth#runtime-token) به token تبدیل می‌کند.
5. اپ تنظیمات همان BizDomain را می‌خواند یا ذخیره می‌کند.

## context صفحه‌ی تنظیمات {#context}

```json title="context"
{
  "target": "settings_page",
  "runtimeId": "APP_PUBLIC_ID",
  "location": null,
  "entityType": null,
  "entityIds": [],
  "payload": {}
}
```

تنظیمات به رکورد خاصی وصل نیست، پس `entityType` ندارد. `runtimeId` همان `AppPublicId` است که هنگام نصب گرفتی. tenant و کاربر فعلی داخل خود token هستند و مارکت‌پلیس در درخواست‌های بعدی آن‌ها را بررسی می‌کند؛ اپ نباید `BizDomainId` را از query بپذیرد.

## الگوی پیشنهادی {#pattern}

- launchCode را در backend exchange کن.
- بعد از exchange، یک session امن و کوتاه برای UI خودت بساز؛ Runtime Token را در `localStorage` نگذار.
- تنظیمات را با کلید نصب یا BizDomain ذخیره کن، نه با ایمیل یا نام کاربر.
- برای تغییرات حساس، محافظت CSRF و احراز هویت مجدد اضافه کن.

> [!NOTE]
> دسترسی به داده‌ی دیدار در صفحه‌ی تنظیمات هم تابع scopeهای نصب است.
