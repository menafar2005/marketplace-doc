---
title: Marketplace SDK
section: start
order: 28
lead: صفحه‌ی Custom UI تو داخل iframe دیدار اجرا می‌شود و به window اصلی دیدار دسترسی ندارد. Marketplace SDK راه رسمی و امن برای حرف زدن با دیدار از داخل همین iframe است؛ با آن toast دیدار را نشان می‌دهی، از کاربر با confirm استاندارد دیدار تأیید می‌گیری و popup جاری را می‌بندی. این صفحه نصب، همه‌ی متدها، permissionها، قرارداد پیام و استفاده‌ی بدون npm را توضیح می‌دهد.
description: Marketplace SDK دیدار (@didar/marketplace-sdk) برای اپ‌های iframe؛ نصب با npm یا تگ script، ساخت client، toast، confirm، popup، مدیریت خطا، permissionها، actionها، قرارداد postMessage و نکات امنیتی.
---

## SDK چیست و کی لازمش داری؟ {#what}

اکستنشن‌های [Custom UI](/custom-ui-extensions) (Custom modal، Custom panel و App settings از نوع Custom UI) صفحه‌ی خودت را داخل یک `iframe` در دیدار نشان می‌دهند. صفحه‌ی تو با هر تکنولوژی‌ای ساخته شده باشد، از داخل iframe نباید مستقیم به سرویس‌ها، کدهای داخلی یا window اصلی دیدار دسترسی بگیرد. ارتباط امن بین صفحه‌ی تو و دیدار از طریق **پیام** (`window.parent.postMessage`) انجام می‌شود و Marketplace SDK همین ارتباط را برایت ساده می‌کند.

در مارکت‌پلیس دیدار سه مسیر برای UI داری:

| مسیر | کی |
| --- | --- |
| [iframe app (Custom UI)](/custom-ui-extensions) | وقتی می‌خواهی UI کامل خودت را با React، Vue، Angular یا JavaScript بسازی. |
| **Marketplace SDK** | وقتی اپ iframe می‌خواهد با دیدار ارتباط runtime بگیرد؛ مثل نمایش toast، گرفتن تأیید کاربر یا بستن popup. |
| [اکستنشن JSON](/json-extension-schema) | وقتی فقط یک فرم یا پنل native داخل دیدار می‌خواهی و نمی‌خواهی UI جدا بسازی. |

> [!NOTE]
> برای [JSON modal](/json-modals)، [JSON panel](/json-panels) و [Links](/link-actions) به SDK نیازی نیست. در اکستنشن JSON، دیدار خودش ساختار را رندر می‌کند و مستقیماً با endpoint تو ارتباط می‌گیرد؛ SDK و `postMessage` فقط برای اکستنشن‌های iframe لازم یا مفیدند.

## تصویر کلی {#how}

1. صفحه‌ی تو داخل دیدار (در iframe) باز می‌شود.
2. تو با SDK یا با `postMessage` مستقیم یک درخواست به دیدار می‌فرستی.
3. اپ دیدار درخواست را دریافت می‌کند.
4. دیدار از backend مجوز اپ را بررسی می‌کند.
5. اگر `origin`، `appId`، `action` و permission معتبر باشند، عملیات انجام می‌شود.
6. نتیجه به صفحه‌ی تو برگردانده می‌شود.

کارهایی که با SDK می‌کنی:

- نمایش toast
- نمایش confirm message داخلی دیدار و گرفتن نتیجه‌ی تأیید یا رد کاربر
- بستن popup فعلی
- باز کردن popupهایی که دیدار مشخصاً برای اپ تو مجاز کرده است
- بستن همه‌ی popupها
- وسط‌چین کردن popup بعد از تغییر اندازه‌ی محتوا
- بررسی باز بودن popup

## نصب {#install}

پکیج رسمی SDK به هیچ فریم‌ورکی وابسته نیست و در JavaScript ساده، React، Vue، Angular، Next.js یا هر پروژه‌ای که پکیج npm نصب کند قابل استفاده است. وابستگی‌ای به Angular، `ngx-toastr` یا سرویس‌های داخلی دیدار ندارد و ارتباطش فقط با `window.parent.postMessage` است.

```bash title="Terminal"
npm install @didar/marketplace-sdk
```

بعد در کدت import کن و یک client بساز:

```ts title="TypeScript"
import {createDidarMarketplaceSdk} from '@didar/marketplace-sdk';

const didar = createDidarMarketplaceSdk({
  appId: 'sample-app',
  targetOrigin: 'https://app.didar.me',
  confirmTimeoutMs: 120000
});
```

