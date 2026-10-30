# json_modal.py: endpoint اکستنشن JSON modal. این آدرس را در فیلد API endpoint ثبت کن.
# فرم form.json یک جزء textarea با key = "noteText" دارد؛ مقدارش در context.payload.noteText می‌رسد.
import logging

from flask import Blueprint, jsonify, request

from didar import DIDAR_ORIGIN, DidarError, didar_api, exchange_launch_code

json_modal = Blueprint("json_modal", __name__)
log = logging.getLogger("didar")
NOTE_TYPE = "00000000-0000-0000-0000-000000000000"  # یادداشت: GUID خالی


# submit فرم با fetch مرورگر از داخل دیدار می‌آید، پس CORS فقط برای origin دقیق دیدار
@json_modal.after_request
def allow_didar(resp):
    resp.headers["Access-Control-Allow-Origin"] = DIDAR_ORIGIN
    resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp


def reply(succeeded, message, data=None):
    body = {"succeeded": succeeded, "message": message}
    if data is not None:
        body["data"] = data
    return jsonify(body)


@json_modal.route("/didar/note-form", methods=["GET", "OPTIONS"])
def note_form():
    if request.method == "OPTIONS":
        return "", 204
    run = exchange_launch_code(request.args.get("launchCode"))
    if not run:
        return reply(False, "این اجرا معتبر نیست؛ فرم را دوباره باز کن.")
    token, context = run["accessToken"], run["context"]
    if context["entityType"] != "deal":
        return reply(False, "این فرم فقط روی معامله کار می‌کند.")

    # payload ورودی کاربر است: الزامی بودن، نوع و طول را دوباره چک کن
    note_text = (context.get("payload") or {}).get("noteText")
    note_text = note_text.strip() if isinstance(note_text, str) else ""
    if not note_text or len(note_text) > 2000:
        return reply(False, "متن یادداشت باید بین ۱ تا ۲۰۰۰ کاراکتر باشد.")

    # روی همه‌ی معامله‌های این اجرا (در لیست ممکن است چند معامله انتخاب شده باشد)
    try:
        for deal_id in context["entityIds"]:
            didar_api(token, "POST", "/api/v1/notes", {
                "Activity": {"ActivityTypeId": NOTE_TYPE, "IsDone": True, "DealId": deal_id, "ResultNote": note_text},
            })
    except DidarError as e:
        log.error("note create failed: %s %s trace=%s", e.status, e.code, e.trace_id)
        return reply(False, "ثبت یادداشت ناموفق بود.")
    count = len(context["entityIds"])
    return reply(True, f"یادداشت روی {count} معامله ثبت شد.", {"count": count})
