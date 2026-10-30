// install.js: مسیر نصب. همین آدرس را در Developer Hub در فیلد Callback URL ثبت کن:
// https://your-app.example.com/didar/callback
import express from "express";
import { saveInstallation, encrypt } from "./store.js";

export const install = express.Router();
const { DIDAR_CLIENT_ID, DIDAR_CLIENT_SECRET } = process.env;

install.get("/didar/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).type("text/plain").send("کد نصب در درخواست نیست.");

  // اگر پیش از نصب state ساخته‌ای، همین‌جا با مقدار session مقایسه کن (صفحه‌ی «پارامتر state»).
  const expected = req.session?.installState;
  if (expected) {
    delete req.session.installState; // یک‌بارمصرف
    if (state !== expected) return res.status(400).type("text/plain").send("درخواست نصب معتبر نیست.");
  }

  // code + credentialهای پلاگین ← CompleteInstallation (نام فیلدها PascalCase)
  const r = await fetch("https://app.didar.me/api/MarketplaceInstall/CompleteInstallation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Code: code, ClientId: DIDAR_CLIENT_ID, ClientSecret: DIDAR_CLIENT_SECRET }),
  });
  const result = (await r.json().catch(() => null))?.Response;
  if (!r.ok || !result?.Succeeded) {
    console.error("install failed", r.status, JSON.stringify(result?.Error), result?.Meta?.TraceId);
    return res.status(502).type("text/plain").send("نصب کامل نشد. دوباره از لینک نصب امتحان کن.");
  }

  const d = result.Data;
  await saveInstallation({
    bizDomainId: d.BizDomainId, // کلید اصلی هر نصب
    installationId: d.InstallationId,
    appPublicId: d.AppPublicId,
    scopes: d.Scopes,
    apiKey: encrypt(d.ApiKey), // فقط رمزگذاری‌شده
    installedAt: d.InstalledAt,
  });

  // اینجا ادمین را به قدم بعدی در سیستم خودت ببر (ساخت حساب، ورود یا تنظیمات).
  res.type("text/plain").send("نصب کامل شد. می‌توانی به دیدار برگردی.");
});
