import math
from pathlib import Path
from geom import Frame, f
from orbit import orbit
from wordmark import letters, TOP

OUT = Path(__file__).resolve().parent.parent / "kit"
MAIN = dict(r=60, band=30, half_len=80, w=18, g=7, moon=10)
SMALL = dict(r=60, band=30, half_len=84, w=22, g=6, moon=12)
INK = "#000000"

def doc(w, h, groups, title="Terra logo", y0=0):
    w, h = math.ceil(w), math.ceil(h)
    body = "".join(f'<g fill="{fill}">' + "".join(f'<path d="{d}"/>' for d in paths) + "</g>" for fill, paths in groups)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {f(y0)} {w} {h}" role="img"><title>{title}</title>{body}</svg>\n'

def symbol_paths(size, x, y, scale, params):
    return orbit(Frame(-30, size / 256 * scale, (x + size / 2, y + size / 2 + size * 0.01)), **params)

def words(x, baseline, scale):
    paths, end = letters(Frame(0, scale, (x, baseline)))
    return paths, x + end * scale

def build(ink=INK, mark=None):
    mark = mark or ink
    OUT.mkdir(exist_ok=True)
    files = {}
    files["terra-symbol.svg"] = doc(256, 256, [(mark, symbol_paths(256, 0, 0, 0.98, MAIN))])
    files["terra-symbol-small.svg"] = doc(256, 256, [(mark, symbol_paths(256, 0, 0, 0.95, SMALL))])
    wpaths, end = words(292, 166, 0.78)
    files["terra-horizontal.svg"] = doc(end + 16, 256, [(mark, symbol_paths(256, 0, 0, 0.98, MAIN)), (ink, wpaths)])
    sw = 478 * 0.72
    width = max(sw, 256) + 32
    wpaths, _ = words((width - sw) / 2, 256 + 12 - TOP * 0.72, 0.72)
    files["terra-stacked.svg"] = doc(width, 256 + 12 + 150 * 0.72 - 40 + 8, y0=40, groups=[(mark, symbol_paths(256, (width - 256) / 2, 0, 0.98, MAIN)), (ink, wpaths)])
    wpaths, end = words(4, -TOP + 4, 1)
    files["terra-wordmark.svg"] = doc(end + 4, 150, [(ink, wpaths)])
    return files

if __name__ == "__main__":
    for name, content in build().items():
        (OUT / name).write_text(content)
    palette = [("forest", "#1F6B3A", "#1F6B3A"), ("lime", "#F4F6F1", "#9BE15D")]
    for suffix, ink, mark in palette:
        for name, content in build(ink, mark).items():
            (OUT / name.replace(".svg", f"-{suffix}.svg")).write_text(content)
    print(sorted(p.name for p in OUT.iterdir()))
