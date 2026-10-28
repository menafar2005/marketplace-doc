"""Flowchart images for the Didar marketplace docs (English labels, simple boxes and diamonds).

Writes one SVG per flow; scripts/render-flowcharts.cjs turns them into PNGs in public/images/flows.
Run: python3 -I scripts/flowcharts.py OUT_DIR
Text: lines are lists; wrap a part in **…** to make it bold.
"""
import re
import sys
from html import escape

GREEN, GREEN_EDGE = "#22a54b", "#14532d"
BLUE, BLUE_EDGE = "#2f74d6", "#14325c"
RED, RED_EDGE = "#d9483b", "#6b1d16"
INK = "#111827"
FONT = "Inter, 'DejaVu Sans', Arial, sans-serif"


class Chart:
    def __init__(self, w, h):
        self.w, self.h, self.parts = w, h, []

    # ---- text ----------------------------------------------------------------
    def _line(self, x, y, line, color, size, anchor="middle", base_weight=500):
        spans = []
        for i, chunk in enumerate(re.split(r"\*\*", line)):
            if not chunk:
                continue
            weight = 700 if i % 2 else base_weight
            spans.append(f'<tspan font-weight="{weight}">{escape(chunk)}</tspan>')
        return (f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" text-anchor="{anchor}" '
                f'font-family="{FONT}">{"".join(spans)}</text>')

    def text(self, x, y, lines, color="#ffffff", size=15, lh=20, anchor="middle", base_weight=500):
        y0 = y - (len(lines) - 1) * lh / 2 + size * 0.35
        for i, line in enumerate(lines):
            self.parts.append(self._line(x, y0 + i * lh, line, color, size, anchor, base_weight))

    def note(self, x, y, lines, anchor="middle"):
        self.text(x, y, lines, INK, 13, 17, anchor, 400)

    # ---- nodes ---------------------------------------------------------------
    def box(self, cx, cy, w, h, lines, kind="step"):
        fill, edge = {"start": (GREEN, GREEN_EDGE), "step": (BLUE, BLUE_EDGE), "error": (RED, RED_EDGE)}[kind]
        self.parts.append(f'<rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}" rx="7" fill="{fill}" stroke="{edge}" stroke-width="2.4"/>')
        self.text(cx, cy, lines)
        return dict(cx=cx, cy=cy, top=cy - h / 2, bottom=cy + h / 2, left=cx - w / 2, right=cx + w / 2)

    def diamond(self, cx, cy, hw, hh, lines):
        pts = f"{cx},{cy-hh} {cx+hw},{cy} {cx},{cy+hh} {cx-hw},{cy}"
        self.parts.append(f'<polygon points="{pts}" fill="{BLUE}" stroke="{BLUE_EDGE}" stroke-width="2.4" stroke-linejoin="round"/>')
        self.text(cx, cy, lines, size=14.5, lh=19)
        return dict(cx=cx, cy=cy, top=cy - hh, bottom=cy + hh, left=cx - hw, right=cx + hw)

    # ---- edges ---------------------------------------------------------------
    def arrow(self, *pts, label=None, at=None, head=True):
        d = "M" + " L".join(f"{x},{y}" for x, y in pts)
        mk = ' marker-end="url(#arr)"' if head else ""
        self.parts.append(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="2"{mk}/>')
        if label:
            lx, ly = at
            self.parts.append(self._line(lx, ly, f"**{label}**", INK, 14.5, "middle"))

    def svg(self):
        defs = (f'<defs><marker id="arr" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
                f'<path d="M0 0L10 5L0 10z" fill="{INK}"/></marker></defs>')
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}">'
                f'<rect width="100%" height="100%" fill="#ffffff"/>{defs}{"".join(self.parts)}</svg>')


def down(c, a, b, **kw):
    c.arrow((a["cx"], a["bottom"]), (b["cx"], b["top"]), **kw)


