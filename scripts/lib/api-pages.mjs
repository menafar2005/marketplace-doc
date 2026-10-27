// تولید صفحه‌های مرجع API (Markdown و HTML) از spec/endpoints.mjs
import { Marked } from "marked";
import { escapeHtml, codeTabs } from "./markdown.mjs";
import { samplesFor } from "./samples.mjs";
import { groups, baseUrl } from "../../spec/endpoints.mjs";

const METHOD_CLASS = { GET: "m-get", POST: "m-post", PUT: "m-put", PATCH: "m-put", DELETE: "m-delete" };

export const scopeText = (scope) =>
  [scope.read && `خواندن: ${scope.read}`, scope.write && `نوشتن: ${scope.write}`].filter(Boolean).join(" · ");

const codes = (names) => names.split(" یا ").map((n) => `<code>${escapeHtml(n)}</code>`).join(" یا ");
const scopeHtml = (scope) =>
  [scope.read && `خواندن: ${codes(scope.read)}`, scope.write && `نوشتن: ${codes(scope.write)}`].filter(Boolean).join(" · ");

// ---- لینک‌های متن‌های Didar: صفحه‌ی معادل پروکسی اگر هست، وگرنه مستندات Didar ----
const proxyByDidarPage = new Map();
for (const g of groups) for (const e of g.endpoints) if (e.didarPage) proxyByDidarPage.set(e.didarPage.toLowerCase(), `/${g.page}#${e.id}`);

