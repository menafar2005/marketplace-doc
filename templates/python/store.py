# store.py: جای ذخیره‌ی نصب‌ها و تنظیمات. این نسخه فقط برای توسعه است و در حافظه نگه می‌دارد؛
# در محیط واقعی دیتابیس خودت را جایگزین کن و ApiKey را با یک کلید واقعی رمزگذاری کن.
import base64

_installations = {}
_settings = {}


def save_installation(inst):
    _installations[inst["biz_domain_id"]] = inst


def get_installation(biz_domain_id):
    return _installations.get(biz_domain_id)


def load_settings(biz_domain_id):
    return _settings.get(biz_domain_id, {})


def save_settings(biz_domain_id, value):
    _settings[biz_domain_id] = value


def encrypt(secret):
    # جایگزین کن: مثلاً AES-GCM با کلیدی که در secret manager است
    return "encrypted:" + base64.b64encode(str(secret).encode()).decode()
