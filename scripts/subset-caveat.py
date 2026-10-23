"""Subset the Caveat accent font to printable ASCII + curly quotes (it is used for one short line per page).
Run: python scripts/subset-caveat.py"""
from pathlib import Path
from fontTools import subset

root = Path(__file__).resolve().parent.parent
src = root / 'node_modules/@fontsource/caveat/files/caveat-latin-600-normal.woff2'
out = root / 'public/fonts/caveat-latin-600-normal.woff2'
opts = subset.Options()
opts.flavor = 'woff2'
opts.layout_features = ['kern', 'liga', 'calt']
font = subset.load_font(str(src), opts)
s = subset.Subsetter(opts)
s.populate(unicodes=list(range(0x20, 0x7F)) + [0x2018, 0x2019, 0x201C, 0x201D, 0x2014])
s.subset(font)
subset.save_font(font, str(out), opts)
print(out.name, out.stat().st_size, 'bytes')