# --------------------------------------------------------------------------- flows
def installation():
    c = Chart(820, 1460)
    X = 250
    a = c.box(X, 50, 300, 50, ["Admin opens your **install link**"], "start")
    c.note(X, 108, ["Didar shows the app, its maker, the requested", "scopes and which users get access"])
    b = c.box(X, 170, 300, 50, ["Allow & Install"], "start")
    c.arrow((X, a["bottom"]), (X, 86))
    c.arrow((X, 130), (X, b["top"]))
    c.note(X, 222, ["Use the **state** param. for additional security"])
    r = c.box(X, 290, 300, 62, ["Didar redirects to your **Callback URL**", "with **code** & **state**"], "start")
    c.arrow((X, b["bottom"]), (X, 208))
    c.arrow((X, 236), (X, r["top"]))

    s = c.diamond(X, 440, 140, 82, ["Does **state** match", "the session?"])
    down(c, r, s)
    rej = c.box(610, 440, 230, 62, ["Reject the request", "(don't complete install)"], "error")
    c.arrow((s["right"], 440), (rej["left"], 440), label="No", at=(422, 430))

    ex = c.box(X, 610, 320, 62, ["Exchange **code**: POST", "**CompleteInstallation**"])
    c.arrow((X, s["bottom"]), (X, ex["top"]), label="Yes", at=(X + 24, 545))

    ok = c.diamond(X, 760, 120, 72, ["Succeeded?"])
    down(c, ex, ok)
    err = c.box(610, 760, 230, 62, ["Show an error;", "admin installs again"], "error")
    c.arrow((ok["right"], 760), (err["left"], 760), label="No", at=(410, 750))

    st = c.box(X, 905, 320, 62, ["Store installation by **BizDomainId**", "(ApiKey encrypted, scopes)"])
    c.arrow((X, ok["bottom"]), (X, st["top"]), label="Yes", at=(X + 24, 853))

    li = c.diamond(X, 1060, 140, 82, ["Is the admin logged", "in to your app?"])
    down(c, st, li)

    acc = c.diamond(570, 1060, 130, 78, ["Has an account", "on your app?"])
    c.arrow((li["right"], 1060), (acc["left"], 1060), label="No", at=(415, 1050))
    cr = c.box(570, 1205, 230, 56, ["Create an account"])
    c.arrow((570, acc["bottom"]), (570, cr["top"]), label="No", at=(594, 1160))
    lg = c.box(570, 1290, 230, 50, ["Admin logs in"])
    c.arrow((acc["right"], 1060), (775, 1060), (775, 1290), (lg["right"], 1290), label="Yes", at=(752, 1050))
    c.arrow((570, cr["bottom"]), (570, lg["top"]))

    link = c.box(X, 1290, 320, 56, ["Link the installation to the account"])
    c.arrow((X, li["bottom"]), (X, link["top"]), label="Yes", at=(X + 24, 1190))
    c.arrow((lg["left"], 1290), (link["right"], 1290))

    end = c.box(X, 1405, 320, 62, ["Redirect to a page to finish", "setup (e.g. your app settings)"], "start")
    down(c, link, end)
    return c