function linkTarget(href) {
  const m = /^https:\/\/developers\.didar\.me\/([^#?]+?)(?:\.md)?$/.exec(href);
  if (!m) return { href, external: /^https?:/.test(href) };
  const internal = proxyByDidarPage.get(m[1].toLowerCase());
  return internal ? { href: internal, external: false } : { href: `https://developers.didar.me/${m[1]}`, external: true };
}

const fragment = new Marked({ gfm: true });
fragment.use({
  renderer: {
    link({ href, tokens }) {
      const t = linkTarget(href);
      const text = this.parser.parseInline(tokens);
      return t.external
        ? `<a href="${escapeHtml(t.href)}" target="_blank" rel="noopener noreferrer" class="ext">${text}</a>`
        : `<a href="${escapeHtml(t.href)}">${text}</a>`;
    },
  },
});
const mdHtml = (md) => fragment.parse(md || "");

// ---- درخت پارامترها: Deal ← Deal.Id ...، DealItems[] ← DealItems[].ProductId ----
export function buildTree(params) {
  const roots = [];
  const byName = new Map();
  for (const p of params) {
    const node = { ...p, children: [] };
    byName.set(p.name, node);
    const i = p.name.lastIndexOf(".");
    const parent = p.in === "body" && i > 0 ? byName.get(p.name.slice(0, i)) : null;
    (parent ? parent.children : roots).push(node);
  }
  return roots;
}
const shortName = (n) => n.slice(n.lastIndexOf(".") + 1);
const countAll = (node) => node.children.reduce((s, c) => s + 1 + countAll(c), 0);

function paramHtml(node, depth, epId) {
  const kids = node.children.length;
  const secs = (node.sections || [])
    .map((s) => `<div class="param-sec"><p class="param-sec-title">${escapeHtml(s.title)}</p>${mdHtml(s.md)}</div>`)
    .join("");
  const children = kids
    ? `<details class="children"${depth === 0 ? " open" : ""}><summary><span class="when-closed">نمایش پارامترهای فرزند</span><span class="when-open">پنهان‌کردن پارامترهای فرزند</span><span class="count">${countAll(node)}</span></summary>` +
      `<div class="children-list">${node.children.map((c) => paramHtml(c, depth + 1, epId)).join("")}</div></details>`
    : "";
  return (
    `<div class="param" id="${epId}--${escapeHtml(node.name.replace(/[^\w.\[\]-]/g, ""))}">` +
    `<div class="param-head" dir="ltr"><code class="param-name">${escapeHtml(depth === 0 ? node.name : shortName(node.name))}</code>` +
    `<span class="param-type">${escapeHtml(node.type || "")}</span>` +
    `${node.required ? '<span class="req">الزامی</span>' : ""}</div>` +
    `<div class="param-body">${mdHtml(node.description)}${secs}${children}</div></div>`
  );
}

function paramsHtml(ep) {
  if (!ep.params.length) return `<p class="muted">${escapeHtml(ep.bodyNote)}</p>`;
  const path = ep.params.filter((p) => p.in === "path");
  const body = ep.params.filter((p) => p.in === "body");
  let out = "";
  if (path.length) {
    out += `<h3>پارامتر مسیر</h3><div class="params">${buildTree(path).map((n) => paramHtml(n, 1, ep.id)).join("")}</div>`;
  }
  if (body.length) {
    out += `<h3>پارامترهای بدنه</h3><div class="params">${buildTree(body).map((n) => paramHtml(n, 0, ep.id)).join("")}</div>`;
  } else if (ep.bodyNote) {
    out += `<p class="muted">${escapeHtml(ep.bodyNote)}</p>`;
  }
  return out;
}

const COPY_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg>';
const CHECK_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

export function endpointHtml(ep) {
  const methodClass = METHOD_CLASS[ep.method] || "m-get";
  const url = baseUrl + ep.path;
  const doc = ep.didarDoc;
  const intro = doc
    ? (doc.heading !== ep.title ? `<p class="didar-heading">${escapeHtml(doc.heading)}</p>` : "") + mdHtml(doc.intro)
    : `<p>${escapeHtml(ep.summary)}</p>`;
  const rules = doc && doc.rules.length ? `<h3>قواعد و محدودیت‌ها</h3><ul>${doc.rules.map((r) => `<li>${fragment.parseInline(r)}</li>`).join("")}</ul>` : "";
  const related = doc && doc.related.length ? `<h3>لینک‌های مرتبط</h3><ul>${doc.related.map((r) => `<li>${fragment.parseInline(r)}</li>`).join("")}</ul>` : "";
  return (
    `<section class="endpoint" id="${ep.id}">` +
    `<div class="endpoint-main">` +
    `<h2>${escapeHtml(ep.title)}</h2>` +
    `<div class="ep-url" dir="ltr"><span class="m ${methodClass}">${ep.method}</span>` +
    `<code class="ep-path">${escapeHtml(url).replace(/(\{[^}]+\})/g, '<b>$1</b>')}</code>` +
    `<button class="ep-copy" type="button" data-copy="${escapeHtml(url)}" aria-label="کپی آدرس endpoint"><span class="i-copy">${COPY_ICON}</span><span class="i-done">${CHECK_ICON}</span></button></div>` +
    intro +
    `<div class="ep-facts"><p><strong>scope لازم</strong> ${scopeHtml(ep.scope)}</p>` +
    (ep.context ? `<p><strong>Runtime Context</strong> ${escapeHtml(ep.context)}</p>` : "") +
    (ep.summary && doc ? `<p><strong>در مارکت‌پلیس</strong> ${escapeHtml(ep.summary)}</p>` : "") +
    (ep.didar ? `<p><strong>معادل در API دیدار</strong> <code>${escapeHtml(doc.operation)}</code> (<a href="${escapeHtml(doc.source)}" target="_blank" rel="noopener noreferrer" class="ext">${escapeHtml(ep.didar.split(" — ")[0])}</a>)</p>` : "") +
    `</div>` +
    paramsHtml(ep) +
    rules +
    related +
    `<h3>خطاهای ممکن</h3>` +
    `<div class="table-wrap"><table><thead><tr><th scope="col">کد HTTP</th><th scope="col">معنی</th></tr></thead><tbody>` +
    `<tr><td><code>400</code></td><td>بدنه یا پارامتر نامعتبر</td></tr>` +
    `<tr><td><code>401</code></td><td>Runtime Token نامعتبر یا منقضی</td></tr>` +
    `<tr><td><code>403</code></td><td>scope یا entity مجاز نیست (<code>PROXY_ACCESS_DENIED</code>، <code>RUNTIME_ENTITY_TYPE_DENIED</code>، <code>RUNTIME_ENTITY_ACCESS_DENIED</code>)</td></tr>` +
    `<tr><td><code>404</code></td><td>منبع پیدا نشد</td></tr>` +
    `<tr><td><code>502</code></td><td>خطا یا timeout در دیدار (<code>DIDAR_PROXY_*</code>)</td></tr>` +
    `</tbody></table></div>` +
    `</div>` +
    `<aside class="endpoint-code" aria-label="نمونه کد">` +
    codeTabs(samplesFor(ep)) +
    codeTabs([{ label: "200 OK", lang: "json", code: ep.response }]) +
    `</aside></section>`
  );
}

export function groupHtml(group) {
  return group.endpoints.map(endpointHtml).join("");
}

export function groupToc(group) {
  return group.endpoints.map((ep) => ({ id: ep.id, text: ep.title }));
}

// ---------------------------------------------------------------------------
// Markdown (برای /<slug>.md، llms-full.txt و MCP)
// ---------------------------------------------------------------------------
function paramMd(node, depth) {
  const pad = "  ".repeat(depth);
  const head = `${pad}- \`${depth === 0 || node.in === "path" ? node.name : shortName(node.name)}\` (${node.type || "—"}${node.required ? "، الزامی" : ""})`;
  const indent = (t) => t.split("\n").map((l) => (l ? `${pad}  ${l}` : l)).join("\n");
  const desc = node.description ? `${head}: ${node.description.replace(/\n+/g, " ")}` : head;
  const secs = (node.sections || []).map((s) => indent(`**${s.title}**\n\n${s.md}`)).join("\n\n");
  const kids = node.children.map((c) => paramMd(c, depth + 1)).join("\n");
  return [desc, secs, kids].filter(Boolean).join("\n");
}

export function endpointMarkdown(ep) {
  const doc = ep.didarDoc;
  const lines = [`## ${ep.title} {#${ep.id}}`, "", `\`${ep.method} ${baseUrl}${ep.path}\``, ""];
  lines.push(doc ? `${doc.heading}\n\n${doc.intro}` : ep.summary, "");
  lines.push(`- scope لازم: ${scopeText(ep.scope)}`);
  if (ep.context) lines.push(`- Runtime Context: ${ep.context}`);
  if (doc && ep.summary) lines.push(`- در مارکت‌پلیس: ${ep.summary}`);
  if (ep.didar) lines.push(`- معادل در API دیدار: ${doc.operation} (${doc.source})`);
  lines.push("");
  const pathP = ep.params.filter((p) => p.in === "path");
  const bodyP = ep.params.filter((p) => p.in === "body");
  if (pathP.length) lines.push("### پارامتر مسیر", "", buildTree(pathP).map((n) => paramMd(n, 0)).join("\n"), "");
  if (bodyP.length) lines.push("### پارامترهای بدنه", "", buildTree(bodyP).map((n) => paramMd(n, 0)).join("\n"), "");
  else if (ep.bodyNote) lines.push(ep.bodyNote, "");
  if (doc && doc.rules.length) lines.push("### قواعد و محدودیت‌ها", "", ...doc.rules.map((r) => `- ${r}`), "");
  if (doc && doc.related.length) lines.push("### لینک‌های مرتبط", "", ...doc.related.map((r) => `- ${r}`), "");
  lines.push("### نمونه درخواست", "", '```bash title="cURL"', ep.request, "```", "");
  lines.push("### نمونه پاسخ موفق", "", '```json title="200 OK"', ep.response, "```", "");
  lines.push("### خطاهای ممکن", "", "| کد HTTP | معنی |", "| --- | --- |",
    "| 400 | بدنه یا پارامتر نامعتبر |",
    "| 401 | Runtime Token نامعتبر یا منقضی |",
    "| 403 | scope یا entity مجاز نیست (`PROXY_ACCESS_DENIED`، `RUNTIME_ENTITY_TYPE_DENIED`، `RUNTIME_ENTITY_ACCESS_DENIED`) |",
    "| 404 | منبع پیدا نشد |",
    "| 502 | خطا یا timeout در دیدار (`DIDAR_PROXY_*`) |",
    "");
  return lines.join("\n");
}

export function groupMarkdown(group) {
  return group.endpoints.map(endpointMarkdown).join("\n");
}
