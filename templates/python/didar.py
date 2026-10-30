# didar.py: کلاینت کوچک مارکت‌پلیس دیدار که بقیه‌ی تمپلیت‌ها از آن استفاده می‌کنند.
# متغیرهای محیطی: DIDAR_CLIENT_ID و DIDAR_CLIENT_SECRET (فقط روی سرور). وابستگی: pip install flask requests
import logging
import os

import requests

DIDAR_ORIGIN = "https://app.didar.me"
MARKETPLACE = "https://marketplace.didar.me"
log = logging.getLogger("didar")


class DidarError(Exception):
    def __init__(self, status, code, trace_id):
        super().__init__(f"Didar API {status} {code or ''}".strip())
        self.status = status  # HTTP status
        self.code = code  # error.code، مثل PROXY_ACCESS_DENIED
        self.trace_id = trace_id  # برای پشتیبانی log کن


def _json(r):
    try:
        return r.json()
    except ValueError:
        return None


def exchange_launch_code(launch_code):
    """launchCode → {accessToken, tokenType, expiresInSeconds, context}؛ در خطا None."""
    if not launch_code:
        return None
    r = requests.post(
        f"{MARKETPLACE}/api/v1/runtime/token",
        json={
            "launchCode": launch_code,
            "clientId": os.environ["DIDAR_CLIENT_ID"],
            "clientSecret": os.environ["DIDAR_CLIENT_SECRET"],
        },
        timeout=15,
    )
    body = _json(r) or {}
    if not r.ok or not body.get("succeeded"):
        log.error("launch exchange failed: %s %s trace=%s", r.status_code,
                  (body.get("error") or {}).get("code"), (body.get("meta") or {}).get("traceId"))
        return None
    return body["data"]


def didar_api(access_token, method, path, payload=None):
    """درخواست به API داده‌ی دیدار با Runtime Token؛ data.Response را برمی‌گرداند."""
    headers = {"Authorization": f"Bearer {access_token}"}
    if payload is None:
        headers["Accept"] = "application/json"
    r = requests.request(method, MARKETPLACE + path, headers=headers, json=payload, timeout=15)
    body = _json(r) or {}
    if not r.ok or not body.get("succeeded"):
        raise DidarError(r.status_code, (body.get("error") or {}).get("code"), (body.get("meta") or {}).get("traceId"))
    return (body.get("data") or {}).get("Response")
