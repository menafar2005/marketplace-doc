"""Turn a Didar screenshot into a skeleton screen, keeping only the extension area as-is.

Usage: python3 -I skeleton.py SRC OUT "x0,y0,x1,y1[;x0,y0,x1,y1]" [crop x0,y0,x1,y1]
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

ACCENT = (19, 179, 155)


def skeleton(img: Image.Image) -> Image.Image:
    rgb = np.asarray(img.convert("RGB")).astype(np.float32)
    gray = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)

    # flat background: what the screen looks like without text and icons
    bg = ndi.median_filter(gray, size=25)
    ink0 = np.abs(gray - bg) > 26

    # long thin lines are card borders / dividers, not content
    hlines = ndi.binary_opening(ink0, structure=np.ones((1, 70)))
    vlines = ndi.binary_opening(ink0, structure=np.ones((70, 1)))
    lines = hlines | vlines
    ink = ink0 & ~ndi.binary_dilation(lines, iterations=1)

    # merge glyphs into words/lines, then into skeleton bars
    ink = ndi.binary_dilation(ink, structure=np.ones((3, 9)), iterations=1)
    ink = ndi.binary_closing(ink, structure=np.ones((3, 15)))
    labels, n = ndi.label(ink)
    boxes = ndi.find_objects(labels)

    # desaturated, slightly lightened layout as the base
    base = np.clip(bg * 0.55 + 255 * 0.45, 0, 255)
    dark = bg < 90  # e.g. Didar's dark top bar and side nav
    base[dark] = bg[dark] * 0.7 + 40
    # faint card borders keep the screen's structure readable
    border = np.clip(base - 22, 0, 255)
    base = np.where(lines, border, base)
    out = Image.fromarray(np.stack([base] * 3, -1).astype(np.uint8))
    d = ImageDraw.Draw(out)

    for sl in boxes:
        if sl is None:
            continue
        y0, y1 = sl[0].start, sl[0].stop
        x0, x1 = sl[1].start, sl[1].stop
        h, w = y1 - y0, x1 - x0
        if w < 6 or h < 5:
            continue
        if h > 90 or (h > 46 and w > 160):
            continue  # not a text/icon-sized element
        local = float(np.median(bg[y0:y1, x0:x1]))
        fill = (int(local * 0.7 + 68),) * 3 if local < 90 else (int(max(local - 30, 0) * 0.55 + 255 * 0.45 - 12),) * 3
        if h > 46 and w > 46:
            # large graphics (avatars, illustrations): soft block
            d.rounded_rectangle([x0, y0, x1, y1], radius=min(h, w) // 5, fill=fill)
        else:
            bar_h = max(6, min(h - 2, 12))
            cy = (y0 + y1) // 2
            d.rounded_rectangle([x0, cy - bar_h // 2, x1, cy + bar_h // 2], radius=bar_h // 2, fill=fill)
    return out


def main():
    src, dst, regions = sys.argv[1], sys.argv[2], sys.argv[3]
    img = Image.open(src).convert("RGB")
    if len(sys.argv) > 4:
        img = img.crop(tuple(int(v) for v in sys.argv[4].split(",")))
    out = skeleton(img)

    rects = [tuple(int(v) for v in r.split(",")) for r in regions.split(";")]
    # soft shadow under the kept area
    shadow = Image.new("L", out.size, 0)
    sd = ImageDraw.Draw(shadow)
    for r in rects:
        sd.rounded_rectangle([r[0] - 4, r[1] + 2, r[2] + 4, r[3] + 10], radius=14, fill=110)
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    out = Image.composite(Image.new("RGB", out.size, (60, 66, 75)), out, shadow)

    for r in rects:
        out.paste(img.crop(r), r[:2])
    d = ImageDraw.Draw(out)
    for r in rects:
        d.rounded_rectangle([r[0] - 3, r[1] - 3, r[2] + 3, r[3] + 3], radius=10, outline=ACCENT, width=3)

    out.save(dst, optimize=True)


if __name__ == "__main__":
    main()
