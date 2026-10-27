---
title: آناتومی یک پلاگین
section: start
order: 2
lead: هر پلاگین دیدار از پنج بخش ساخته می‌شود. این صفحه کمک می‌کند بدانی هر بخش چه کاری می‌کند تا هر صفحه‌ی دیگر داک را سر جایش بگذاری.
description: پنج بخش اپ Third-party در مارکت‌پلیس دیدار و نقش هرکدام.
---

> [!NOTE]
> **MCP وصل است؟** از آن بپرس «ساختار پلاگین دیدار را توضیح بده»؛ همین ساختار را برایت پیاده می‌کند. [اتصال به MCP](/build-with-mcp)

## تصویر کلی {#overview}

پلاگین روی سرور خودت اجرا می‌شود، از طریق API پروکسی مارکت‌پلیس با داده‌های دیدار کار می‌کند و از طریق اکستنشن‌ها داخل صفحه‌های دیدار دیده می‌شود.

```text title="جریان داده"
اپ تو (backend)  <──  launchCode  ──  دیدار (UI)
      │
      ├── POST marketplace.didar.me/api/v1/runtime/token   →  Runtime Token + context
      └── /api/v1/...  با  Authorization: Bearer <Runtime Token>  →  داده‌ی CRM
```

## پنج بخش پلاگین {#parts}

| بخش | چه کاری می‌کند | مرجع |
| --- | --- | --- |
| ۱. ثبت و تنظیمات اپ | هویت اپ در دیدار: `ClientId`، `ClientSecret`، `CallbackUrl`، Installation URL | [ثبت و مدیریت اپ](/app-registration) |
| ۲. احراز هویت و نصب | کاربر اجازه می‌دهد اپ به BizDomain او وصل شود و scopeها ثبت می‌شوند | [احراز هویت و نصب](/installation) |
| ۳. داده با API | خواندن و نوشتن معامله، پرونده، شخص، شرکت، فعالیت و یادداشت از طریق پروکسی | [API دیدار](/api-concepts) |
| ۴. رابط کاربری | اکستنشن (IFrame، Link، Json) و صفحه‌ی تنظیمات داخل دیدار | [App Extensions](/extensions) |
| ۵. سرور پلاگین | جایی که کد تو اجرا می‌شود، credentials و توکن‌ها نگه داشته می‌شوند | [شروع سریع](/quick-start) |

## یک پلاگین کامل، بخش به بخش {#example}

مثال: پلاگینی که در جزئیات معامله یک فرم JSON نشان می‌دهد و با آن یادداشت می‌سازد. ساختار پوشه‌ها نشان می‌دهد هر بخش کجای پروژه است.

```text title="meet-plugin/"
app.config.json     # ۱. ClientId / CallbackUrl / EndpointUrl (secret در secret store)
auth/install.js     # ۲. callback نصب + CompleteInstallation
api/didar.js        # ۳. فراخوانی API پروکسی با Runtime Token
extensions/form.json  # ۴. schema فرم JSON
server.js           # ۵. endpoint launch و تبادل code با token
```

> [!NOTE]
> نام فایل‌ها نمونه است و قرارداد رسمی نیست. قرارداد واقعی همان endpointها و فرمت‌هایی است که در صفحه‌های مرجع آمده؛ ساختار پوشه آزاد است.

## قدم بعدی {#next}

- [شروع سریع](/quick-start): اولین launch code را به token تبدیل کن.
- [ساخت با MCP دیدار](/build-with-mcp): اسکلت را از MCP بگیر.