### تنظیمات client {#config}

| گزینه | اجباری | پیش‌فرض | توضیح |
| --- | --- | --- | --- |
| `appId` | - | - | شناسه‌ی اپ تو در مارکت‌پلیس دیدار؛ آن را از دیدار بگیر و درست وارد کن. |
| `targetOrigin` | بله | - | آدرس دقیق اپ دیدار، مثل `https://app.didar.me`. در production مقدار دقیق بگذار و از `*` استفاده نکن. |
| `timeoutMs` | خیر | `10000` | مهلت پاسخ درخواست‌ها به میلی‌ثانیه. |
| `confirmTimeoutMs` | خیر | `120000` | مهلت پاسخ `confirm.show`. چون confirm منتظر انتخاب کاربر می‌ماند، پیش‌فرضش طولانی‌تر از درخواست‌های سریع است. |
| `parentWindow` | خیر | `window.parent` | پنجره‌ای که پیام به آن فرستاده می‌شود. |

## اولین مثال {#first-example}

```ts title="TypeScript"
import {createDidarMarketplaceSdk} from '@didar/marketplace-sdk';

const didar = createDidarMarketplaceSdk({
  appId: 'sample-app',
  targetOrigin: 'https://app.didar.me'
});

async function submitForm() {
  try {
    await fetch('/api/save', {method: 'POST'});
    await didar.toast.success('Saved', 'The form was submitted successfully');
    await didar.popup.close(true);
  } catch (error) {
    console.error(error);
  }
}
```

1. فرم داخل اپ تو ذخیره می‌شود.
2. یک toast موفقیت داخل اپ دیدار نمایش داده می‌شود.
3. popup یا modal فعلی در دیدار بسته می‌شود.

## استفاده در JavaScript ساده بدون npm {#script-tag}

اگر پروژه‌ات build system ندارد، فایل browser bundle را با تگ `script` اضافه کن. در این حالت client با `DidarMarketplaceSdk.create` ساخته می‌شود:

```html title="HTML"
<script src="https://cdn.didar.me/marketplace-sdk/v1/didar-marketplace-sdk.min.js"></script>
<script>
  const didar = DidarMarketplaceSdk.create({
    appId: 'sample-app',
    targetOrigin: 'https://app.didar.me'
  });

  didar.toast.success('Saved', 'The form was submitted successfully');
  didar.confirm.show('Are you sure?').then(function(result) {
    if (result.confirmed) {
      didar.toast.success('Confirmed');
    }
  });
</script>
```

> [!NOTE]
> آدرس CDN بعد از انتشار رسمی توسط دیدار اعلام می‌شود و نمونه‌ی بالا فقط شکل استفاده را نشان می‌دهد. اگر فایل را از سرور یا CDN خودت serve می‌کنی، فایل آماده در خروجی پکیج npm در مسیر `browser/didar-marketplace-sdk.min.js` است.

## Toast {#toast}

```ts title="TypeScript"
await didar.toast.success('Saved', 'The form was submitted successfully');
await didar.toast.error('Error', 'Something went wrong');
await didar.toast.warning('Check fields', 'Some required data is missing');
await didar.toast.message('Done');
await didar.toast.info('Info', 'This is an informational message');

// toast با type دلخواه
await didar.toast.show('success', 'Saved', 'The form was submitted successfully');

// پاک کردن همه‌ی toastها، یا یک toast با شناسه‌اش
await didar.toast.clear();
await didar.toast.clear(toastId);
```

| متد | امضا |
| --- | --- |
| `toast.success`، `toast.error`، `toast.warning`، `toast.message`، `toast.info` | `(title, body?, options?) => Promise<void>` |
| `toast.show` | `(type, title, body?, options?) => Promise<void>` |
| `toast.clear` | `(toastId?) => Promise<void>` |

مقدار `type` در `toast.show` یکی از `error`، `exception`، `warning`، `success`، `message` و `info` است. `options` اختیاری است و این فیلدها را می‌پذیرد: `timeOut` (عدد)، `closeButton`، `progressBar` و `enableHtml` (boolean).

## Confirm message {#confirm}

اگر قبل از انجام یک کار، تأیید کاربر را با ظاهر استاندارد دیدار لازم داری، از `didar.confirm.show` استفاده کن:

```ts title="TypeScript"
const result = await didar.confirm.show('آیا از حذف این رکورد اطمینان دارید؟');

if (result.confirmed) {
  await deleteRecord();
  await didar.toast.success('Deleted', 'The record was deleted successfully');
}
```

