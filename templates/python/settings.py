# settings.py: صفحه‌ی تنظیمات پلاگین (App settings از نوع Custom UI). این آدرس را در Iframe URL ثبت کن.
# تنظیمات با شناسه‌ی BizDomain ذخیره می‌شوند که از API گرفته می‌شود، نه از query.
import secrets
import time

from flask import Blueprint, make_response, request
from markupsafe import escape

from didar import didar_api, exchange_launch_code
from store import load_settings, save_settings

settings = Blueprint("settings", __name__)
TEXT = {"Content-Type": "text/plain; charset=utf-8"}
_sessions = {}  # session_id → {"biz_domain_id", "csrf", "expires_at"}


@settings.get("/didar/settings")
def settings_page():
    run = exchange_launch_code(request.args.get("launchCode"))
    if not run or run["context"]["target"] != "settings_page":
        return "دوباره از دیدار باز کن.", 401, TEXT

    # tenant را از خود دیدار بپرس (scope اطلاعات پایه همیشه فعال است)
    biz = didar_api(run["accessToken"], "GET", "/api/v1/proxy/biz-domain/info")
    session_id, csrf = secrets.token_urlsafe(24), secrets.token_urlsafe(24)
    _sessions[session_id] = {"biz_domain_id": biz["Id"], "csrf": csrf, "expires_at": time.time() + 900}

    current = load_settings(biz["Id"])
    resp = make_response(
        '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">'
        f"<h1>تنظیمات برای {escape(biz['Title'])}</h1>"
        '<form method="post" action="/didar/settings">'
        f'<input type="hidden" name="csrf" value="{csrf}">'
        f'<label>کلید API سرویس جلسه <input name="meetingApiKey" value="{escape(current.get("meetingApiKey", ""))}"></label>'
        "<button>ذخیره</button></form></html>")
    resp.set_cookie("didar_settings", session_id, max_age=900, httponly=True, secure=True, samesite="None")
    return resp


@settings.post("/didar/settings")
def settings_save():
    s = _sessions.get(request.cookies.get("didar_settings", ""))
    if not s or s["expires_at"] < time.time() or request.form.get("csrf") != s["csrf"]:
        return "دوباره از دیدار باز کن.", 403, TEXT
    save_settings(s["biz_domain_id"], {"meetingApiKey": (request.form.get("meetingApiKey") or "")[:200]})
    return "ذخیره شد.", 200, TEXT
