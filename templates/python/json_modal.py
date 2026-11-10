# json_modal.py: endpoint اکستنشن JSON modal. این آدرس را در فیلد API endpoint ثبت کن.
# دیدار این endpoint را با POST و بدنه‌ی JSON صدا می‌زند: event برابر extension.load (باز شدن فرم، اگر loadOnOpen روشن باشد)
# یا extension.submit (ثبت فرم). فرم form.json یک جزء textarea با key = "noteText" دارد؛ مقدارش در values.noteText می‌رسد.
import logging

from flask import Blueprint, jsonify, request

from didar import DIDAR_ORIGIN, DidarError, didar_api, exchange_launch_code

json_modal = Blueprint("json_modal", __name__)
log = logging.getLogger("didar")
NOTE_TYPE = "00000000-0000-0000-0000-000000000000"  # یادداشت: GUID خالی


# درخواست با fetch مرورگر از داخل دیدار می‌آید (POST با بدنه‌ی JSON)، پس CORS فقط برای origin دقیق دیدار
@json_modal.after_request
def allow_didar(resp):
    resp.headers["Access-Control-Allow-Origin"] = DIDAR_ORIGIN
    resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp


@json_modal.route("/didar/note-form", methods=["POST", "OPTIONS"])
def note_form():
    if request.method == "OPTIONS":
        return "", 204
    body = request.get_json(silent=True) or {}
    event = body.get("event")

    # باز شدن فرم: مقدارهای اولیه‌ی فیلدها را با همان keyها برگردان
    if event == "extension.load":
        return jsonify({"ok": True, "data": {"values": {"noteText": ""}}})
    if event != "extension.submit":
        return jsonify({"ok": False, "message": "درخواست ناشناخته است."})

    # values ورودی کاربر است: الزامی بودن، نوع و طول را دوباره چک کن؛ خطا کنار همان فیلد نمایش داده می‌شود
    note_text = (body.get("values") or {}).get("noteText")
    note_text = note_text.strip() if isinstance(note_text, str) else ""
    if not note_text or len(note_text) > 2000:
        return jsonify({"ok": False, "message": "بعضی از مقادیر معتبر نیستند.",
                        "errors": {"noteText": "متن یادداشت باید بین ۱ تا ۲۰۰۰ کاراکتر باشد."}})

    # رکوردها را فقط از Runtime Context بخوان، نه از context بدنه که مرورگر فرستاده
    run = exchange_launch_code(request.args.get("launchCode"))
    if not run:
        return jsonify({"ok": False, "message": "این اجرا معتبر نیست؛ فرم را دوباره باز کن."})
    token, context = run["accessToken"], run["context"]
    if context["entityType"] != "deal":
        return jsonify({"ok": False, "message": "این فرم فقط روی معامله کار می‌کند."})

    # روی همه‌ی معامله‌های این اجرا (در لیست ممکن است چند معامله انتخاب شده باشد)
    try:
        for deal_id in context["entityIds"]:
            didar_api(token, "POST", "/api/v1/notes", {
                "Activity": {"ActivityTypeId": NOTE_TYPE, "IsDone": True, "DealId": deal_id, "ResultNote": note_text},
            })
    except DidarError as e:
        log.error("note create failed: %s %s trace=%s", e.status, e.code, e.trace_id)
        return jsonify({"ok": False, "message": "ثبت یادداشت ناموفق بود."})
    count = len(context["entityIds"])
    return jsonify({"ok": True, "message": f"یادداشت روی {count} معامله ثبت شد.", "close": True})
