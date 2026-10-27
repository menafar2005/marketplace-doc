---
title: Launch Code و Runtime
section: reference
order: 3
lead: این صفحه کمک می‌کند بفهمی Runtime Context چیست، چطور آن را بگیری و چه چیزی را باید در backend خودت اعتبارسنجی کنی.
description: چرایی launch code، دریافت Runtime Token، ساختار context و اعتبارسنجی در اپ.
---

Runtime Context مشخص می‌کند اپ در کدام tenant، برای کدام اکستنشن و روی چه entityهایی اجرا شده است.

## چرا launch code؟ {#why}

قرار دادن JWT و context کامل در URL باعث نشت اطلاعات در history، access log و referrer می‌شود. دیدار در URL فقط یک code یک‌بارمصرف می‌فرستد. backend اپ آن را با credentials اپ تعویض می‌کند و context معتبر را از مارکت‌پلیس می‌گیرد.

> [!WARNING]
> **مرز اعتماد.** مقادیر query که frontend یا کاربر می‌فرستد context امنیتی نیستند. تنها context برگشتی از endpoint runtime معتبر است.

## دریافت token {#token}

```http title="POST"
POST https://marketplace.didar.me/api/v1/runtime/token
```

```json title="Request body"
{
  "launchCode": "ONE_TIME_CODE",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET"
}
```

نمونه‌ی کامل پاسخ در [شروع سریع](/quick-start) آمده است.

## ساختار context {#context}

| فیلد | توضیح |
| --- | --- |
| `target` | `extension` یا `settings_page` |
| `runtimeId` | شناسه‌ی runtime اکستنشن؛ برای settings شناسه‌ی عمومی اپ |
| `location` | محل اجرای اکستنشن؛ در settings مقدار `null` |
| `entityType` | `deal`، `case`، `person` یا `company` |
| `entityIds` | لیست entityهای مجاز در این اجرا؛ ممکن است بیش از یک شناسه داشته باشد |
| `payload` | مقادیر فرم JSON که بر اساس keyهای schema جمع‌آوری شده‌اند |

## اعتبارسنجی در اپ تو {#validate}

- موفق بودن HTTP و `succeeded` را بررسی کن.
- `target` و `runtimeId` را با endpoint مورد انتظار تطبیق بده.
- برای عملیات entityمحور فقط از `entityType` و `entityIds` برگشتی استفاده کن.
- `payload` را untrusted input بدان و required، نوع، طول و قالب آن را در backend دوباره validate کن.
- token را فقط تا پایان همان اجرا در حافظه نگه دار.

## ارسال token {#bearer}

```http title="Header"
Authorization: Bearer eyJhbGciOi...
```

مارکت‌پلیس installation، scope و context را از token استخراج می‌کند. ارسال `BizDomainId` یا API Key دیدار در هر درخواست پروکسی لازم نیست.

## خطاهای متداول تبادل {#errors}

| کد | معنی |
| --- | --- |
| `INVALID_CLIENT_CREDENTIALS` | `ClientId` یا `ClientSecret` معتبر نیست. |
| `LAUNCH_CODE_INVALID` | کد ناشناخته یا متعلق به این اپ نیست. |
| `LAUNCH_CODE_ALREADY_USED` | کد قبلاً مصرف شده است. |
| `LAUNCH_CODE_EXPIRED` | زمان اعتبار کد پایان یافته است. |

فهرست کامل: [امنیت و خطاها](/security-errors).
