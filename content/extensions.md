---
title: App Extensions
section: reference
order: 4
lead: این صفحه کمک می‌کند قابلیت اپ را داخل محیط دیدار نشان بدهی؛ نوع محتوا تعیین می‌کند دیدار صفحه‌ای باز کند یا یک فرم JSON را render و submit کند.
description: نوع محتوا، surface، locationها، جریان launch، فرم JSON، پاسخ submit و CORS برای اکستنشن‌های دیدار.
---

## نوع محتوا و سطح نمایش {#types}

| ContentType | مقدار | رفتار |
| --- | --- | --- |
| `IFrame` | 1 | endpoint اپ داخل iframe باز می‌شود. |
| `Link` | 2 | endpoint در مسیر لینک/صفحه‌ی خارجی باز می‌شود. |
| `Json` | 3 | دیدار schema را render می‌کند و نتیجه‌ی فرم را به launch endpoint می‌فرستد. |

| SurfaceType | مقدار |
| --- | --- |
| `Modal` | 1 |
| `Sidebar` | 2 |
| `ActionLink` | 3 |

## Locationها {#locations}

| مقدار | محل | entityType |
| --- | --- | --- |
| 1 | لیست معاملات | `deal` |
| 2 | جزئیات معامله | `deal` |
| 3 | لیست اشخاص | `person` |
| 4 | جزئیات شخص | `person` |
| 5 | لیست شرکت‌ها | `company` |
| 6 | جزئیات شرکت | `company` |
| 7 | لیست پرونده‌ها | `case` |
| 8 | جزئیات پرونده | `case` |

در صفحات لیست، `entityIds` می‌تواند شامل چند شناسه‌ی انتخاب‌شده باشد. در صفحات جزئیات معمولاً یک شناسه وجود دارد.

## جریان launch {#flow}

1. frontend دیدار اکستنشن‌های نصب‌شده برای location فعلی را دریافت می‌کند.
2. هنگام اجرا، دیدار یک launch code برای `runtimeId` و context فعلی می‌سازد.
3. دیدار `launchCode` را به `EndpointUrl` اضافه می‌کند.
4. backend اپ code را با Runtime Token تعویض می‌کند.
5. iframe/link UI خودش را نمایش می‌دهد؛ JSON endpoint عملیات را انجام می‌دهد و نتیجه‌ی ساختاریافته می‌دهد.

## فرم JSON و payload {#json-form}

هر input یک `key` دارد. frontend دیدار مقدار واردشده را با همان key در `payload` قرار می‌دهد. نمونه schema دوزبانه:

```json title="Form schema"
{
  "schemaVersion": 1,
  "layout": "form",
  "title": { "fa": "ایجاد جلسه گوگل میت", "en": "Create Google Meet" },
  "description": {
    "fa": "یک جلسه آزمایشی بسازید و لینک آن را در یادداشت معامله ثبت کنید.",
    "en": "Create a mock meeting and save its link as a deal note."
  },
  "loadOnOpen": false,
  "sections": [{
    "id": "meeting-information",
    "title": { "fa": "اطلاعات جلسه", "en": "Meeting information" },
    "items": [
      {
        "type": "text",
        "key": "customerEmail",
        "label": { "fa": "ایمیل مشتری", "en": "Customer email" },
        "required": false,
        "maxLength": 320
      },
      {
        "type": "text",
        "key": "inviterEmail",
        "label": { "fa": "ایمیل دعوت‌کننده", "en": "Inviter email" },
        "required": true,
        "maxLength": 320
      },
      {
        "type": "textarea",
        "key": "meetingDescription",
        "label": { "fa": "توضیحات جلسه", "en": "Meeting description" },
        "required": true,
        "maxLength": 2000
      },
      {
        "type": "checkbox",
        "key": "isUsePersonEmail",
        "label": { "fa": "استفاده از ایمیل شخص معامله", "en": "Use the deal person's email" },
        "required": false,
        "defaultValue": false
      }
    ]
  }],
  "submit": {
    "label": { "fa": "ایجاد جلسه", "en": "Create meeting" },
    "closeOnSuccess": true,
    "successMessage": {
      "fa": "جلسه ایجاد و به یادداشت‌های معامله اضافه شد.",
      "en": "The meeting was created and added to the deal notes."
    }
  }
}
```

`payload` متناظر در Runtime Context:

```json title="context.payload"
{
  "customerEmail": "customer@example.com",
  "inviterEmail": "sales@example.com",
  "meetingDescription": "جلسه معرفی محصول",
  "isUsePersonEmail": false
}
```

## پاسخ JSON extension {#response}

فقط برای submit فرم JSON، frontend دیدار پاسخ endpoint Third-party را می‌خواند و بر اساس آن toast نشان می‌دهد:

```json title="Response"
{
  "succeeded": true,
  "message": "جلسه ساخته شد و یادداشت معامله ذخیره شد.",
  "data": {
    "dealId": "704e1533-cb4b-42d7-895d-ef71ff32ba5b",
    "url": "https://meet.google.com/mock-53c79f7df0"
  }
}
```

در خطا `succeeded: false` و یک `message` قابل‌نمایش برگردان. برای iframe و action link، دیدار این قرارداد toast را پردازش نمی‌کند.

## HTTPS و CORS {#cors}

JSON extension با fetch مرورگر فراخوانی می‌شود؛ endpoint باید HTTPS باشد و origin دقیق دیدار را مجاز کند:

```http title="Response headers"
Access-Control-Allow-Origin: https://app.didar.me
Vary: Origin
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

> [!WARNING]
> **از wildcard استفاده نکن.** اگر محیط‌های دیگری داری، allowlist صریح بساز. CORS جایگزین launch code، token و validation سمت سرور نیست.

## قدم بعدی {#next}

- [صفحه تنظیمات](/settings-page)
- [API دیدار](/api-concepts)
