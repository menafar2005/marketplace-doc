# app.py: همه‌ی مسیرها کنار هم. اجرا: flask --app app run --port 3000
# وابستگی‌ها: pip install flask requests
import os

from flask import Flask

from custom_ui import custom_ui
from install import install
from json_modal import json_modal
from launch import launch
from link import link
from settings import settings

app = Flask(__name__)
# session سایت خودت (برای state نصب). SESSION_SECRET هم مثل بقیه‌ی secretها فقط روی سرور.
app.secret_key = os.environ["SESSION_SECRET"]
app.config.update(SESSION_COOKIE_SECURE=True, SESSION_COOKIE_HTTPONLY=True)

for bp in (install, launch, link, json_modal, custom_ui, settings):
    app.register_blueprint(bp)
