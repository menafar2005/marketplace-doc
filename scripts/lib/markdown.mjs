// Markdown → HTML برای داک. فقط در زمان build اجرا می‌شود (Worker فقط HTML آماده سرو می‌کند).
import { Marked } from "marked";

import { escapeHtml, codeTabs, normalizeLang } from "../../src/codeblock.js";

export { escapeHtml, codeTabs };

export const slugify = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "section";

const parseInfo = (info = "") => {
  const m = /^(\S*)\s*(?:title="([^"]*)")?\s*(?:group="([^"]*)")?/.exec(info.trim());
  const lang = (m && m[1]) || "text";
  return { lang, title: (m && m[2]) || lang, group: (m && m[3]) || "" };
};

export function codeFigure(code, info = "") {
  const { lang, title } = parseInfo(info);
  return codeTabs([{ label: title, lang, code }]);
}

const ICONS = {
  NOTE: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  WARNING: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 16H3L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>',
};

export function createMarked() {
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    extensions: [
      {
        name: "codegroup",
        renderer(token) {
          return codeTabs(token.items, { group: token.group }) + "\n";
        },
      },
    ],
    renderer: {
      heading({ tokens, depth, raw }) {
        let text = this.parser.parseInline(tokens);
        let id;
        const m = /\s*\{#([\w-]+)\}\s*$/.exec(raw);
        if (m) {
          id = m[1];
          text = text.replace(/\s*\{#[\w-]+\}\s*$/, "");
        } else {
          id = slugify(raw);
        }
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      code({ text, lang }) {
        return codeFigure(text, lang || "");
      },
      table(token) {
        const head = token.header
          .map((c) => `<th scope="col"${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens)}</th>`)
          .join("");
        const body = token.rows
          .map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`)
          .join("");
        return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>\n`;
      },
      image({ href, title, text }) {
        // اسکرین‌شات: تصویر + زیرنویس (title)؛ span تا داخل <p> معتبر بماند
        const cap = title ? `<span class="shot-cap">${escapeHtml(title)}</span>` : "";
        return `<span class="shot"><img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async">${cap}</span>`;
      },
      blockquote({ tokens }) {
        const inner = this.parser.parse(tokens);
        const m = /^<p>\s*\[!(NOTE|WARNING)\]\s*/.exec(inner);
        if (m) {
          const kind = m[1];
          return `<aside class="callout callout-${kind.toLowerCase()}">${ICONS[kind]}<div>${inner.replace(m[0], "<p>")}</div></aside>\n`;
        }
        return `<blockquote class="prompt">${inner}</blockquote>\n`;
      },
    },
  });
  return marked;
}

/** Markdown → HTML؛ بلوک‌های کد پشت‌سرهم با group یکسان در یک بلوک تب‌دار ادغام می‌شوند. */
export function renderMarkdown(md, marked = createMarked()) {
  const tokens = marked.lexer(md);
  const merged = [];
  for (const t of tokens) {
    if (t.type === "code") {
      const { lang, title, group } = parseInfo(t.lang || "");
      if (group) {
        let prev = merged.length ? merged[merged.length - 1] : null;
        if (prev && prev.type === "space" && merged.length > 1) prev = merged[merged.length - 2];
        const item = { label: title, lang, code: t.text };
        if (prev && prev.type === "codegroup" && prev.group === group) {
          prev.items.push(item);
          if (merged[merged.length - 1].type === "space") merged.pop();
        } else {
          merged.push({ type: "codegroup", raw: t.raw, group, items: [item] });
        }
        continue;
      }
    }
    merged.push(t);
  }
  merged.links = tokens.links;
  return marked.parser(merged);
}

/** h2/h3 headingهای متن (برای «در این صفحه»). */
export function extractToc(md, marked = createMarked()) {
  const toc = [];
  for (const t of marked.lexer(md)) {
    if (t.type === "heading" && (t.depth === 2 || t.depth === 3)) {
      const m = /\s*\{#([\w-]+)\}\s*$/.exec(t.raw.trim());
      const text = t.text.replace(/\s*\{#[\w-]+\}\s*$/, "").replace(/[`*]/g, "");
      toc.push({ id: m ? m[1] : slugify(t.raw), text, level: t.depth });
    }
  }
  return toc;
}

/** متن ساده‌ی Markdown برای ایندکس جستجو. */
export function plainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, (b) => b.replace(/```[^\n]*\n?/g, ""))
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*>|#]/g, " ")
    .replace(/\{#[\w-]+\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