خروجی یک object است:

```ts title="خروجی"
{
  confirmed: true
}
```

اگر کاربر دکمه‌ی تأیید را بزند، `confirmed` برابر `true` است. اگر دکمه‌ی رد را بزند یا confirm را ببندد، `confirmed` برابر `false` است.

حالت کامل‌تر، با توضیح و متن دکمه‌ها:

```ts title="TypeScript"
const result = await didar.confirm.show({
  message: 'آیا از غیرفعال کردن این اتصال اطمینان دارید؟',
  description: 'بعد از غیرفعال شدن، برای اتصال دوباره باید تنظیمات را مجددا وارد کنید.',
  yes: 'بله، غیرفعال کن',
  no: 'انصراف'
});
```

confirm با checkbox:

```ts title="TypeScript"
const result = await didar.confirm.show({
  message: 'آیا شرایط را می‌پذیرید؟',
  checkbox: 'این مورد را خواندم و قبول دارم',
  yes: 'تایید',
  no: 'انصراف'
});

if (result.confirmed && result.checkbox) {
  await submitForm();
}
```

| فیلد ورودی | نوع | توضیح |
| --- | --- | --- |
| `message` | string | متن اصلی سؤال. |
| `description` | string | توضیح زیر سؤال. |
| `yes` | string | متن دکمه‌ی تأیید. |
| `no` | string | متن دکمه‌ی رد. |
| `checkbox` | string | اگر بدهی، یک checkbox با این متن نمایش داده می‌شود و وضعیتش در `result.checkbox` برمی‌گردد. |

برای confirm لازم نیست selector داخلی popup دیدار را بدانی. این قابلیت با action مستقل `confirm.show` کار می‌کند و فقط permission `confirm:show` لازم دارد.

## Popup {#popup}

اگر صفحه‌ی تو داخل popup دیدار باز شده، popup فعلی را ببند:

```ts title="TypeScript"
await didar.popup.close(true);
```

مقدار `true` به‌عنوان نتیجه‌ی بسته شدن popup به دیدار برمی‌گردد.

```ts title="TypeScript"
// بستن همه‌ی popupها
await didar.popup.closeAll();

// وسط‌چین کردن popup بعد از تغییر اندازه‌ی محتوا، با یا بدون اندازه‌ی مشخص
await didar.popup.centerize();
await didar.popup.centerize(600, 400);
```

### باز کردن popup و بررسی باز بودن آن {#popup-open}

باز کردن popup فقط وقتی مجاز است که تیم دیدار یک **selector** مشخص را برای اپ تو فعال کرده باشد. selectorهای داخلی دیدار را حدس نزن و از مثال‌های عمومی به‌عنوان selector واقعی استفاده نکن. نمونه‌ی زیر فقط قالب استفاده را نشان می‌دهد؛ مقدار selector باید از مستندات اختصاصی همان اپ یا از تیم دیدار گرفته شود:

```ts title="TypeScript"
await didar.popup.open('<popup-selector-provided-by-didar>', {
  payload: {
    title: 'Example title'
  },
  width: 480,
  height: 240
});

const isOpen = await didar.popup.isOpen('<popup-selector-provided-by-didar>');
```

| متد | امضا |
| --- | --- |
| `popup.open` | `(selector, options?) => Promise<void>`؛ `options` شامل `payload`، `width`، `height` و `preventEscape` |
| `popup.close` | `(result?) => Promise<void>` |
| `popup.closeAll` | `() => Promise<void>` |
| `popup.centerize` | `(width?, height?) => Promise<void>` |
| `popup.isOpen` | `(selector) => Promise<boolean>` |

> [!WARNING]
> برای باز کردن popup، داشتن permission `popup:open` کافی نیست؛ selector همان popup هم باید برای اپ تو مجاز شده باشد. همین قاعده برای `popup.isOpen` هم برقرار است.

## مدیریت خطا {#errors}

همه‌ی متدهای SDK `Promise` برمی‌گردانند. خطاها را همیشه مدیریت کن:

```ts title="TypeScript"
try {
  await didar.toast.success('Saved');
  await didar.popup.close(true);
} catch (error) {
  console.error(error);
}
```

| خطا | معنی |
| --- | --- |
| `Didar marketplace access denied` | اپ تو مجاز نیست یا backend دسترسی را رد کرده است. |
| `Didar marketplace origin denied` | دامنه‌ی اپ تو در فهرست originهای مجاز نیست. |
| `Didar marketplace app denied` | مقدار `appId` معتبر نیست. |
| `Didar marketplace permission denied: popup:close` | اپ تو permission لازم را ندارد. |
| `Didar marketplace popup selector denied` | selector ارسالی برای اپ تو مجاز نیست. |
| `Didar marketplace request timed out` | دیدار در زمان مشخص پاسخ نداده است. |

