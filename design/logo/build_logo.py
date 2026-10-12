"""Build the final Reeforge logo files into design/logo/final/.

The wordmark is converted to vector outlines (no font needed to display the
SVGs) from General Sans, shaped with HarfBuzz so kerning is applied.
PNGs are rendered with macOS Quick Look (qlmanage) and resized with sips.

Requirements (only to regenerate; the outputs are committed):
    python3 -m venv .venv && .venv/bin/pip install fonttools brotli uharfbuzz
    .venv/bin/python design/logo/build_logo.py
"""
import io
import math
import pathlib
import re
import shutil
import subprocess
import tempfile
import urllib.request

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

OUT = pathlib.Path(__file__).parent / "final"
FONTSHARE = "https://api.fontshare.com/v2/css?f[]=general-sans@{w}&display=swap"

# ---- Palette (DESIGN.md) ----
OCEAN = ("#1A7DB5", "#0C6496", "#0B4F7A")
EMBER = "#E0592A"
INK = "#121A22"
SEA = "#0C6496"            # "Finance" on light
SKY = "#6CC0EE"            # ring and "Finance" on dark
EMBER_ON_DARK = "#F27A4C"
PAPER = "#E6EDF3"          # wordmark on dark
EMBER_ON_ICON = "#FF9A70"

# ---- Symbol geometry (53 x 53 units, tight to the artwork) ----
# Ring of reef: radius 22, stroke 9, open from 17 to 73 degrees (bottom right).
# Ember: radius 5 at 45 degrees, centred in the opening with clear space on both sides.
SIZE = 53.0
C = SIZE / 2
R, STROKE = 22.0, 9.0
GAP_FROM, GAP_TO, EMBER_R = 17.0, 73.0, 5.0


def pt(angle, r=R):
    a = math.radians(angle)
    return C + r * math.cos(a), C + r * math.sin(a)


def symbol(ring, ember, gid=None, dx=0.0, dy=0.0):
    """Return SVG elements for the symbol. ring may be a colour or a gradient id."""
    x1, y1 = pt(GAP_TO)
    x2, y2 = pt(GAP_FROM)
    ex, ey = pt(45)
    stroke = f"url(#{gid})" if gid else ring
    defs = ""
    if gid:
        defs = (f'<linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="1">'
                f'<stop offset="0" stop-color="{OCEAN[0]}"/><stop offset=".55" stop-color="{OCEAN[1]}"/>'
                f'<stop offset="1" stop-color="{OCEAN[2]}"/></linearGradient>')
    g = (f'<g transform="translate({dx:.2f} {dy:.2f})">'
         f'<path d="M{x1:.2f} {y1:.2f}A{R:g} {R:g} 0 1 1 {x2:.2f} {y2:.2f}" fill="none" '
         f'stroke="{stroke}" stroke-width="{STROKE:g}" stroke-linecap="round"/>'
         f'<circle cx="{ex:.2f}" cy="{ey:.2f}" r="{EMBER_R:g}" fill="{ember}"/></g>')
    return defs, g


# ---- Wordmark outlines ----
def load_font(weight):
    css = urllib.request.urlopen(FONTSHARE.format(w=weight)).read().decode()
    url = "https:" + re.search(r"url\('(//[^']+\.woff2)'\)", css).group(1)
    data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})).read()
    font = TTFont(io.BytesIO(data))
    font.flavor = None
    buf = io.BytesIO()
    font.save(buf)
    return TTFont(io.BytesIO(buf.getvalue())), buf.getvalue()


def text_path(font, raw, text, size, x, baseline, tracking_em=0.0):
    """Shape `text` and return (svg path d, advance width) at `size` units."""
    face = hb.Face(raw)
    hbfont = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    upm = font["head"].unitsPerEm
    scale = size / upm
    glyphset = font.getGlyphSet()
    order = font.getGlyphOrder()
    d, cursor = [], 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pen = SVGPathPen(glyphset)
        tx = x + (cursor + pos.x_offset) * scale
        glyphset[order[info.codepoint]].draw(TransformPen(pen, (scale, 0, 0, -scale, tx, baseline)))
        d.append(pen.getCommands())
        cursor += pos.x_advance + tracking_em * upm
    return " ".join(d), (cursor - tracking_em * upm) * scale


def cap_height(font):
    return font["OS/2"].sCapHeight / font["head"].unitsPerEm


# ---- Files ----
def svg(w, h, body, defs="", title="Reeforge"):
    defs = f"<defs>{defs}</defs>" if defs else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" role="img" '
            f'aria-label="{title}"><title>{title}</title>{defs}{body}</svg>\n')


