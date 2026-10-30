# Didar Developers: داک فنی مارکت‌پلیس + MCP دیدار

سایت مستندات توسعه‌دهنده‌ی مارکت‌پلیس دیدار و سرور MCP آن، روی **یک Cloudflare Worker** (`didar-developers-docs`).
این ریپو **تنها منبع** داک است: هر push روی `main` داک را دوباره می‌سازد، یک Worker Version جدید می‌گیرد و deploy می‌شود.

| آدرس | چیست |
| --- | --- |
| `/` و `/<slug>` | سایت داک (HTML، راست‌چین، تم روشن/تیره) |
| `/<slug>.md` | همان صفحه به Markdown |
| `/llms.txt`، `/llms-full.txt` | فهرست و نسخه‌ی کامل برای ابزارهای AI |
| `/mcp` | سرور MCP (Streamable HTTP، بدون احراز هویت) |
| `/version` | commit و زمان build نسخه‌ی در حال اجرا |

## ساختار ریپو

```
content/*.md          صفحه‌های راهنما و مرجع (frontmatter: title, section, order, lead)
templates/<lang>/     تمپلیت‌های کد صفحه‌ها؛ یک پروژه‌ی نمونه‌ی کامل به Node.js، Python، PHP و C#
public/images/        تصویر ساختار پلاگین، اسکرین‌شات‌های اکستنشن‌ها و فلوچارت‌ها (Static Assets در Cloudflare)
spec/endpoints.mjs    مشخصات همه‌ی endpointها (نصب، توکن، پروکسی)؛ صفحه‌های API و ابزار get_api_spec از همین ساخته می‌شوند
spec/platform.json    scopeها، locationها، خطاها (منبع list_scopes، list_extensions، list_error_codes)
scripts/build.mjs     content + spec  →  src/generated/content.js
src/                  Worker: سایت، MCP، جستجو، scaffold و validate
```

### منبع محتوا

- محتوای فنی از بسته‌ی مستندات رسمی Marketplace (zip) گرفته شده و منبع حقیقت است.
- رفتار Developer Hub (ساخت و ویرایش اپ، scopeها، انواع اکستنشن، ظرفیت Locationها، Refresh کردن Client secret، Change to live و حذف) از یوزراستوری‌های پروژه و دیزاین Figma آن گرفته شده است.
- بدنه‌ی endpointهای پروکسی دقیقاً از API reference دیدار (OpenAPI) است؛ نام، casing، نوع و الزام هر فیلد در `spec/endpoints.mjs` با آن تطبیق داده شده.
- مقدار نامعلوم هرگز حدس زده نمی‌شود؛ صفحه‌هایی که موضوع بازی دارند بخش «هنوز مستند نشده» دارند.

### ساختار داک

ساختار و شیوه‌ی توضیح بخش راهنما از داک توسعه‌دهنده‌ی Pipedrive الگو گرفته شده؛ محتوا فقط رفتار واقعی مارکت‌پلیس دیدار است.