## Permissionها {#permissions}

برای هر action باید permission مربوط به آن برای اپ تو فعال شده باشد؛ اگر نباشد، درخواست رد می‌شود. فرض نکن همه‌ی permissionها برای اپ تو فعال است.

| Permission | کاربرد | actionهای مرتبط |
| --- | --- | --- |
| `toast:show` | نمایش toast | `toast.show`، `toast.error`، `toast.warning`، `toast.success`، `toast.message`، `toast.info` |
| `toast:clear` | پاک کردن toast | `toast.clear` |
| `popup:open` | باز کردن popup | `popup.open` |
| `popup:close` | بستن popup فعلی | `popup.close` |
| `popup:closeAll` | بستن همه‌ی popupها | `popup.closeAll` |
| `popup:centerize` | وسط‌چین کردن popup | `popup.centerize` |
| `popup:isOpen` | بررسی باز بودن popup | `popup.isOpen` |
| `confirm:show` | نمایش confirm message داخلی دیدار | `confirm.show` |

## استفاده‌ی مستقیم از postMessage {#post-message}

نصب SDK اجباری نیست. امنیت اصلی سمت اپ دیدار و backend بررسی می‌شود؛ یعنی حتی اگر پیام را دستی بفرستی، دیدار همچنان `origin`، `appId`، `action` و permission را چک می‌کند.

```js title="JavaScript"
window.parent.postMessage({
  source: 'didar-marketplace-sdk',
  version: 1,
  id: 'request-1',
  appId: 'sample-app',
  action: 'toast.success',
  payload: {
    title: 'Saved',
    body: 'The form was submitted successfully'
  }
}, 'https://app.didar.me');
```

بهتر است پاسخ را هم مدیریت کنی:

```js title="JavaScript"
function didarRequest(action, payload) {
  const requestId = 'request-' + Date.now();
  const didarOrigin = 'https://app.didar.me';

  return new Promise(function(resolve, reject) {
    function onMessage(event) {
      if (event.origin !== didarOrigin) {
        return;
      }

      const response = event.data;

      if (!response || response.source !== 'didar-marketplace-host' || response.id !== requestId) {
        return;
      }

      window.removeEventListener('message', onMessage);

      if (response.ok) {
        resolve(response.payload);
      } else {
        reject(new Error(response.error || 'Didar request failed'));
      }
    }

    window.addEventListener('message', onMessage);

    window.parent.postMessage({
      source: 'didar-marketplace-sdk',
      version: 1,
      id: requestId,
      appId: 'sample-app',
      action: action,
      payload: payload
    }, didarOrigin);
  });
}

const result = await didarRequest('confirm.show', {
  message: 'آیا از انجام این کار اطمینان دارید؟',
  yes: 'بله',
  no: 'انصراف'
});

if (result.confirmed) {
  // ادامه‌ی عملیات
}
```

### قرارداد پیام {#protocol}

```ts title="درخواست (از iframe به دیدار)"
{
  source: 'didar-marketplace-sdk',
  version: 1,
  id: 'request-1',
  appId: 'sample-app',
  action: 'toast.success',
  payload: {
    title: 'Saved',
    body: 'The form was submitted successfully'
  }
}
```

```ts title="پاسخ موفق"
{
  source: 'didar-marketplace-host',
  version: 1,
  id: 'request-1',
  ok: true,
  payload: undefined
}
```

```ts title="پاسخ ناموفق"
{
  source: 'didar-marketplace-host',
  version: 1,
  id: 'request-1',
  ok: false,
  error: 'Didar marketplace permission denied: popup:close'
}
```

