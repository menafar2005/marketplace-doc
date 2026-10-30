// store.js: جای ذخیره‌ی نصب‌ها و تنظیمات. این نسخه فقط برای توسعه است و در حافظه نگه می‌دارد؛
// در محیط واقعی دیتابیس خودت را جایگزین کن و ApiKey را با یک کلید واقعی رمزگذاری کن.
const installations = new Map();
const settings = new Map();

export async function saveInstallation(inst) {
  installations.set(inst.bizDomainId, inst);
}
export async function getInstallation(bizDomainId) {
  return installations.get(bizDomainId) ?? null;
}
export async function loadSettings(bizDomainId) {
  return settings.get(bizDomainId) ?? {};
}
export async function saveSettings(bizDomainId, value) {
  settings.set(bizDomainId, value);
}
export function encrypt(secret) {
  // جایگزین کن: مثلاً AES-GCM با کلیدی که در secret manager است
  return `encrypted:${Buffer.from(String(secret)).toString("base64")}`;
}