- **راهنما:** معرفی (معرفی، ساختار پلاگین، مارکت‌پلیس چطور کار می‌کند) ← شروع ساخت (ساخت اولین پلاگین، MCP، محیط تست) ← Developer Hub (Developer Hub، ثبت پلاگین، Client ID و secret) ← نصب و احراز هویت (مرور، جریان نصب، تکمیل نصب، state، Runtime Token، Scopeها) ← اکستنشن‌ها (مرور، Links، JSON modal، JSON panel، Custom UI، Custom modal، Custom panel، App settings) ← انتشار و امنیت.
- **مدل ذهنی:** سه صفحه‌ی معرفی تصویر کلی را می‌دهند و هر بخش به صفحه‌ی جزئیاتش لینک دارد. «ساخت اولین پلاگین» قدم‌به‌قدم است و شماره‌ی قدم‌هایش همان شماره‌های تصویر ساختار پلاگین است.
- **لحن:** هر صفحه اول توضیح می‌دهد موضوع چیست، چرا وجود دارد و کی لازمش داری، بعد سراغ فیلدها و درخواست‌ها می‌رود (الگو: داک Pipedrive). اصطلاح «پلاگین» همه‌جا به یک معنی است (در Developer Hub: App).
- **الگوی صفحه‌ی هر قابلیت:** چیست؟ ← کجای دیدار دیده می‌شود ← چطور کار می‌کند ← افزودن در Developer Hub (جدول فیلد) ← تمپلیت کد ← هنوز مستند نشده ← بعد از این بخوان.
- **تمپلیت‌ها:** نشانگر `<!--TEMPLATE:name-->` در صفحه موقع build با یک بلوک کد چهارزبانه از `templates/` عوض می‌شود (فهرست در `scripts/lib/templates.mjs`). همه‌ی تمپلیت‌ها یک پروژه‌اند و از نام‌های مشترک استفاده می‌کنند؛ CI همه را در هر چهار زبان کامپایل یا lint می‌کند.
- **تصویر ساختار پلاگین:** `public/images/anatomy/plugin-anatomy.png` از `scripts/anatomy.html` ساخته می‌شود: `node scripts/render-anatomy.cjs FONT_DIR` (پوشه‌ای با فایل‌های Vazirmatn-*.ttf؛ Playwright لازم است).
- **مرجع API:** مفاهیم پایه (درباره، درخواست‌ها، پاسخ‌ها، کدهای وضعیت) ← نصب و اجرا ← داده‌ی دیدار.
- **تصویرها:** اسکرین‌شات‌های `public/images/extensions` از صفحه‌ی extensions فایل Figma «avangard» ساخته شده‌اند؛ فقط اکستنشن واقعی است و بقیه‌ی صفحه skeleton شده. برای ساخت دوباره: `python3 scripts/extension-skeleton.py SRC.png OUT.png "x0,y0,x1,y1" [--crop …] [--dim]` (`--dim` برای صفحه‌هایی که اکستنشن modal است) و سپس تبدیل به WebP.
- **فلوچارت‌ها:** تصویرهای `public/images/flows` (انگلیسی، به سبک فلوچارت‌های Pipedrive) با `python3 scripts/flowcharts.py DIR` و `node scripts/render-flowcharts.cjs DIR public/images/flows` از نو ساخته می‌شوند (Playwright لازم است).
- slugهای قدیمی با 301 به صفحه‌ی جدید می‌روند (`MOVED` در `src/worker.js`).

## ویرایش داک

1. فایل `content/*.md` یا `spec/endpoints.mjs` را تغییر بده.
2. `npm test` (build + تست صفحه‌ها، لینک‌ها، نمونه JSONها و پروتکل MCP).
3. push روی `main`. حدود یک دقیقه بعد نسخه‌ی جدید زنده است؛ `/version` همان commit را نشان می‌دهد.

اجرای محلی: `npm install && npm run dev`.

## Deploy و نسخه‌بندی

**production فقط از شاخه‌ی `main` deploy می‌شود.** `.github/workflows/deploy.yml` روی هر push به `main` اجرا می‌شود (روی PRها فقط تست اجرا می‌شود و شاخه‌های دیگر هرگز deploy نمی‌کنند): `npm ci` ← `npm test` ← `wrangler deploy --tag <sha>`.
هر deploy یک **Version** جدید در Cloudflare است (Workers › didar-developers-docs › Deployments)؛ برای rollback همان‌جا یا `npx wrangler rollback`.

**یک‌بار** در GitHub › Settings › Secrets and variables › Actions این دو secret را بساز:

| Secret | مقدار |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | توکن با دسترسی *Workers Scripts: Edit* |
| `CLOUDFLARE_ACCOUNT_ID` | شناسه‌ی حساب Cloudflare |

## اتصال MCP

```bash
claude mcp add --transport http didar https://<worker-url>/mcp
```

ابزارها: `search_docs`، `list_pages`، `get_page`، `get_plugin_anatomy`، `get_api_spec`، `list_scopes`، `list_extensions`، `list_error_codes`، `scaffold_plugin`، `validate_plugin`؛ به‌علاوه‌ی resourceهای `didar-docs://<slug>` و prompt `build_plugin`.
MCP فقط محتوای همین ریپو را سرو می‌کند و هیچ داده‌ی CRM یا secretی را لمس نمی‌کند.
