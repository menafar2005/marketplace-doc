---
title: صفحه تنظیمات اپ
section: reference
order: 5
lead: این صفحه کمک می‌کند صفحه‌ی تنظیمات اپ را بسازی؛ این صفحه هم با launch code باز می‌شود تا اپ tenant و کاربر فعلی را بدون قرار دادن اطلاعات حساس در URL تشخیص دهد.
description: انواع صفحه تنظیمات، جریان اجرا، Runtime Context و الگوی پیشنهادی.
---

## نوع صفحه {#types}

| نوع | مقدار | رفتار |
| --- | --- | --- |
| `ExternalLink` | 1 | تنظیمات در صفحه یا tab خارجی باز می‌شود. |
| `CustomUI` | 2 | UI تنظیمات داخل container دیدار نمایش داده می‌شود. |

## جریان اجرا {#flow}

1. کاربر صفحه‌ی تنظیمات اپ را در دیدار باز می‌کند.
2. دیدار برای اپ نصب‌شده یک launch code می‌سازد.
3. کاربر به URL تنظیمات اپ با `?launchCode=...` هدایت می‌شود.
4. backend اپ code را در `/api/v1/runtime/token` مبادله می‌کند.
5. اپ تنظیمات همان BizDomain را load یا ذخیره می‌کند.

## context صفحه تنظیمات {#context}

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

tenant و user فعلی داخل claims توکن قرار دارند و مارکت‌پلیس در درخواست‌های بعدی آن‌ها را اعتبارسنجی می‌کند. اپ نباید `BizDomainId` را از query دلخواه بپذیرد.

## الگوی پیشنهادی {#pattern}

- launch code را در backend exchange کن.
- پس از exchange، session امن و کوتاه برای UI خودت بساز؛ Runtime Token را در `localStorage` قرار نده.
- تنظیمات را با کلید installation/BizDomain ذخیره کن، نه با ایمیل یا نام کاربر.
- برای تغییرات حساس، CSRF protection و re-authentication مناسب اضافه کن.

> [!NOTE]
> **تفاوت با اکستنشن.** settings به entity مشخصی متصل نیست؛ بنابراین `entityType` ندارد. دسترسی CRM همچنان تابع scopeهای نصب است.
