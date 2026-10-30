# state.py: ساختن state پیش از فرستادن ادمین به نصب. بررسی آن در install.py انجام می‌شود.
import secrets

from flask import session


def create_install_state():
    state = secrets.token_urlsafe(32)  # تصادفی و غیرقابل‌حدس
    session["install_state"] = state  # تا callback در session کاربر می‌ماند
    return state
