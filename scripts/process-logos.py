"""Make transparent, trimmed logo files and favicons from brand-assets/.

Flood-fills the cream background from the four corners (tolerance ~18 RGB),
feathers the edge by 1 px, trims, and exports PNG + WebP at 1x and 2x.
Run: python scripts/process-logos.py
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "brand-assets"
OUT = ROOT / "public" / "brand"
OUT.mkdir(parents=True, exist_ok=True)
CREAM = (0xFD, 0xF4, 0xE5)
TOL = 18


def find(stem):
    for ext in ("png", "jpg", "jpeg"):
        p = SRC / f"{stem}.{ext}"
        if p.exists():
            return p
    raise SystemExit(f"Missing brand-assets/{stem}.(jpg|jpeg|png)")


def make_transparent(path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    mask = Image.new("L", (w, h), 255)
    m = mask.load()
    seen = bytearray(w * h)
    q = deque()
    for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        q.append((x, y))
        seen[y * w + x] = 1
    bg = px[0, 0]
    while q:
        x, y = q.popleft()
        r, g, b = px[x, y]
        if max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2])) > TOL:
            continue
        m[x, y] = 0
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                seen[ny * w + nx] = 1
                q.append((nx, ny))
    mask = mask.filter(ImageFilter.GaussianBlur(1))  # 1 px feather
    rgba = im.convert("RGBA")
    rgba.putalpha(mask)
    return rgba.crop(rgba.getbbox())


def export(img, name, heights):
    for i, hgt in enumerate(heights, start=1):
        wdt = round(img.width * hgt / img.height)
        r = img.resize((wdt, hgt), Image.LANCZOS)
        r.save(OUT / f"{name}@{i}x.png", optimize=True)
        r.save(OUT / f"{name}@{i}x.webp", quality=90, method=6)
        print(f"{name}@{i}x {wdt}x{hgt}")


wide = make_transparent(find("unnati-logo-wide"))
square = make_transparent(find("unnati-logo-square"))
export(wide, "logo-wide", (64, 128))
export(wide, "logo-wide-lg", (200, 400))  # OG card, 404 etc.

# Emblem = the circular tree, left of the first fully empty column gap.
alpha = square.getchannel("A")
w, h = square.size
cols = [alpha.crop((x, 0, x + 1, h)).getextrema()[1] for x in range(w)]
gap = next(x for x in range(int(w * 0.2), int(w * 0.6)) if cols[x] < 20)
emblem = square.crop((0, 0, gap, h))
emblem = emblem.crop(emblem.getbbox())
export(emblem, "emblem", (160, 320))

for size in (32, 180, 192, 512):
    canvas = Image.new("RGBA", (size * 4, size * 4), (0, 0, 0, 0))
    ImageDraw.Draw(canvas).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=CREAM + (255,))
    inner = int(size * 4 * 0.78)
    scale = inner / max(emblem.size)
    e = emblem.resize((round(emblem.width * scale), round(emblem.height * scale)), Image.LANCZOS)
    canvas.alpha_composite(e, ((size * 4 - e.width) // 2, (size * 4 - e.height) // 2))
    canvas = canvas.resize((size, size), Image.LANCZOS)
    name = "apple-touch-icon.png" if size == 180 else f"favicon-{size}.png"
    canvas.save(OUT / name, optimize=True)
    print(name)

# Masters for astro:assets (AVIF/WebP + srcset generated at build time).
ASSETS = ROOT / "src" / "assets" / "brand"
ASSETS.mkdir(parents=True, exist_ok=True)
for name in ("logo-wide", "emblem"):
    Image.open(OUT / f"{name}@2x.png").save(ASSETS / f"{name}.png", optimize=True)
