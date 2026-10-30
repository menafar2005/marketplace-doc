// scripts/anatomy.html → public/images/anatomy/plugin-anatomy.png (2x).
// Usage: node scripts/render-anatomy.cjs FONT_DIR   (FONT_DIR has Vazirmatn-*.ttf; needs Playwright with Chromium)
const fs = require("node:fs");
const path = require("node:path");
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/npm-tools/node_modules/playwright")); }

(async () => {
  const fontDir = path.resolve(process.argv[2] || ".");
  const root = path.join(__dirname, "..");
  const html = fs.readFileSync(path.join(__dirname, "anatomy.html"), "utf8").replaceAll("FONT_DIR", "file://" + fontDir);
  const tmp = path.join(require("node:os").tmpdir(), "didar-anatomy.html");
  fs.writeFileSync(tmp, html);
  const outDir = path.join(root, "public/images/anatomy");
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 2 });
  await page.goto("file://" + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#art").screenshot({ path: path.join(outDir, "plugin-anatomy.png") });
  await browser.close();
  console.log("plugin-anatomy.png");
})();
