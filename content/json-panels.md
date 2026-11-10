---
title: JSON panel
section: start
order: 23
lead: JSON panel داده‌ی پلاگین تو را با اجزای آماده‌ی دیدار، در ستون کناری صفحه‌ی جزئیات نشان می‌دهد. کاربر برای دیدنش کاری انجام نمی‌دهد؛ با باز کردن صفحه‌ی جزئیات، پنل را کنار رکورد می‌بیند. این صفحه توضیح می‌دهد JSON panel چیست، ساختار JSON و داده‌اش چطور تعریف می‌شود، کجا دیده می‌شود و چطور اضافه می‌شود.
description: اکستنشن JSON panel در دیدار؛ کاربرد، جای نمایش، ساختار JSON با layout details، گرفتن داده با extension.load، ظرفیت، افزودن در Developer Hub و تفاوت با Custom panel.
---

## JSON panel چیست؟ {#what}

JSON panel یک پنل در ستون کناری صفحه‌ی جزئیات است که داده‌ی پلاگین تو را کنار رکورد دیدار نشان می‌دهد. هدفش این است که کاربر برای دیدن اطلاعات مرتبط، بین دیدار و سیستم‌های دیگر جابه‌جا نشود؛ همه‌چیز همان‌جا کنار معامله، شخص یا شرکت است.

مثل [JSON modal](/json-modals)، ظاهر پنل را دیدار با اجزای آماده‌ی خودش می‌سازد؛ تو ساختار داده‌ی پنل را در یک فایل JSON تعریف می‌کنی و یک API endpoint روی سرورت ثبت می‌کنی. پس پنل خودبه‌خود با بقیه‌ی UI دیدار و هر دو تم هماهنگ است و لازم نیست frontend بنویسی.

چند مثال:

- مانده‌حساب و فاکتورهای باز مشتری کنار پرونده‌ی شخص،
- وضعیت سفارش‌ها کنار معامله،
- آخرین تیکت‌های پشتیبانی کنار پرونده‌ی شرکت.

## JSON panel یا Custom panel؟ {#vs-custom}

هر دو در همان ستون کناری می‌نشینند و فرقشان در این است که UI را چه کسی می‌سازد:

| | JSON panel | [Custom panel](/custom-panels) |
| --- | --- | --- |
| UI را چه کسی می‌سازد | دیدار، از روی فایل JSON تو | تو، با HTML و CSS و JavaScript داخل iframe |
| مناسب برای | نمایش ساده‌ی داده با ظاهر یکدست | نمایش آزاد و تعامل پیچیده |
| آدرسی که ثبت می‌کنی | API endpoint | Iframe URL (فقط HTTPS) |
| ساختار | [ساختار JSON اکستنشن](/json-extension-schema)، معمولاً با `layout` برابر `details` | صفحه‌ی HTML خودت |
| داده‌ی پنل | دیدار با `extension.load` از endpoint تو می‌گیرد | صفحه‌ی تو خودش می‌گیرد |

## در UI دیدار کجاست؟ {#visibility}

- در **ستون کناری** صفحه‌های **Deal details**، **Person details** و **Organization details**.
- کاربر برای دیدن پنل کاری انجام نمی‌دهد؛ با باز کردن صفحه‌ی جزئیات، پنل را می‌بیند.
- هر پلاگین در هر صفحه‌ی جزئیات فقط **یک پنل** دارد: یا JSON panel یا Custom panel، نه هر دو. پس هر پلاگین حداکثر سه پنل دارد.

![پنل نرخ‌های روز در صفحه‌ی جزئیات معامله](/images/extensions/panel-rates.webp "پنل پلاگین در ستون کناری صفحه‌ی جزئیات معامله، زیر اطلاعات معامله")

![پنل کمیسیون در صفحه‌ی جزئیات معامله](/images/extensions/panel-commission.webp "نمونه‌ی دیگر: محاسبه روی داده‌ی همان معامله")

