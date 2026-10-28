// SVG flowcharts (scripts/flowcharts.py) → PNG at 2x, for public/images/flows.
// Usage: node scripts/render-flowcharts.cjs SVG_DIR OUT_DIR   (needs Playwright with Chromium)
const fs = require("node:fs");
const path = require("node:path");
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/npm-tools/node_modules/playwright")); }

(async () => {
  const [svgDir, outDir] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const file of fs.readdirSync(svgDir).filter((f) => f.endsWith(".svg"))) {
    const svg = fs.readFileSync(path.join(svgDir, file), "utf8");
    const [, w, h] = /width="([\d.]+)" height="([\d.]+)"/.exec(svg);
    const page = await browser.newPage({ viewport: { width: Math.ceil(+w), height: Math.ceil(+h) }, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator("svg").screenshot({ path: path.join(outDir, file.replace(/\.svg$/, ".png")) });
    await page.close();
    console.log(file);
  }
  await browser.close();
})();
