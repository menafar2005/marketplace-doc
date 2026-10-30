# link.py: اکستنشن Links. این آدرس را در فیلد URL اکستنشن ثبت کن.
# دیدار صفحه را با ?launchCode= باز می‌کند؛ در صفحه‌های لیست، entityIds چند شناسه دارد.
from flask import Blueprint, request
from markupsafe import escape

from didar import didar_api, exchange_launch_code

link = Blueprint("link", __name__)
TEXT = {"Content-Type": "text/plain; charset=utf-8"}


@link.get("/didar/invoice")
def invoice():
    run = exchange_launch_code(request.args.get("launchCode"))
    if not run:
        return "این لینک منقضی شده؛ دوباره از دیدار باز کن.", 401, TEXT
    token, context = run["accessToken"], run["context"]
    if context["entityType"] != "deal":
        return "فقط برای معامله.", 400, TEXT

    # همه‌ی رکوردهای انتخاب‌شده، فقط از context
    deals = [didar_api(token, "GET", f"/api/v1/deals/{i}") for i in context["entityIds"]]

    # token را به مرورگر نفرست. اگر کاربر در این صفحه کار بیشتری می‌کند، session کوتاه خودت را بساز.
    items = "".join(f"<li>{escape(d['Title'])}: {escape(d.get('Price'))}</li>" for d in deals)
    return (f'<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>پیش‌فاکتور</title>'
            f"<h1>پیش‌فاکتور برای {len(deals)} معامله</h1><ul>{items}</ul></html>")