## ساختار پنل {#structure}

پنل با همان [ساختار JSON اکستنشن](/json-extension-schema) تعریف می‌شود که JSON modal دارد. برای پنلی که فقط اطلاعات نشان می‌دهد، `layout` را `details` بگذار و از آیتم‌های نمایشی استفاده کن: `value` برای مقداری که از سرور تو می‌آید، `link` برای لینک امن، `message` برای پیام و `divider` برای جداکننده. `loadOnOpen` را `true` بگذار تا دیدار هنگام نمایش پنل داده‌اش را از endpoint تو بگیرد.

```json title="panel.json"
{
  "schemaVersion": 1,
  "layout": "details",
  "title": "اطلاعات سرویس",
  "loadOnOpen": true,
  "sections": [
    {
      "id": "service",
      "items": [
        { "type": "value", "key": "plan", "label": "پلن" },
        { "type": "value", "key": "status", "label": "وضعیت" },
        { "type": "divider" },
        {
          "type": "link",
          "label": "مشاهده در اپلیکیشن",
          "url": "https://example.com/customer"
        }
      ]
    }
  ]
}
```

## داده‌ی پنل از کجا می‌آید؟ {#data}

وقتی پنل نمایش داده می‌شود و `loadOnOpen` روشن است، دیدار endpoint تو را با `POST` و رویداد `extension.load` صدا می‌زند. `context.entityId` شناسه‌ی شخص، شرکت یا معامله‌ای است که صفحه‌ی جزئیاتش باز است:

```json title="درخواست extension.load"
{
  "event": "extension.load",
  "runtimeId": "9de20339-d819-481a-a90c-79f66692413d",
  "context": {
    "location": 4,
    "locale": "fa",
    "entityId": "person-id"
  }
}
```

endpoint تو مقدار هر آیتم `value` را با همان `key` در `data.values` برمی‌گرداند:

```json title="پاسخ"
{
  "ok": true,
  "data": {
    "values": {
      "plan": "حرفه‌ای",
      "status": "فعال"
    }
  }
}
```

این درخواست هم مثل JSON modal با fetch مرورگر فرستاده می‌شود، پس endpoint باید HTTPS باشد و [CORS](/json-modals#cors) را برای مبدأهای رسمی دیدار باز کند. قرارداد کامل: [extension.load](/api-app-endpoints#json-load)

## JSON panel را چطور اضافه کنم؟ {#add}

در Developer Hub، تب **App extensions**، کارت **JSON panel** را انتخاب کن و **Add** بزن.

| فیلد | توضیح |
| --- | --- |
| Panel name **(الزامی)** | عنوان پنل؛ حداکثر ۳۰ کاراکتر. |
| Panel description | اختیاری؛ حداکثر ۱۵۰ کاراکتر. |
| API endpoint **(الزامی)** | endpoint پلاگین تو؛ URL معتبر و HTTPS. |
| JWT secret **(الزامی)** | [توضیح](/custom-ui-extensions#jwt-secret) |
| JSON data structure **(الزامی)** | فایل `.json` معتبر با [ساختار JSON اکستنشن](/json-extension-schema) که ساختار پنل را تعریف می‌کند. |
| Panel locations **(الزامی)** | حداقل یکی از Deal details، Person details، Organization details. در صفحه‌ای که پلاگین Custom panel دارد، JSON panel اضافه نمی‌شود. |

## هنوز مستند نشده {#open}

> [!WARNING]
> مثل [JSON modal](/json-modals#open)، قرارداد `extension.load` نمی‌گوید endpoint پنل چطور به Runtime Token می‌رسد؛ اگر برای ساختن داده‌ی پنل به API دیدار نیاز داری، این بخش را با تیم فنی تأیید کن.

## بعد از این بخوان {#read-next}

- [ساختار JSON اکستنشن](/json-extension-schema)
- [Custom panel](/custom-panels)
- [مرور اکستنشن‌ها](/app-extensions)
