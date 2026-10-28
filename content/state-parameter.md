---
title: پارامتر state
section: start
order: 34
lead: state یک مقدار تصادفی و یک‌بارمصرف است که اپ تو پیش از فرستادن کاربر به نصب می‌سازد و در Callback URL دوباره دریافت می‌کند. با مقایسه‌ی این دو، مطمئن می‌شوی callback واقعاً ادامه‌ی همان جریان نصبی است که خودت شروع کرده‌ای.
description: پارامتر state در جریان نصب اپ دیدار؛ چیست، چرا لازم است و چطور ساخته و بررسی می‌شود.
---

## state چیست؟ {#what}

مقداری که اپ تو می‌سازد، پیش از نصب در session کاربر نگه می‌دارد و دیدار آن را در query پارامتر `state` به Callback URL برمی‌گرداند.

## چرا لازم است؟ {#why}

بدون state، هر کسی می‌تواند یک درخواست جعلی با `code` دلخواه به Callback URL تو بفرستد و نصبی را به session اشتباه وصل کند (حمله‌ی CSRF). با state، callbackی که state معتبر ندارد رد می‌شود.

## چطور از state استفاده کنم؟ {#how}

1. پیش از فرستادن کاربر به صفحه‌ی نصب، یک مقدار تصادفی امن بساز (مثلاً ۳۲ بایت تصادفی).
2. آن را در session همان کاربر ذخیره کن.
3. در Callback URL، `state` دریافتی را با مقدار session مقایسه کن.
4. اگر برابر نبود یا وجود نداشت، درخواست را رد کن و `CompleteInstallation` را صدا نزن.
5. اگر برابر بود، مقدار را از session پاک کن (یک‌بارمصرف) و [نصب را کامل کن](/installation-authorization#step-4).

```js title="routes/callback.js"
app.get("/didar/callback", async (req, res) => {
  const { code, state } = req.query;
  const expected = req.session.installState;
  delete req.session.installState; // یک‌بارمصرف
  if (expected && state !== expected) {
    return res.status(400).send("Invalid state");
  }
  // ادامه: CompleteInstallation با code
});
```

## هنوز مستند نشده {#open}

> [!WARNING]
> نحوه‌ی اضافه کردن state به لینک نصب دیدار هنوز در منبع فنی نیامده است. منبع فقط می‌گوید اگر state وجود داشته باشد، دیدار آن را در query به Callback URL برمی‌گرداند.

## بعد از این بخوان {#read-next}

- [تکمیل نصب](/installation-authorization)
- [جریان نصب اپ](/app-installation-flows)
