// Markdown → HTML برای داک. فقط در زمان build اجرا می‌شود (Worker فقط HTML آماده سرو می‌کند).
import { Marked } from "marked";

export const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const slugify = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "section";

function highlight(code, lang) {
  let html = escapeHtml(code);
  if (lang === "json") {
    html = html.replace(/(&quot;(?:[^&\\]|\\.|&(?!quot;))*?&quot;)(\s*:)/g, '<span class="tk-key">$1</span>$2');
  }
  if (lang === "bash" || lang === "text" || lang === "js") {
    html = html.replace(/(^|\s)(#[^\n]*)$/gm, '$1<span class="tk-comment">$2</span>');
  }
  if (lang === "js") {
    html = html.replace(/(^|\s)(\/\/[^\n]*)$/gm, '$1<span class="tk-comment">$2</span>');
  }
  return html;
}

export function codeFigure(code, info = "") {
  const m = /^(\S*)\s*(?:title="([^"]*)")?/.exec(info.trim());
  const lang = (m && m[1]) || "text";
  const title = (m && m[2]) || lang;
  return (
    `<figure class="code" dir="ltr"><div class="code-bar"><span>${escapeHtml(title)}</span>` +
    `<button class="copy" type="button" aria-label="کپی کد">Copy</button></div>` +
    `<pre><code class="language-${escapeHtml(lang)}">${highlight(code.replace(/\n$/, ""), lang)}</code></pre></figure>`
  );
}

const ICONS = {
  NOTE: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  WARNING: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 16H3L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>',
};

export function createMarked() {
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
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

/** h2 headingهای متن (برای «در این صفحه»). */
export function extractToc(md, marked = createMarked()) {
  const toc = [];
  for (const t of marked.lexer(md)) {
    if (t.type === "heading" && t.depth === 2) {
      const m = /\s*\{#([\w-]+)\}\s*$/.exec(t.raw.trim());
      const text = t.text.replace(/\s*\{#[\w-]+\}\s*$/, "").replace(/[`*]/g, "");
      toc.push({ id: m ? m[1] : slugify(t.raw), text });
    }
  }
  return toc;
}

/** متن ساده‌ی Markdown برای ایندکس جستجو. */
export function plainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, (b) => b.replace(/```[^\n]*\n?/g, ""))
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*>|#]/g, " ")
    .replace(/\{#[\w-]+\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
