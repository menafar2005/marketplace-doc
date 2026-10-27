// تولید صفحه‌های مرجع API (Markdown و HTML) از spec/endpoints.mjs
import { escapeHtml, codeFigure } from "./markdown.mjs";

const METHOD_CLASS = { GET: "m-get", POST: "m-post", PUT: "m-put", PATCH: "m-put", DELETE: "m-delete" };

export const scopeText = (scope) =>
  [scope.read && `خواندن: ${scope.read}`, scope.write && `نوشتن: ${scope.write}`].filter(Boolean).join(" · ");

const codes = (names) => names.split(" یا ").map((n) => `<code>${escapeHtml(n)}</code>`).join(" یا ");
const scopeHtml = (scope) =>
  [scope.read && `خواندن: ${codes(scope.read)}`, scope.write && `نوشتن: ${codes(scope.write)}`].filter(Boolean).join(" · ");
const didarHtml = (d) => {
  const [name, op] = d.split(" — ");
  return op ? `<code>${escapeHtml(op)}</code> (${escapeHtml(name)})` : `<code>${escapeHtml(d)}</code>`;
};

const IN_FA = { path: "path", body: "body", query: "query", header: "header" };

function paramsMarkdown(params, bodyNote) {
  if (!params.length) return `${bodyNote || "این endpoint پارامتر ندارد."}\n`;
  const rows = params.map(
    ([n, where, type, req, desc]) =>
      `| \`${n}\` | ${IN_FA[where]} | ${type} | ${req ? "الزامی" : "اختیاری"} | ${desc.replace(/\|/g, "\\|")} |`
  );
  return [
    ...(bodyNote ? [bodyNote, ""] : []),
    "| نام | محل | نوع | الزام | توضیح |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}

export function endpointMarkdown(ep) {
  const lines = [
    `## ${ep.title} {#${ep.id}}`,
    "",
    `\`${ep.method} ${ep.path}\``,
    "",
    ep.summary,
    "",
    `- scope لازم: ${scopeText(ep.scope)}`,
  ];
  if (ep.context) lines.push(`- Runtime Context: ${ep.context}`);
  if (ep.didar) lines.push(`- معادل در API دیدار: ${ep.didar}`);
  lines.push("", "### پارامترها", "", paramsMarkdown(ep.params, ep.bodyNote));
  lines.push("### نمونه درخواست", "", "```bash title=\"cURL\"", ep.request, "```", "");
  lines.push("### نمونه پاسخ موفق", "", "```json title=\"Response 200\"", ep.response, "```", "");
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

function paramsHtml(params, bodyNote) {
  if (!params.length) return `<p class="muted">${escapeHtml(bodyNote || "این endpoint پارامتر ندارد.")}</p>`;
  const rows = params
    .map(([n, where, type, req, desc]) => {
      const depth = Math.max(0, n.split(".").length - 1);
      return (
        `<div class="param" style="--depth:${Math.min(depth, 3)}"><div class="param-head" dir="ltr">` +
        `<code class="param-name">${escapeHtml(n)}</code>` +
        `<span class="param-type">${escapeHtml(type)} · ${IN_FA[where]}</span>` +
        `<span class="${req ? "req" : "opt"}">${req ? "الزامی" : "اختیاری"}</span></div>` +
        `<p>${escapeHtml(desc)}</p></div>`
      );
    })
    .join("");
  return (bodyNote ? `<p class="muted">${escapeHtml(bodyNote)}</p>` : "") + `<div class="params">${rows}</div>`;
}

export function endpointHtml(ep) {
  const methodClass = METHOD_CLASS[ep.method] || "m-get";
  return (
    `<section class="endpoint" id="${ep.id}">` +
    `<div class="endpoint-main">` +
    `<h2>${escapeHtml(ep.title)}</h2>` +
    `<div class="ep-line" dir="ltr"><span class="m ${methodClass}">${ep.method}</span><code>${escapeHtml(ep.path)}</code></div>` +
    `<p>${escapeHtml(ep.summary)}</p>` +
    `<p class="ep-meta">scope لازم — ${scopeHtml(ep.scope)}` +
    (ep.context ? `<br>${escapeHtml(ep.context)}` : "") +
    (ep.didar ? `<br>معادل در API دیدار: ${didarHtml(ep.didar)}` : "") +
    `</p>` +
    `<h3>پارامترها</h3>` +
    paramsHtml(ep.params, ep.bodyNote) +
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
    codeFigure(ep.request, 'bash title="cURL"') +
    codeFigure(ep.response, 'json title="Response 200"') +
    `</aside></section>`
  );
}

export function groupHtml(group) {
  return group.endpoints.map(endpointHtml).join("");
}

export function groupToc(group) {
  return group.endpoints.map((ep) => ({ id: ep.id, text: ep.title }));
}
