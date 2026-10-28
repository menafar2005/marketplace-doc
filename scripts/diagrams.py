"""Generate theme-aware inline SVG flow diagrams for the Didar marketplace docs.

Colors come from the site's CSS variables so the diagrams follow light/dark theme.
Run: python3 -I diagrams.py OUT_DIR
"""
import sys
from html import escape

FONT = "var(--font-sans)"
MONO = "var(--font-mono)"

STYLE = (
    "<style>"
    ".d-t{font-family:var(--font-sans);fill:var(--ink);}"
    ".d-m{font-family:var(--font-mono);fill:var(--muted);}"
    ".d-s{font-family:var(--font-sans);fill:var(--muted);}"
    ".d-box{fill:var(--surface-2);stroke:var(--line-strong);}"
    ".d-brand{fill:var(--brand-tint);stroke:var(--brand);}"
    ".d-life{stroke:var(--line-strong);stroke-dasharray:4 5;}"
    ".d-arrow{stroke:var(--brand-strong);fill:none;stroke-width:1.8;}"
    ".d-back{stroke:var(--muted);fill:none;stroke-width:1.6;stroke-dasharray:6 4;}"
    ".d-head{fill:var(--brand-strong);}"
    ".d-headm{fill:var(--muted);}"
    ".d-num{fill:var(--brand-strong);}"
    ".d-numt{font-family:var(--font-sans);fill:var(--on-brand);font-weight:700;}"
    ".d-note{fill:var(--surface);stroke:var(--line);}"
    ".d-bad{fill:var(--surface);stroke:var(--danger);}"
    ".d-badt{font-family:var(--font-mono);fill:var(--danger);}"
    "</style>"
)

FA = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")


def t(x, y, s, cls="d-t", size=14, anchor="middle", weight=None, rtl=True):
    w = f' font-weight="{weight}"' if weight else ""
    d = ' direction="rtl"' if rtl else ' direction="ltr"'
    return f'<text class="{cls}" x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}"{d}{w}>{escape(s)}</text>'


def svg(w, h, label, body, uid):
    defs = (
        f'<defs><marker id="{uid}-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0 0L10 5L0 10z" class="d-head"/></marker>'
        f'<marker id="{uid}-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0 0L10 5L0 10z" class="d-headm"/></marker></defs>'
    )
    return (
        f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="{escape(label)}" xmlns="http://www.w3.org/2000/svg">'
        + STYLE + defs + "".join(body) + "</svg>"
    )


def num(x, y, n):
    return f'<circle class="d-num" cx="{x}" cy="{y}" r="11"/>' + t(x, y + 5, str(n).translate(FA), "d-numt", 13)


# ---------------------------------------------------------------- sequence diagrams
def sequence(uid, label, lanes, steps, width=820, top=24):
    """lanes: [(title, subtitle)] right-to-left. steps: list of dicts."""
    n = len(lanes)
    margin = 120
    gap = (width - 2 * margin) / (n - 1)
    xs = [width - margin - i * gap for i in range(n)]  # first lane on the right (RTL)
    body = []
    y = top
    for x, (title, sub) in zip(xs, lanes):
        body.append(f'<rect class="d-brand" x="{x-86}" y="{y}" width="172" height="56" rx="10"/>')
        body.append(t(x, y + 24, title, size=15.5, weight=700))
        if sub:
            body.append(t(x, y + 44, sub, "d-m", 12, rtl=False))
    y += 56
    life_top = y
    y += 34
    rows = []
    for s in steps:
        kind = s["kind"]
        if kind in ("msg", "back"):
            a, b = xs[s["from"]], xs[s["to"]]
            lines = s["text"] if isinstance(s["text"], list) else [s["text"]]
            code = s.get("code")
            mid = (a + b) / 2
            ty = y
            for i, line in enumerate(lines):
                rows.append(t(mid, ty, line, size=15))
                ty += 21
            if code:
                rows.append(t(mid, ty, code, "d-m", 12.5, rtl=False))
                ty += 19
            ay = ty + 2
            cls = "d-arrow" if kind == "msg" else "d-back"
            mk = f"{uid}-a" if kind == "msg" else f"{uid}-b"
            pad = 6 if b < a else -6
            rows.append(f'<line class="{cls}" x1="{a - (6 if b < a else -6)}" y1="{ay}" x2="{b + pad}" y2="{ay}" marker-end="url(#{mk})"/>')
            if "n" in s:
                rows.append(num(a + (16 if b < a else -16), ay - 1, s["n"]))
            y = ay + 28
        elif kind == "self":
            x = xs[s["lane"]]
            lines = s["text"] if isinstance(s["text"], list) else [s["text"]]
            h = 16 + 20 * len(lines)
            bw = max(180, max(len(l) for l in lines) * 7.4 + 32)
            x = min(max(x, bw / 2 + 8), width - bw / 2 - 8)  # keep the note inside the canvas
            rows.append(f'<rect class="d-note" x="{x-bw/2}" y="{y-16}" width="{bw}" height="{h}" rx="8"/>')
            ty = y + 4
            for line in lines:
                rows.append(t(x, ty, line, "d-s", 13.5))
                ty += 20
            if "n" in s:
                rows.append(num(x + bw / 2, y - 16, s["n"]))
            y += h + 18
    bottom = y - 8
    for x in xs:
        body.append(f'<line class="d-life" x1="{x}" y1="{life_top}" x2="{x}" y2="{bottom}"/>')
    body += rows
    return svg(width, bottom + 12, label, body, uid)


