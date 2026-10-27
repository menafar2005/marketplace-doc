// جستجوی ساده روی chunkهای داک (یک chunk به‌ازای هر h2). هم برای سایت و هم برای ابزار MCP.
import { search as chunks } from "./generated/content.js";

export const normalize = (s) =>
  String(s)
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌‏‎]/g, " ")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

const tokens = (q) => normalize(q).split(/[\s,.;:!?()[\]{}"'«»،؛؟/\\]+/).filter((t) => t.length > 1);

const prepared = chunks.map((c) => ({
  ...c,
  nText: normalize(c.text),
  nHeading: normalize(c.heading),
  nPage: normalize(c.page),
}));

function count(hay, needle) {
  let n = 0;
  let i = hay.indexOf(needle);
  while (i !== -1 && n < 10) {
    n++;
    i = hay.indexOf(needle, i + needle.length);
  }
  return n;
}

export function searchDocs(query, { limit = 5, origin = "" } = {}) {
  const ts = tokens(query);
  if (!ts.length) return [];
  const scored = [];
  for (const c of prepared) {
    let score = 0;
    let matched = 0;
    for (const t of ts) {
      const inText = count(c.nText, t);
      const inHead = c.nHeading.includes(t);
      const inPage = c.nPage.includes(t);
      if (inText || inHead || inPage) matched++;
      score += Math.min(inText, 5) + (inHead ? 6 : 0) + (inPage ? 3 : 0);
    }
    if (!matched) continue;
    if (matched === ts.length) score *= 2;
    scored.push({ c, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ c, score }) => {
    const pos = Math.max(0, ts.map((t) => c.nText.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0);
    const start = Math.max(0, pos - 60);
    return {
      slug: c.slug,
      page: c.page,
      heading: c.heading,
      url: `${origin}/${c.slug}${c.id ? "#" + c.id : ""}`,
      snippet: (start ? "…" : "") + c.text.slice(start, start + 240) + (start + 240 < c.text.length ? "…" : ""),
      score,
    };
  });
}
