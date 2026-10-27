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
spec/endpoints.mjs    مشخصات endpointهای پروکسی؛ صفحه‌های API و ابزار get_api_spec از همین ساخته می‌شوند
spec/platform.json    scopeها، locationها، خطاها (منبع list_scopes، list_extensions، list_error_codes)
scripts/build.mjs     content + spec  →  src/generated/content.js
src/                  Worker: سایت، MCP، جستجو، scaffold و validate
```

### منبع محتوا

- محتوای فنی از بسته‌ی مستندات رسمی Marketplace (zip) گرفته شده و منبع حقیقت است.
- بدنه‌ی endpointهای پروکسی دقیقاً از API reference دیدار (OpenAPI) است؛ نام، casing، نوع و الزام هر فیلد در `spec/endpoints.mjs` با آن تطبیق داده شده.
- مقدار نامعلوم هرگز حدس زده نمی‌شود (صفحه‌های «حساب و محیط تست» و «ثبت و مدیریت اپ» بخش «هنوز مستند نشده» دارند).

## ویرایش داک

1. فایل `content/*.md` یا `spec/endpoints.mjs` را تغییر بده.
2. `npm test` (build + تست صفحه‌ها، لینک‌ها، نمونه JSONها و پروتکل MCP).
3. push روی `main`. حدود یک دقیقه بعد نسخه‌ی جدید زنده است؛ `/version` همان commit را نشان می‌دهد.

اجرای محلی: `npm install && npm run dev`.

## Deploy و نسخه‌بندی

`.github/workflows/deploy.yml` روی هر push به `main` اجرا می‌شود: `npm ci` ← `npm test` ← `wrangler deploy --tag <sha>`.
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
