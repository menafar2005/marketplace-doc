# custom_ui.py: صفحه‌ای که داخل iframe دیدار باز می‌شود (Custom panel یا Custom modal).
# این آدرس را در فیلد Iframe URL ثبت کن. صفحه یک دکمه دارد که روی همان معامله یادداشت ثبت می‌کند.
import secrets
import time

from flask import Blueprint, make_response, request
from markupsafe import escape

from didar import didar_api, exchange_launch_code

custom_ui = Blueprint("custom_ui", __name__)
TEXT = {"Content-Type": "text/plain; charset=utf-8"}
NOTE_TYPE = "00000000-0000-0000-0000-000000000000"

# session کوتاه همین اجرا، فقط سمت سرور. token هیچ‌وقت به مرورگر نمی‌رود.
_runs = {}  # session_id → {"token", "context", "expires_at"}


def _current_run():
    run = _runs.get(request.cookies.get("didar_run", ""))
    return run if run and run["expires_at"] > time.time() else None


@custom_ui.get("/didar/panel")
def panel():
    run = exchange_launch_code(request.args.get("launchCode"))
    if not run:
        return "این اجرا منقضی شده؛ صفحه‌ی دیدار را دوباره باز کن.", 401, TEXT
    context = run["context"]
    if context["entityType"] != "deal":
        return "فقط برای معامله.", 400, TEXT

    session_id = secrets.token_urlsafe(24)
    ttl = run["expiresInSeconds"]
    _runs[session_id] = {"token": run["accessToken"], "context": context, "expires_at": time.time() + ttl}

    deal = didar_api(run["accessToken"], "GET", f"/api/v1/deals/{context['entityIds'][0]}")
    resp = make_response(
        '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">'
        "<style>body{font-family:sans-serif;margin:12px;color-scheme:light dark}</style>"
        f"<p><strong>{escape(deal['Title'])}</strong></p>"
        '<form method="post" action="/didar/panel/note"><textarea name="text" maxlength="2000" required></textarea>'
        "<button>ثبت یادداشت</button></form></html>")
    # iframe روی origin دیگری است: SameSite=None و Secure لازم است
    resp.set_cookie("didar_run", session_id, max_age=ttl, httponly=True, secure=True, samesite="None")
    return resp


@custom_ui.post("/didar/panel/note")
def panel_note():
    run = _current_run()
    if not run:
        return "زمان این اجرا تمام شده؛ صفحه‌ی دیدار را دوباره باز کن.", 401, TEXT
    text = (request.form.get("text") or "").strip()
    if not text or len(text) > 2000:
        return "متن یادداشت معتبر نیست.", 400, TEXT
    didar_api(run["token"], "POST", "/api/v1/notes", {
        "Activity": {"ActivityTypeId": NOTE_TYPE, "IsDone": True, "DealId": run["context"]["entityIds"][0], "ResultNote": text},
    })
    return "یادداشت ثبت شد.", 200, TEXT