def lockup(fonts, word_color, finance_color, ring, ember, gid, with_finance):
    (bold, bold_raw), (medium, medium_raw) = fonts
    size = SIZE * 0.66                       # wordmark size relative to the symbol
    gap = SIZE * 0.30                        # symbol to wordmark
    baseline = C + cap_height(bold) * size / 2   # caps centred on the symbol
    x = SIZE + gap
    d1, w1 = text_path(bold, bold_raw, "Reeforge", size, x, baseline, -0.02)
    body = f'<path d="{d1}" fill="{word_color}"/>'
    width = x + w1
    if with_finance:
        x2 = width + size * 0.28
        d2, w2 = text_path(medium, medium_raw, "Finance", size, x2, baseline, -0.01)
        body += f'<path d="{d2}" fill="{finance_color}"/>'
        width = x2 + w2
    defs, mark = symbol(ring, ember, gid)
    title = "Reeforge Finance" if with_finance else "Reeforge"
    return svg(width + 0.5, SIZE, mark + body, defs, title)


def app_icon(rounded):
    s = 1024
    rx = 230 if rounded else 0
    k = s * 0.56 / SIZE                      # symbol fills 56% of the icon
    off = (s - SIZE * k) / 2
    defs = (f'<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{OCEAN[0]}"/>'
            f'<stop offset=".55" stop-color="{OCEAN[1]}"/><stop offset="1" stop-color="{OCEAN[2]}"/></linearGradient>')
    _, mark = symbol("#FFFFFF", EMBER_ON_ICON)
    body = (f'<rect width="{s}" height="{s}" rx="{rx}" fill="url(#bg)"/>'
            f'<g transform="translate({off:.2f} {off:.2f}) scale({k:.4f})">{mark}</g>')
    return svg(s, s, body, defs, "Reeforge app icon")


def favicon_svg():
    _, mark = symbol("var(--ring)", "var(--ember)")
    style = (f"<style>:root{{--ring:{OCEAN[1]};--ember:{EMBER}}}"
             f"@media (prefers-color-scheme: dark){{:root{{--ring:{SKY};--ember:{EMBER_ON_DARK}}}}}</style>")
    return svg(SIZE, SIZE, style + mark, title="Reeforge")


def png(src_svg, out_png, px):
    """Render with Quick Look at 1024 then resample down with sips for clean small sizes."""
    with tempfile.TemporaryDirectory() as tmp:
        tmp_svg = pathlib.Path(tmp) / "in.svg"
        tmp_svg.write_text(src_svg)
        subprocess.run(["qlmanage", "-t", "-s", "1024", "-o", tmp, str(tmp_svg)], check=True, capture_output=True)
        rendered = pathlib.Path(tmp) / "in.svg.png"
        shutil.copy(rendered, out_png)
    subprocess.run(["sips", "-z", str(px), str(px), str(out_png)], check=True, capture_output=True)


def main():
    OUT.mkdir(exist_ok=True)
    fonts = (load_font(600), load_font(500))
    files = {
        "reeforge-symbol.svg": svg(SIZE, SIZE, symbol(None, EMBER, "ocean")[1], symbol(None, EMBER, "ocean")[0]),
        "reeforge-symbol-reversed.svg": svg(SIZE, SIZE, symbol(SKY, EMBER_ON_DARK)[1]),
        "reeforge-symbol-black.svg": svg(SIZE, SIZE, symbol(INK, INK)[1]),
        "reeforge-symbol-white.svg": svg(SIZE, SIZE, symbol("#FFFFFF", "#FFFFFF")[1]),
        "reeforge-logo.svg": lockup(fonts, INK, SEA, None, EMBER, "ocean", False),
        "reeforge-logo-reversed.svg": lockup(fonts, PAPER, SKY, SKY, EMBER_ON_DARK, None, False),
        "reeforge-logo-black.svg": lockup(fonts, INK, INK, INK, INK, None, False),
        "reeforge-logo-white.svg": lockup(fonts, "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", None, False),
        "reeforge-finance-logo.svg": lockup(fonts, INK, SEA, None, EMBER, "ocean", True),
        "reeforge-finance-logo-reversed.svg": lockup(fonts, PAPER, SKY, SKY, EMBER_ON_DARK, None, True),
        "reeforge-finance-logo-black.svg": lockup(fonts, INK, INK, INK, INK, None, True),
        "reeforge-finance-logo-white.svg": lockup(fonts, "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", None, True),
        "app-icon.svg": app_icon(True),
        "app-icon-square.svg": app_icon(False),
        "favicon.svg": favicon_svg(),
    }
    for name, content in files.items():
        (OUT / name).write_text(content)
    png(files["reeforge-symbol.svg"], OUT / "favicon-32.png", 32)
    png(files["reeforge-symbol.svg"], OUT / "favicon-16.png", 16)
    png(files["app-icon-square.svg"], OUT / "apple-touch-icon.png", 180)
    png(files["app-icon-square.svg"], OUT / "icon-192.png", 192)
    png(files["app-icon-square.svg"], OUT / "icon-512.png", 512)
    png(files["app-icon.svg"], OUT / "app-icon-1024.png", 1024)
    print("\n".join(sorted(p.name for p in OUT.iterdir())))


if __name__ == "__main__":
    main()