def install():
    lanes = [("ادمین کسب‌وکار", "browser"), ("دیدار", "app.didar.me"), ("سرور تو", "Callback URL")]
    steps = [
        dict(kind="msg", **{"from": 0, "to": 1}, text="لینک نصب اپ را باز می‌کند", n=1),
        dict(kind="back", **{"from": 1, "to": 0}, text=["صفحه‌ی تأیید نصب", "اپ و سازنده، BizDomain، دسترسی‌ها، کاربران"]),
        dict(kind="msg", **{"from": 0, "to": 1}, text="«تأیید دسترسی به اطلاعات و نصب»", n=2),
        dict(kind="msg", **{"from": 1, "to": 2}, text="redirect مرورگر به Callback URL", code="GET ?code=…&state=…", n=3),
        dict(kind="self", lane=2, text=["state را با session", "مقایسه می‌کند"]),
        dict(kind="msg", **{"from": 2, "to": 1}, text="تکمیل نصب (server-to-server)", code="POST /api/MarketplaceInstall/CompleteInstallation", n=4),
        dict(kind="back", **{"from": 1, "to": 2}, text="نتیجه‌ی نصب", code="BizDomainId · Scopes · ApiKey · AppPublicId"),
        dict(kind="self", lane=2, text=["نصب را با BizDomainId ذخیره می‌کند", "و «نصب کامل شد» نشان می‌دهد"], n=5),
    ]
    return sequence("dins", "جریان نصب اپ: از باز کردن لینک نصب تا ذخیره‌ی نتیجه", lanes, steps, width=780)


def runtime():
    lanes = [("کاربر دیدار", "browser"), ("دیدار", "app.didar.me"), ("سرور تو", "extension URL"), ("مارکت‌پلیس", "marketplace.didar.me")]
    steps = [
        dict(kind="msg", **{"from": 0, "to": 1}, text="اکستنشن را اجرا می‌کند"),
        dict(kind="self", lane=1, text=["launchCode یک‌بارمصرف", "برای همین اجرا می‌سازد"]),
        dict(kind="msg", **{"from": 1, "to": 2}, text="آدرس اکستنشن را صدا می‌زند", code="GET ?launchCode=ONE_TIME_CODE", n=1),
        dict(kind="msg", **{"from": 2, "to": 3}, text="تبادل کد با credentials اپ", code="POST /api/v1/runtime/token", n=2),
        dict(kind="back", **{"from": 3, "to": 2}, text="Runtime Token و Runtime Context", code="accessToken · context.entityIds · payload"),
        dict(kind="self", lane=2, text=["target، entityIds و payload", "را بررسی می‌کند"]),
        dict(kind="msg", **{"from": 2, "to": 3}, text="درخواست داده", code="Authorization: Bearer <accessToken>", n=3),
        dict(kind="self", lane=3, text=["scope اپ؟", "رکورد جزو entityIds؟"]),
        dict(kind="back", **{"from": 3, "to": 2}, text="پاسخ دیدار", code="data.Response"),
        dict(kind="back", **{"from": 2, "to": 1}, text="صفحه‌ی HTML یا پاسخ JSON اکستنشن"),
        dict(kind="back", **{"from": 1, "to": 0}, text="نتیجه را نشان می‌دهد"),
        dict(kind="self", lane=2, text=["token فقط تا پایان همین اجرا؛", "اجرای بعدی، launchCode تازه"], n=4),
    ]
    return sequence("drt", "جریان اجرای اکستنشن: از launchCode تا Runtime Token و درخواست داده", lanes, steps, width=920)