| فیلد درخواست | توضیح |
| --- | --- |
| `source` | همیشه `didar-marketplace-sdk`. |
| `version` | نسخه‌ی پروتکل؛ فعلاً `1`. |
| `id` | شناسه‌ی یکتای درخواست؛ پاسخ با همین `id` برمی‌گردد. |
| `appId` | شناسه‌ی اپ تو. |
| `action` | یکی از [actionهای پشتیبانی‌شده](#actions). |
| `payload` | ورودی action. |

| فیلد پاسخ | توضیح |
| --- | --- |
| `source` | همیشه `didar-marketplace-host`؛ پاسخی با source دیگر را نادیده بگیر. |
| `version`، `id` | همان مقادیر درخواست. |
| `ok` | موفق بودن درخواست. |
| `payload` | خروجی action (مثلاً `{ confirmed: true }` برای `confirm.show`). |
| `error` | متن خطا وقتی `ok` برابر `false` است. |

### payload هر action {#payloads}

| action | payload |
| --- | --- |
| `toast.success`، `toast.error`، `toast.warning`، `toast.message`، `toast.info` | `{ title, body?, options? }` |
| `toast.show` | `{ type, title, body?, options? }` |
| `toast.clear` | `{ toastId? }` |
| `popup.open` | `{ selector, options? }` |
| `popup.close` | `{ result? }` |
| `popup.closeAll` | ندارد |
| `popup.centerize` | `{ width?, height? }` |
| `popup.isOpen` | `{ selector }` |
| `confirm.show` | `{ message?, description?, yes?, no?, checkbox? }` |

### actionهای پشتیبانی‌شده {#actions}

```ts title="actions"
'toast.show'
'toast.error'
'toast.warning'
'toast.success'
'toast.message'
'toast.info'
'toast.clear'
'popup.open'
'popup.close'
'popup.closeAll'
'popup.centerize'
'popup.isOpen'
'confirm.show'
```

## چند iframe و instanceId {#instances}

اگر در یک صفحه‌ی دیدار چند iframe از اپ‌های مارکت‌پلیس باز باشد، دیدار برای پاسخ دادن به هر درخواست از `event.source` استفاده می‌کند؛ یعنی پاسخ هر درخواست به همان iframe فرستنده برمی‌گردد و در حالت درخواست و پاسخ ساده، پیام‌ها با هم قاطی نمی‌شوند.

با این حال، `event.source` یک شناسه‌ی پایدار برای اپ نیست. اگر در آینده یک صفحه چند instance از یک اکستنشن داشته باشد، یا دیدار بخواهد بدون درخواست قبلی به یک iframe مشخص رویداد بفرستد، یا لازم باشد lifecycle و context هر instance جداگانه مدیریت شود، از `instanceId` یا `channelId` استفاده می‌شود. اگر دیدار هنگام باز کردن اکستنشن به اپ تو `instanceId` داد، همان مقدار را نگه دار و همراه پیام‌های بعدی بفرست. این بخش برای آینده‌ی پروتکل در نظر گرفته شده است.

## نکات امنیتی {#security}

- همیشه `targetOrigin` دقیق دیدار را وارد کن؛ در production از `*` استفاده نکن.
- مقدار `appId` را درست وارد کن.
- فرض نکن همه‌ی permissionها برای اپ تو فعال است.
- اطلاعات حساس غیرضروری را داخل `payload` نفرست.
- خطاها و timeoutها را مدیریت کن.
- برای عملیات مهم، وضعیت نهایی را در backend خودت هم ذخیره کن. SDK فقط UI دیدار را کنترل می‌کند و جای کار با [API دیدار](/api-concepts) از backend را نمی‌گیرد.

## چک‌لیست شروع سریع {#checklist}

- [ ] اپ iframe خودت را بساز.
- [ ] `@didar/marketplace-sdk` را نصب کن (یا browser bundle را با تگ script اضافه کن).
- [ ] با `createDidarMarketplaceSdk` یک client بساز.
- [ ] `appId` را از دیدار بگیر و تنظیم کن.
- [ ] `targetOrigin` را روی آدرس دقیق دیدار بگذار.
- [ ] یک toast تستی نمایش بده.
- [ ] اگر صفحه‌ات داخل popup باز می‌شود، `didar.popup.close` را تست کن.
- [ ] خطاهای permission و timeout را مدیریت کن.

## هنوز مستند نشده {#open}

> [!WARNING]
> این موارد هنوز در منابع تیم فنی نیامده‌اند و در این داک حدس زده نمی‌شوند: `appId`ی که SDK می‌خواهد دقیقاً کدام شناسه‌ی Developer Hub است (Client ID، شناسه‌ی عمومی اپ یا شناسه‌ی دیگری)، اینکه permissionهای SDK و selectorهای مجاز popup کجا و چطور برای یک اپ فعال می‌شوند، رابطه‌ی ID یک [Custom modal](/custom-modals) با selector در `popup.open`، و آدرس نهایی CDN.

## بعد از این بخوان {#read-next}

- [درباره‌ی Custom UI](/custom-ui-extensions)
- [Custom modal](/custom-modals)
- [Custom panel](/custom-panels)
