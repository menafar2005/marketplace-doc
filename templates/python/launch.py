# launch.py: مسیر اجرا. دیدار هر بار که کاربر اکستنشن را باز می‌کند این آدرس را با ?launchCode= صدا می‌زند.
import logging

from flask import Blueprint, request

from didar import DidarError, didar_api, exchange_launch_code

launch = Blueprint("launch", __name__)
log = logging.getLogger("didar")
TEXT = {"Content-Type": "text/plain; charset=utf-8"}


@launch.get("/didar/launch")
def didar_launch():
    # ۱. launchCode ← Runtime Token + Runtime Context (فقط backend)
    run = exchange_launch_code(request.args.get("launchCode"))
    if not run:
        return "این اجرا معتبر نیست؛ اکستنشن را دوباره از دیدار باز کن.", 401, TEXT
    token, context = run["accessToken"], run["context"]

    # ۲. فقط به context اعتماد کن: کاربر کجاست و روی کدام رکوردها کار می‌کند
    if context["entityType"] != "deal" or not context["entityIds"]:
        return "این اکستنشن فقط روی معامله کار می‌کند.", 400, TEXT

    # ۳. داده‌ی دیدار با همان token، فقط برای رکوردهای همین اجرا
    try:
        deal = didar_api(token, "GET", f"/api/v1/deals/{context['entityIds'][0]}")
    except DidarError as e:
        log.error("didar api failed: %s %s trace=%s", e.status, e.code, e.trace_id)
        return "دسترسی به این معامله ممکن نشد.", (403 if e.status == 403 else 502), TEXT
    return f"معامله: {deal['Title']}", 200, TEXT
