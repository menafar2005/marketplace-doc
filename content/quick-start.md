---
title: شروع سریع
section: start
order: 4
lead: این صفحه کمک می‌کند endpoint اپ تو یک launch code بگیرد، آن را با JWT عوض کند و اطلاعات معامله‌ی مجاز را بخواند.
description: تبدیل launch code به Runtime Token و اولین درخواست پروکسی.
---

## پیش‌نیازها {#prereq}

- `ClientId` و `ClientSecret` اپ
- یک endpoint عمومی HTTPS در backend اپ
- نصب شدن اپ روی یک کسب‌وکار دیدار
- scope لازم؛ برای این مثال `deals`

## ۱. endpoint اجرای اپ {#launch}

دیدار endpoint ثبت‌شده‌ی اکستنشن را با query parameter زیر صدا می‌زند:

```http title="Launch"
GET https://your-app.example.com/api/launch?launchCode=ONE_TIME_CODE
```

کد باید در backend پردازش شود. برای JSON extension همین endpoint نتیجه‌ی JSON نهایی را برمی‌گرداند؛ برای iframe یا link می‌تواند صفحه‌ی اپ را نمایش دهد.

## ۲. تبدیل launch code به Runtime Token {#exchange}

```http title="POST"
POST https://marketplace.didar.me/api/v1/runtime/token
```

این درخواست به Bearer token نیاز ندارد و فقط از backend اپ ارسال می‌شود.

```bash title="cURL"
curl --request POST \
  --url https://marketplace.didar.me/api/v1/runtime/token \
  --header "Content-Type: application/json" \
  --data '{
    "launchCode": "ONE_TIME_CODE",
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET"
  }'
```

نمونه پاسخ موفق:

```json title="Response 200"
{
  "succeeded": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "expiresInSeconds": 300,
    "context": {
      "target": "extension",
      "runtimeId": "11a16d52-b89a-4d0f-ac51-55b2b8161ba7",
      "location": 2,
      "entityType": "deal",
      "entityIds": ["704e1533-cb4b-42d7-895d-ef71ff32ba5b"],
      "payload": {
        "customerEmail": "customer@example.com"
      }
    }
  },
  "error": null,
  "meta": {
    "traceId": "...",
    "correlationId": null,
    "timestampUtc": "2026-09-30T10:00:00Z"
  }
}
```

## ۳. فراخوانی API پروکسی {#proxy}

شناسه‌ی معامله را از `context.entityIds` بگیر؛ به شناسه‌ی ارسالی مستقل از context اعتماد نکن.

```bash title="cURL"
curl --request GET \
  --url https://marketplace.didar.me/api/v1/deals/704e1533-cb4b-42d7-895d-ef71ff32ba5b \
  --header "Authorization: Bearer RUNTIME_ACCESS_TOKEN" \
  --header "Accept: application/json"
```

> [!NOTE]
> **اعتبار کوتاه.** Runtime Token برای همان اجرا ساخته می‌شود. آن را session دائمی اپ فرض نکن و برای اجرای بعدی reuse نکن.

## نمونه backend {#backend}

```js title="server.js"
app.get("/api/launch", async (req, res) => {
  const tokenResponse = await fetch(
    "https://marketplace.didar.me/api/v1/runtime/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        launchCode: req.query.launchCode,
        clientId: process.env.DIDAR_CLIENT_ID,
        clientSecret: process.env.DIDAR_CLIENT_SECRET
      })
    }
  );
  const tokenResult = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenResult.succeeded) {
    return res.status(tokenResponse.status).json(tokenResult);
  }
  const { accessToken, context } = tokenResult.data;
  const dealId = context.entityIds[0];
  const dealResponse = await fetch(
    `https://marketplace.didar.me/api/v1/deals/${dealId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  res.status(dealResponse.status).json(await dealResponse.json());
});
```

## قدم بعدی {#next}

- [احراز هویت و نصب](/installation): callback نصب، `CompleteInstallation` و نگهداری امن credentials.
- [App Extensions](/extensions): JSON form، iframe و action link.
