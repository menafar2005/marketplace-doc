// همگام‌سازی مشخصات OpenAPI دیدار از «Didar technical doc» (developers.didar.me) → spec/didar/*.json
//
// بدنه‌ی endpointهای پروکسی دقیقاً بدنه‌ی OpenAPI دیدار است؛ این اسکریپت توضیح کامل هر پراپرتی
// (شامل «وابستگی‌ها»، «شرایط ارسال»، «مقادیر مجاز»)، قواعد و محدودیت‌ها و نمونه پاسخ را بدون هیچ خلاصه‌سازی
// ذخیره می‌کند. خروجی در ریپو commit می‌شود تا build به شبکه وابسته نباشد.
//
//   node scripts/sync-didar.mjs          # دانلود و بازنویسی spec/didar/
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "https://didar-crm.mintlify.site";

export const PAGES = [
  "Update-Deal", "Get-Deal-By-Id", "Update-Case", "Get-Person-By-Id", "Update-Person", "Get-Company-By-Id", "Update-Company",
  "Search-Activity", "Get-Activity-By-Id", "Create-Activity", "Update-Activity", "Create-Note", "Update-Note",
  "User-List", "Activity-Type", "Lost-Reasons", "List-Deal-Pipelines", "List-Case-Pipelines", "Deal-Labels", "Case-Labels",
];

const unescapeMd = (s) => s.replace(/\\([\[\]_*`])/g, "$1");
const PARAM_RE = /^\*\*(.+?)\*\*(?: `([^`]*)`)?( \*required\*)?\s*$/;
const SECTION_TITLES = new Set(["وابستگی‌ها", "شرایط ارسال", "مقادیر مجاز"]);

/** متن Markdown صفحه → ساختار */
export function parseDidarPage(md, page) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = { page, title: "", heading: "", intro: "", http: "", params: [], rules: [], related: [], requestBody: null, curl: null, response: null };
  let i = 0;
  const next = () => lines[i++];

  // عنوان انگلیسی و عنوان فارسی + توضیح
  while (i < lines.length && !lines[i].startsWith("# ")) i++;
  out.title = lines[i++].slice(2).trim();
  const intro = [];
  let mode = "head";
  let section = null; // نام بخش ## جاری
  let param = null;
  let sec = null;
  let fence = null;
  const flushSec = () => {
    if (sec && param) param.sections.push({ title: sec.title, md: sec.lines.join("\n").trim() });
    sec = null;
  };
  const flushParam = () => {
    flushSec();
    if (param) {
      param.description = param.lines.join("\n").trim();
      delete param.lines;
      out.params.push(param);
    }
    param = null;
  };

  for (; i < lines.length; ) {
    const line = next();
    if (fence) {
      if (line.startsWith("```")) {
        const body = fence.lines.join("\n");
        const info = fence.info;
        if (/Request Body \(JSON\)/.test(info)) out.requestBody = body;
        else if (/Request Body \(cURL\)/.test(info)) out.curl = body;
        else if (/Request Response \(JSON\)/.test(info)) out.response = body;
        else if (info.startsWith("http") && !out.http) out.http = body.trim();
        fence = null;
      } else fence.lines.push(line);
      continue;
    }
    if (line.startsWith("```")) {
      fence = { info: line.slice(3).trim(), lines: [] };
      continue;
    }
    if (line.startsWith("## ")) {
      flushParam();
      section = line.slice(3).trim();
      if (!out.heading) {
        out.heading = section;
        mode = "intro";
      } else mode = "section";
      continue;
    }
    if (section === "بدنه درخواست") {
      const m = PARAM_RE.exec(line);
      const bold = /^\*\*(.+)\*\*\s*$/.exec(line);
      if (line.trim() === "**property**") continue;
      if (m && !SECTION_TITLES.has(m[1])) {
        flushParam();
        param = { name: unescapeMd(m[1]), type: m[2] || "", required: !!m[3], lines: [], sections: [] };
        continue;
      }
      if (bold && param && SECTION_TITLES.has(bold[1])) {
        flushSec();
        sec = { title: bold[1], lines: [] };
        continue;
      }
      if (param) (sec ? sec.lines : param.lines).push(line);
      continue;
    }
    if (section === "قواعد و محدودیت‌ها") {
      const m = /^\* (.*)$/.exec(line);
      if (m) out.rules.push(m[1]);
      continue;
    }
    if (section === "لینک ها مرتبط") {
      const m = /^\* (.*)$/.exec(line);
      if (m) out.related.push(m[1]);
      continue;
    }
    if (mode === "intro" && section === out.heading) intro.push(line);
  }
  flushParam();
  out.intro = intro.join("\n").replace(/‎|‎/g, "").trim();

  // پراپرتی تکراری (مثلاً آرایه + نوع عضو) را ادغام کن
  const seen = new Map();
  out.params = out.params.filter((p) => {
    if (seen.has(p.name)) {
      const first = seen.get(p.name);
      if (!first.sections.length && p.sections.length) first.sections = p.sections;
      return false;
    }
    seen.set(p.name, p);
    return true;
  });
  return out;
}

async function main() {
  mkdirSync(join(root, "spec/didar"), { recursive: true });
  for (const page of PAGES) {
    const res = await fetch(`${SOURCE}/${page}.md`);
    if (!res.ok) throw new Error(`${page}: HTTP ${res.status}`);
    const parsed = parseDidarPage(await res.text(), page);
    parsed.source = `https://developers.didar.me/${page}`;
    writeFileSync(join(root, `spec/didar/${page}.json`), JSON.stringify(parsed, null, 2) + "\n");
    console.log(`${page}: ${parsed.params.length} params, ${parsed.rules.length} rules, response ${parsed.response ? "yes" : "no"}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
