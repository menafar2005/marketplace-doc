# install.py: مسیر نصب. همین آدرس را در Developer Hub در فیلد Callback URL ثبت کن:
# https://your-app.example.com/didar/callback
import logging
import os

import requests
from flask import Blueprint, request, session

from store import encrypt, save_installation

install = Blueprint("install", __name__)
log = logging.getLogger("didar")
COMPLETE_INSTALLATION = "https://app.didar.me/api/MarketplaceInstall/CompleteInstallation"
TEXT = {"Content-Type": "text/plain; charset=utf-8"}


@install.get("/didar/callback")
def didar_callback():
    code = request.args.get("code")
    if not code:
        return "کد نصب در درخواست نیست.", 400, TEXT

    # اگر پیش از نصب state ساخته‌ای، همین‌جا با مقدار session مقایسه کن (صفحه‌ی «پارامتر state»).
    expected = session.pop("install_state", None)  # یک‌بارمصرف
    if expected and request.args.get("state") != expected:
        return "درخواست نصب معتبر نیست.", 400, TEXT

    # code + credentialهای پلاگین ← CompleteInstallation (نام فیلدها PascalCase)
    r = requests.post(COMPLETE_INSTALLATION, json={
        "Code": code,
        "ClientId": os.environ["DIDAR_CLIENT_ID"],
        "ClientSecret": os.environ["DIDAR_CLIENT_SECRET"],
    }, timeout=15)
    try:
        result = (r.json() or {}).get("Response") or {}
    except ValueError:
        result = {}
    if not r.ok or not result.get("Succeeded"):
        log.error("install failed: %s %s trace=%s", r.status_code, result.get("Error"),
                  (result.get("Meta") or {}).get("TraceId"))
        return "نصب کامل نشد. دوباره از لینک نصب امتحان کن.", 502, TEXT

    d = result["Data"]
    save_installation({
        "biz_domain_id": d["BizDomainId"],  # کلید اصلی هر نصب
        "installation_id": d["InstallationId"],
        "app_public_id": d["AppPublicId"],
        "scopes": d["Scopes"],
        "api_key": encrypt(d["ApiKey"]),  # فقط رمزگذاری‌شده
        "installed_at": d["InstalledAt"],
    })

    # اینجا ادمین را به قدم بعدی در سیستم خودت ببر (ساخت حساب، ورود یا تنظیمات).
    return "نصب کامل شد. می‌توانی به دیدار برگردی.", 200, TEXT