# ---------------------------------------------------------------- lifecycle overview
def lifecycle():
    uid = "dlc"
    stages = [
        ("ثبت", "Developer Hub", "یک‌بار · توسعه‌دهنده", "Client ID و secret"),
        ("نصب", "Callback URL", "یک‌بار برای هر کسب‌وکار", "BizDomainId و scopeها"),
        ("اجرا", "launchCode", "هر بار اجرای اکستنشن", "Runtime Token و context"),
        ("داده", "Bearer token", "در طول هر اجرا", "خواندن و نوشتن داده"),
    ]
    w, bw, gap = 860, 182, 44
    total = 4 * bw + 3 * gap
    x0 = (w - total) / 2
    body = []
    for i, (title, code, when, result) in enumerate(stages):
        x = w - x0 - bw - i * (bw + gap)  # first stage on the right
        body.append(f'<rect class="d-brand" x="{x}" y="14" width="{bw}" height="150" rx="14"/>')
        body.append(num(x + bw - 22, 38, i + 1))
        body.append(t(x + bw / 2, 44, title, size=17, weight=700))
        body.append(t(x + bw / 2, 66, code, "d-m", 11.5, rtl=False))
        body.append(f'<line x1="{x+16}" y1="82" x2="{x+bw-16}" y2="82" style="stroke:var(--brand-line)"/>')
        body.append(t(x + bw / 2, 106, when, "d-s", 12.5))
        body.append(t(x + bw / 2, 140, result, size=13))
        body.append(t(x + bw / 2, 124, "نتیجه:", "d-s", 11))
        if i < 3:
            body.append(f'<line class="d-arrow" x1="{x - 6}" y1="89" x2="{x - gap + 8}" y2="89" marker-end="url(#{uid}-a)"/>')
    return svg(w, 178, "چهار مرحله‌ی کار یک اپ دیدار: ثبت، نصب، اجرا، داده", body, uid)


# ---------------------------------------------------------------- proxy checks
def checks():
    uid = "dck"
    w = 760
    cx = 470
    body = []
    y = 16
    body.append(f'<rect class="d-brand" x="{cx-150}" y="{y}" width="300" height="56" rx="12"/>')
    body.append(t(cx, y + 24, "درخواست داده از سرور تو", weight=700))
    body.append(t(cx, y + 43, "Authorization: Bearer <Runtime Token>", "d-m", 11.5, rtl=False))
    y += 56
    q = [
        ("token معتبر و منقضی‌نشده است؟", "401", "launch تازه؛ token را refresh نکن"),
        ("اپ scope این داده را دارد؟", "403 PROXY_ACCESS_DENIED", "scope را در Developer Hub اضافه کن"),
        ("نوع رکورد با context می‌خواند؟", "403 RUNTIME_ENTITY_TYPE_DENIED", "از entityType همان اجرا"),
        ("شناسه جزو entityIds این اجراست؟", "403 RUNTIME_ENTITY_ACCESS_DENIED", "شناسه را فقط از context بگیر"),
    ]
    for question, code, fix in q:
        body.append(f'<line class="d-arrow" x1="{cx}" y1="{y+2}" x2="{cx}" y2="{y+30}" marker-end="url(#{uid}-a)"/>')
        body.append(t(cx + 10, y + 22, "بله", "d-s", 11.5, anchor="start"))
        y += 34
        body.append(f'<rect class="d-box" x="{cx-170}" y="{y}" width="340" height="44" rx="22"/>')
        body.append(t(cx, y + 27, question, size=13.5))
        # "no" branch to the left
        bx = 20
        body.append(f'<line class="d-back" x1="{cx-172}" y1="{y+22}" x2="{bx+232}" y2="{y+22}" marker-end="url(#{uid}-b)"/>')
        body.append(t(cx - 186, y + 15, "خیر", "d-s", 11.5, anchor="end"))
        body.append(f'<rect class="d-bad" x="{bx}" y="{y-6}" width="230" height="56" rx="10"/>')
        body.append(t(bx + 115, y + 15, code, "d-badt", 11.5, rtl=False))
        body.append(t(bx + 115, y + 36, fix, "d-s", 11.5))
        y += 44
    body.append(f'<line class="d-arrow" x1="{cx}" y1="{y+2}" x2="{cx}" y2="{y+30}" marker-end="url(#{uid}-a)"/>')
    body.append(t(cx + 10, y + 22, "بله", "d-s", 11.5, anchor="start"))
    y += 34
    body.append(f'<rect class="d-brand" x="{cx-150}" y="{y}" width="300" height="56" rx="12"/>')
    body.append(t(cx, y + 24, "درخواست به API دیدار می‌رود", weight=700))
    body.append(t(cx, y + 43, "200 · data.Response", "d-m", 11.5, rtl=False))
    y += 56
    return svg(w, y + 14, "بررسی‌های مارکت‌پلیس روی هر درخواست داده: token، scope و Runtime Context", body, uid)


if __name__ == "__main__":
    out = sys.argv[1]
    for name, fn in [("lifecycle", lifecycle), ("install-flow", install), ("runtime-flow", runtime), ("request-checks", checks)]:
        with open(f"{out}/{name}.svg", "w", encoding="utf8") as f:
            f.write(fn() + "\n")
        print(name)
