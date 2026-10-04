"""Build the FishTech logo files from the brand specification.

Brand values come from blueacre-ops/docs/brand/brand-identity.md (BDR-0003).
The wordmark is set in Archivo and converted to outlines, so the files display
the same everywhere without the font installed.

Run:  python3 scripts/build-brand.py
Needs: fonttools, brotli (pip), and node_modules installed (for the Archivo font).
Writes SVG files to public/brand/. PNG icons are rendered by scripts/render-icons.mjs.
"""
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

TEAL = "#00707C"
DEEP = "#063A43"
GREEN = "#2FA866"
WHITE = "#FFFFFF"
BLACK = "#111111"

FONT = "node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2"
OUT = Path("public/brand")
OUT.mkdir(parents=True, exist_ok=True)

# The mark, on a 100-unit square. Water above, land below, split by a wave that keeps
# an even 6-unit gap. Two corners rounded (top left, bottom right) at radius 26.
MARK_TOP = ("M 26,0 L 100,0 L 100,44 C 86,48 68,44 56,52 C 38,64 22,42 0,54 "
            "L 0,26 A 26 26 0 0 1 26,0 Z")
MARK_BOTTOM = ("M 0,60 C 22,48 38,70 56,58 C 68,50 86,54 100,50 L 100,74 "
               "A 26 26 0 0 1 74,100 L 0,100 Z")


def instance(weight, width):
    font = TTFont(FONT)
    return instantiateVariableFont(font, {"wght": weight, "wdth": width})


def text_path(font, text, size, tracking=0.0):
    """Return (svg path data, advance width, cap height) for text at a given size."""
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font["head"].unitsPerEm
    scale = size / upm
    hmtx = font["hmtx"]
    x = 0.0
    parts = []
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x, 0))
        gs[name].draw(tpen)
        parts.append(pen.getCommands())
        x += hmtx[name][0] * scale + tracking * size
    cap = font["OS/2"].sCapHeight * scale
    return " ".join(p for p in parts if p), x - tracking * size, cap


def mark_group(top, bottom, x=0, y=0, size=100):
    s = size / 100
    return (f'<g transform="translate({x:.2f} {y:.2f}) scale({s:.4f})">'
            f'<path fill="{top}" d="{MARK_TOP}"/><path fill="{bottom}" d="{MARK_BOTTOM}"/></g>')


def write(name, w, h, body, title):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
           f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">'
           f"<title>{title}</title>{body}</svg>\n")
    (OUT / name).write_text(svg)


bold = instance(800, 92)
medium = instance(500, 100)

word_d, word_w, cap = text_path(bold, "FishTech", 64, tracking=-0.01)
desc_d, desc_w, _ = text_path(medium, "Aquaculture Services", 19, tracking=0.01)

# Horizontal lockup: mark 92 high, wordmark baseline aligned to the mark's optical centre.
MARK = 84
gap = 22
tx = MARK + gap
base = 54  # wordmark baseline
desc_base = base + 30
W = tx + max(word_w, desc_w) + 4
H = MARK + 6


def horizontal(mark_top, mark_bottom, word, desc, with_desc=True):
    body = mark_group(mark_top, mark_bottom, 0, 3, MARK)
    body += f'<path fill="{word}" transform="translate({tx} {base if with_desc else (MARK + 6 + cap) / 2})" d="{word_d}"/>'
    if with_desc:
        body += f'<path fill="{desc}" transform="translate({tx + 2} {desc_base})" d="{desc_d}"/>'
    return body


write("fishtech-logo.svg", W, H, horizontal(TEAL, GREEN, DEEP, TEAL), "FishTech, Aquaculture Services")
write("fishtech-logo-white.svg", W, H, horizontal(WHITE, GREEN, WHITE, WHITE), "FishTech, Aquaculture Services")
write("fishtech-logo-black.svg", W, H, horizontal(BLACK, BLACK, BLACK, BLACK), "FishTech, Aquaculture Services")
W2 = tx + word_w + 4
write("fishtech-wordmark.svg", W2, H, horizontal(TEAL, GREEN, DEEP, TEAL, with_desc=False), "FishTech")
write("fishtech-wordmark-white.svg", W2, H, horizontal(WHITE, GREEN, WHITE, WHITE, with_desc=False), "FishTech")

# Stacked lockup.
SW = max(word_w, desc_w) + 8
SM = 110
sx = (SW - SM) / 2
body = mark_group(TEAL, GREEN, sx, 0, SM)
body += f'<path fill="{DEEP}" transform="translate({(SW - word_w) / 2:.2f} {SM + 66})" d="{word_d}"/>'
body += f'<path fill="{TEAL}" transform="translate({(SW - desc_w) / 2:.2f} {SM + 98})" d="{desc_d}"/>'
write("fishtech-logo-stacked.svg", SW, SM + 108, body, "FishTech, Aquaculture Services")

# Mark alone.
write("fishtech-mark.svg", 100, 100, mark_group(TEAL, GREEN), "FishTech")
write("fishtech-mark-white.svg", 100, 100, mark_group(WHITE, GREEN), "FishTech")
write("fishtech-mark-black.svg", 100, 100, mark_group(BLACK, BLACK), "FishTech")

# App and profile icon: white and green mark on a teal tile.
tile = (f'<rect width="512" height="512" rx="112" fill="{TEAL}"/>'
        + mark_group(WHITE, GREEN, 106, 106, 300))
write("fishtech-icon.svg", 512, 512, tile, "FishTech")
circle = (f'<circle cx="256" cy="256" r="256" fill="{TEAL}"/>' + mark_group(WHITE, GREEN, 126, 126, 260))
write("fishtech-profile.svg", 512, 512, circle, "FishTech")

print("wrote", sorted(p.name for p in OUT.glob("*.svg")))