def runtime():
    c = Chart(820, 1240)
    X = 270
    a = c.box(X, 50, 340, 50, ["User opens your **extension** in Didar"], "start")
    b = c.box(X, 150, 340, 62, ["Didar calls your extension URL", "with a one-time **launchCode**"], "start")
    down(c, a, b)
    c.note(X, 212, ["GET https://your-app…/launch?launchCode=…"])
    t = c.box(X, 285, 340, 62, ["POST **/api/v1/runtime/token**", "launchCode + clientId + clientSecret"])
    c.arrow((X, b["bottom"]), (X, 196))
    c.arrow((X, 228), (X, t["top"]))

    ok = c.diamond(X, 435, 120, 72, ["Succeeded?"])
    down(c, t, ok)
    e1 = c.box(630, 435, 260, 76, ["Return an error message;", "user opens the extension", "again (new launchCode)"], "error")
    c.arrow((ok["right"], 435), (e1["left"], 435), label="No", at=(445, 425))

    ctx = c.box(X, 590, 340, 62, ["Read **context**: target, entityType,", "entityIds, payload"])
    c.arrow((X, ok["bottom"]), (X, ctx["top"]), label="Yes", at=(X + 24, 535))

    ok2 = c.diamond(X, 745, 145, 82, ["Context and payload", "as expected?"])
    down(c, ctx, ok2)
    e2 = c.box(630, 745, 260, 62, ["Return an error message", "(don't call the API)"], "error")
    c.arrow((ok2["right"], 745), (e2["left"], 745), label="No", at=(455, 735))

    api = c.box(X, 905, 340, 62, ["Call the data API with", "**Authorization: Bearer** token"])
    c.arrow((X, ok2["bottom"]), (X, api["top"]), label="Yes", at=(X + 24, 853))
    res = c.box(X, 1025, 340, 62, ["Return the result to Didar", "(HTML page or JSON message)"])
    down(c, api, res)
    end = c.box(X, 1150, 340, 62, ["Drop the token; the next run", "starts with a new **launchCode**"], "start")
    down(c, res, end)
    return c


def checks():
    c = Chart(860, 1060)
    X = 260
    a = c.box(X, 50, 340, 62, ["Your server sends a data request", "**Authorization: Bearer** Runtime Token"], "start")
    qs = [
        (["Token valid and", "not expired?"], ["**401**", "Open the extension again"]),
        (["App has the", "required scope?"], ["**403** PROXY_ACCESS_DENIED", "Add the scope in Developer Hub"]),
        (["Record type matches", "the context?"], ["**403** RUNTIME_ENTITY_TYPE_DENIED", "Use context.entityType"]),
        (["Record ID in", "context.entityIds?"], ["**403** RUNTIME_ENTITY_ACCESS_DENIED", "Take IDs only from the context"]),
    ]
    prev, y = a, 205
    for i, (q, err) in enumerate(qs):
        d = c.diamond(X, y, 150, 78, q)
        label = "Yes" if i else None
        c.arrow((X, prev["bottom"]), (X, d["top"]), label=label, at=(X + 24, (prev["bottom"] + d["top"]) / 2 + 5))
        e = c.box(645, y, 340, 62, err, "error")
        c.arrow((d["right"], y), (e["left"], y), label="No", at=(440, y - 10))
        prev, y = d, y + 205
    end = c.box(X, y - 15, 340, 62, ["Forwarded to Didar", "**200** · data.Response"], "start")
    c.arrow((X, prev["bottom"]), (X, end["top"]), label="Yes", at=(X + 24, (prev["bottom"] + end["top"]) / 2 + 5))
    c.h = y + 40
    return c


def lifecycle():
    c = Chart(1100, 196)
    stages = [
        (["**1. Register**", "in Developer Hub"], ["Once", "Client ID & secret"], "start"),
        (["**2. Install**", "Callback URL"], ["Once per business", "BizDomainId & scopes"], "step"),
        (["**3. Launch**", "launchCode"], ["Every time a user", "opens an extension"], "step"),
        (["**4. Data**", "Bearer Runtime Token"], ["During each run", "read & write Didar data"], "step"),
    ]
    w, gap, x0 = 215, 60, 40
    for i, (title, notes, kind) in enumerate(stages):
        cx = x0 + w / 2 + i * (w + gap)
        c.box(cx, 70, w, 76, title, kind)
        c.note(cx, 150, notes)
        if i < 3:
            c.arrow((cx + w / 2, 70), (cx + w / 2 + gap - 2, 70))
    return c


if __name__ == "__main__":
    out = sys.argv[1]
    for name, fn in [("lifecycle", lifecycle), ("installation-flow", installation), ("runtime-flow", runtime), ("request-checks", checks)]:
        with open(f"{out}/{name}.svg", "w", encoding="utf8") as f:
            f.write(fn().svg())
        print(name)
