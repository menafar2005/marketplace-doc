// state.js: ساختن state پیش از فرستادن ادمین به نصب. بررسی آن در install.js انجام می‌شود.
// نیاز به express-session دارد (در server.js فعال است).
import { randomBytes } from "node:crypto";

export function createInstallState(req) {
  const state = randomBytes(32).toString("base64url"); // تصادفی و غیرقابل‌حدس
  req.session.installState = state; // تا callback در session کاربر می‌ماند
  return state;
}
