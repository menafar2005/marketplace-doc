// بلوک کد (هایلایت + تب‌ها). هم در build و هم در Worker استفاده می‌شود؛ بدون وابستگی.
export const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------------------------------------------------------------------------
// Syntax highlighting (سبک بلوک کد Claude: کامنت سبز، رشته نارنجی، پارامتر/کلید آبی، متغیر bold)
// ---------------------------------------------------------------------------
const KW = {
  python: "import from def return if else elif for in not and or None True False class with as await async try except raise print lambda",
  javascript: "const let var function return await async new if else for of import from export class null true false undefined typeof throw try catch",
  typescript: "const let var function return await async new if else for of import from export class null true false undefined typeof unknown string number throw try catch",
  go: "package import func return if else for range nil true false var defer type struct panic",
  php: "echo new array true false null function return if else foreach as",
  ruby: "require do end if else elsif true false nil puts def class return",
  java: "import public class static void new throws try catch return String final var null true false",
  csharp: "using var new await return public class static string null true false async",
  json: "true false null",
  bash: "",
  text: "",
};
const ALIAS = { js: "javascript", ts: "typescript", sh: "bash", shell: "bash", curl: "bash", http: "text", py: "python", cs: "csharp", rb: "ruby", markdown: "text", yaml: "text", env: "bash" };
const HASH_COMMENT = new Set(["bash", "python", "ruby", "php", "text"]);
const SLASH_COMMENT = new Set(["javascript", "typescript", "go", "php", "java", "csharp", "json"]);
const VARS = new Set(["bash", "php"]);

const kwSets = Object.fromEntries(Object.entries(KW).map(([k, v]) => [k, new Set(v.split(" ").filter(Boolean))]));

export const normalizeLang = (l) => ALIAS[l] || l || "text";

function highlight(code, langIn) {
  const lang = normalizeLang(langIn);
  const parts = [];
  if (SLASH_COMMENT.has(lang)) parts.push(String.raw`(?<c>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`);
  if (HASH_COMMENT.has(lang)) parts.push(String.raw`(?<c2>(?:^|(?<=\s))#[^\n]*)`);
  const str = [];
  if (["python", "csharp", "java"].includes(lang)) str.push(String.raw`"""[\s\S]*?"""`);
  if (lang !== "text") str.push(String.raw`"(?:[^"\\\n]|\\.)*"`);
  if (lang === "bash") str.push(String.raw`'[^']*'`);
  else if (["python", "javascript", "typescript", "php", "ruby"].includes(lang)) str.push(String.raw`'(?:[^'\\\n]|\\.)*'`);
  if (["javascript", "typescript", "go"].includes(lang)) str.push("`[^`]*`");
  if (str.length) parts.push(`(?<s>${str.join("|")})`);
  if (VARS.has(lang)) parts.push(String.raw`(?<v>\$\{?[A-Za-z_]\w*\}?)`);
  parts.push(String.raw`(?<n>-?\b\d+(?:\.\d+)?\b)`);
  parts.push(String.raw`(?<w>[A-Za-z_][\w]*)`);
  const re = new RegExp(parts.join("|"), "gm");
  const kw = kwSets[lang] || kwSets.text;
  let out = "";
  let last = 0;
  for (const m of code.matchAll(re)) {
    out += escapeHtml(code.slice(last, m.index));
    const g = m.groups;
    const t = m[0];
    let cls = null;
    if (g.c !== undefined || g.c2 !== undefined) cls = "tk-c";
    else if (g.s !== undefined) cls = /^\s*:/.test(code.slice(m.index + t.length)) && lang === "json" ? "tk-k" : "tk-s";
    else if (g.v !== undefined) cls = "tk-v";
    else if (g.n !== undefined) cls = "tk-n";
    else if (g.w !== undefined) {
      if (lang === "bash" && t === "curl") cls = "tk-cmd";
      else if (kw.has(t)) cls = "tk-kw";
    }
    out += cls ? `<span class="${cls}">${escapeHtml(t)}</span>` : escapeHtml(t);
    last = m.index + t.length;
  }
  return out + escapeHtml(code.slice(last));
}

const COPY_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg>';
const CHECK_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/** بلوک کد تب‌دار: items = [{label, lang, code}] */
export function codeTabs(items, { group = "" } = {}) {
  const tabs = items
    .map(
      (it, i) =>
        `<button class="cb-tab" type="button" role="tab" aria-selected="${i === 0}" data-label="${escapeHtml(it.label)}">${escapeHtml(it.label)}</button>`
    )
    .join("");
  const panels = items
    .map(
      (it, i) =>
        `<pre class="cb-panel" role="tabpanel" data-label="${escapeHtml(it.label)}"${i ? " hidden" : ""} tabindex="0"><code class="language-${escapeHtml(normalizeLang(it.lang))}">${highlight(it.code.replace(/\n$/, ""), it.lang)}</code></pre>`
    )
    .join("");
  return (
    `<figure class="cb" dir="ltr"${group ? ` data-group="${escapeHtml(group)}"` : ""}>` +
    `<div class="cb-bar"><div class="cb-tabs" role="tablist">${tabs}</div>` +
    `<button class="cb-copy" type="button" aria-label="کپی کد"><span class="i-copy">${COPY_ICON}</span><span class="i-done">${CHECK_ICON}</span></button></div>` +
    `<div class="cb-body">${panels}</div></figure>`
  );
}

