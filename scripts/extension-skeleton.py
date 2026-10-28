"""Turn a Didar screenshot into a clean skeleton screen, keeping only the extension area as-is.

Everything outside the kept area is redrawn from geometry detected in the screenshot:
flat background regions, card outlines, uniform text bars and round avatars. Nothing from
the original pixels is reused there, so the result has no smudges or half-blurred icons.

Usage: python3 -I scripts/extension-skeleton.py SRC OUT "x0,y0,x1,y1[;...]" [--crop x0,y0,x1,y1] [--dim]
  --dim  darken everything outside the kept area (for screens where the extension is a modal)
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

ACCENT = (19, 179, 155)

# skeleton palette
PAGE = (247, 248, 250)
CARD_LINE = (226, 229, 234)
BAR_LIGHT = (225, 228, 233)     # text bars on light surfaces
BAR_DARK = (88, 92, 100)        # text bars on dark surfaces (top bar, side nav)
DARK = (52, 55, 61)


def region_color(lum):
    """Map a detected flat region's luminance to a calm skeleton tone."""
    if lum < 100:
        return DARK
    if lum > 236:
        return (255, 255, 255)
    v = int(232 + (lum - 100) / (236 - 100) * 18)  # 232..250
    return (v - 3, v - 2, v)


def skeleton(img: Image.Image) -> Image.Image:
    rgb = np.asarray(img.convert("RGB")).astype(np.float32)
    gray = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    H, W = gray.shape

    bg = ndi.median_filter(gray, size=25)
    ink0 = np.abs(gray - bg) > 26

    out = Image.new("RGB", (W, H), PAGE)
    d = ImageDraw.Draw(out)

    # Didar chrome: the dark top bar and the dark side nav on the right, detected as edge strips
    top_h = 0
    while top_h < H // 4 and np.median(bg[top_h]) < 100:
        top_h += 1
    nav_x = W
    while nav_x > W * 3 // 4 and np.median(bg[top_h:, nav_x - 1]) < 100:
        nav_x -= 1
    chrome_top = top_h if top_h > 20 else 0
    chrome_right = nav_x if W - nav_x > 20 else W

    # 1) flat regions (top bar, side nav, panels, colored bars, dimmed overlay), largest first
    q = np.round(bg / 14) * 14
    regions = []
    for level in np.unique(q):
        mask = ndi.binary_opening(q == level, structure=np.ones((5, 5)))
        lab, n = ndi.label(mask)
        if not n:
            continue
        areas = ndi.sum(mask, lab, range(1, n + 1))
        for i, sl in enumerate(ndi.find_objects(lab)):
            if sl is None or areas[i] < 1200:
                continue
            y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
            fill_ratio = areas[i] / ((y1 - y0) * (x1 - x0))
            if fill_ratio < 0.55:  # not rectangular enough to be a surface
                continue
            lum = float(level)
            if lum < 100:
                if y0 < chrome_top + 30 or x1 > chrome_right - 30:
                    continue  # badges and controls that belong to the chrome
                lum = 170.0  # dark/saturated elements (buttons, badges) → neutral block; chrome is drawn below
            regions.append((areas[i], (x0, y0, x1, y1), lum))
    regions.sort(key=lambda r: -r[0])
    surface = np.full((H, W), 245.0, dtype=np.float32)
    for _a, (x0, y0, x1, y1), lum in regions:
        dark = lum < 100
        radius = 0 if dark or (x1 - x0) > W * 0.8 else 10
        d.rounded_rectangle([x0, y0, x1 - 1, y1 - 1], radius=radius, fill=region_color(lum))
        surface[y0:y1, x0:x1] = lum
    if chrome_top:
        d.rectangle([0, 0, W - 1, chrome_top - 1], fill=DARK)
        surface[:chrome_top] = 40
    if chrome_right < W:
        d.rectangle([chrome_right, 0, W - 1, H - 1], fill=DARK)
        surface[:, chrome_right:] = 40

    # 2) card outlines and dividers: redraw each detected border segment as a crisp 1px line
    faint = np.abs(gray - bg) > 7  # card borders in Didar are very light
    hl = ndi.binary_opening(faint, structure=np.ones((1, 70)))
    vl = ndi.binary_opening(faint, structure=np.ones((70, 1)))
    lines = hl | vl
    for mask, horizontal in ((hl, True), (vl, False)):
        lab, _n = ndi.label(mask)
        for sl in ndi.find_objects(lab):
            if sl is None:
                continue
            y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
            if (y1 - y0) > 4 and (x1 - x0) > 4:
                continue  # a filled block, not a line
            if float(np.median(surface[y0:y1, x0:x1])) < 100:
                continue  # no outlines on the dark top bar / side nav
            color = CARD_LINE
            if horizontal:
                cy = (y0 + y1) // 2
                d.line([x0, cy, x1 - 1, cy], fill=color, width=1)
            else:
                cx = (x0 + x1) // 2
                d.line([cx, y0, cx, y1 - 1], fill=color, width=1)

    # 3) text and icons → uniform bars, avatars → circles
    ink = ink0 & ~ndi.binary_dilation(lines, iterations=2)
    ink = ndi.binary_opening(ink, structure=np.ones((2, 2)))  # drop specks
    ink = ndi.binary_dilation(ink, structure=np.ones((3, 9)))
    ink = ndi.binary_closing(ink, structure=np.ones((3, 15)))
    lab, _n = ndi.label(ink)
    for sl in ndi.find_objects(lab):
        if sl is None:
            continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        w, h = x1 - x0, y1 - y0
        if w < 10 or h < 7 or h > 90 or (h > 46 and w > 160):
            continue
        if x0 < chrome_right < x1 or y0 < chrome_top < y1:
            continue  # straddles the edge of the top bar / side nav (badges, shadows)
        on_dark = float(np.median(surface[y0:y1, x0:x1])) < 100
        color = BAR_DARK if on_dark else BAR_LIGHT
        if h >= 26 and 0.7 <= w / h <= 1.4:
            r = min(w, h) // 2
            cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
        elif h > 46:
            d.rounded_rectangle([x0, y0, x1, y1], radius=10, fill=color)
        else:
            bar_h = 10 if h >= 14 else 8
            cy = (y0 + y1) // 2
            d.rounded_rectangle([x0, cy - bar_h // 2, x1, cy + bar_h // 2], radius=bar_h // 2, fill=color)
    return out


def main():
    src, dst, regions = sys.argv[1], sys.argv[2], sys.argv[3]
    opts = sys.argv[4:]
    img = Image.open(src).convert("RGB")
    if "--crop" in opts:
        img = img.crop(tuple(int(v) for v in opts[opts.index("--crop") + 1].split(",")))
    out = skeleton(img)
    if "--dim" in opts:
        out = Image.blend(out, Image.new("RGB", out.size, (20, 22, 26)), 0.38)

    rects = [tuple(int(v) for v in r.split(",")) for r in regions.split(";")]
    shadow = Image.new("L", out.size, 0)
    sd = ImageDraw.Draw(shadow)
    for r in rects:
        sd.rounded_rectangle([r[0] - 4, r[1] + 4, r[2] + 4, r[3] + 12], radius=14, fill=90)
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    out = Image.composite(Image.new("RGB", out.size, (40, 44, 52)), out, shadow)

    for r in rects:
        out.paste(img.crop(r), r[:2])
    d = ImageDraw.Draw(out)
    for r in rects:
        d.rounded_rectangle([r[0] - 3, r[1] - 3, r[2] + 3, r[3] + 3], radius=10, outline=ACCENT, width=3)
    out.save(dst, optimize=True)


if __name__ == "__main__":
    main()
