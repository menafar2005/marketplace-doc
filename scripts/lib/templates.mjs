// تمپلیت‌های کد صفحه‌های جزئیات. منبع: پوشه‌ی templates/ (یک پروژه‌ی نمونه‌ی کامل به هر زبان).
// در صفحه‌ها نشانگر <!--TEMPLATE:name--> با یک بلوک کد تب‌دار (Node.js، Python، PHP، C#) عوض می‌شود.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const LANGS = [
  { key: "node", label: "Node.js", lang: "js" },
  { key: "python", label: "Python", lang: "python" },
  { key: "php", label: "PHP", lang: "php" },
  { key: "csharp", label: "C#", lang: "csharp" },
];

export const TEMPLATES = {
  client: { node: "didar.js", python: "didar.py", php: "didar.php", csharp: "DidarClient.cs" },
  install: { node: "install.js", python: "install.py", php: "callback.php", csharp: "InstallRoutes.cs" },
  state: { node: "state.js", python: "state.py", php: "state.php", csharp: "InstallState.cs" },
  launch: { node: "launch.js", python: "launch.py", php: "launch.php", csharp: "LaunchRoutes.cs" },
  link: { node: "link.js", python: "link.py", php: "invoice.php", csharp: "LinkRoutes.cs" },
  "json-modal": { node: "json-modal.js", python: "json_modal.py", php: "note-form.php", csharp: "JsonModalRoutes.cs" },
  "custom-ui": { node: "custom-ui.js", python: "custom_ui.py", php: "panel.php", csharp: "CustomUiRoutes.cs" },
  settings: { node: "settings.js", python: "settings.py", php: "settings.php", csharp: "SettingsRoutes.cs" },
  store: { node: "store.js", python: "store.py", php: "store.php", csharp: "Store.cs" },
  server: { node: "server.js", python: "app.py", php: "index.php", csharp: "Program.cs" },
};

/** Markdown یک تمپلیت: چهار بلوک کد پشت‌سرهم با group یکسان (در HTML یک بلوک تب‌دار می‌شوند). */
export function templateMarkdown(root, name) {
  const files = TEMPLATES[name];
  if (!files) throw new Error(`unknown template "${name}"`);
  return LANGS.map(({ key, label, lang }) => {
    const code = readFileSync(join(root, "templates", key, files[key]), "utf8").replace(/\n+$/, "");
    return "```" + `${lang} title="${label}" group="tpl-${name}"\n${code}\n` + "```";
  }).join("\n\n");
}
