import subprocess
from pathlib import Path
from PIL import Image
from geom import Frame
from kit import MAIN, SMALL, doc
from orbit import orbit
from wordmark import letters, TOP

HERE = Path(__file__).resolve().parent
TARGET = HERE.parents[2] / "apps/web/components/brand/logo-paths.ts"
RENDER = Path.home() / ".claude/plugins/cache/logo-design-skill/logo-design/1.4.4/skills/logo-design/scripts/render_png.py"
SCALE = 4

def bbox(paths, w, h):
    tmp = HERE / "_bbox.svg"
    png = HERE / "_bbox.png"
    tmp.write_text(doc(w, h, [("#000", paths)]))
    subprocess.run(["python3", str(RENDER), str(tmp), "-o", str(png), "--width", str(w * SCALE), "--height", str(h * SCALE)], check=True, capture_output=True)
    box = Image.open(png).getchannel("A").getbbox()
    tmp.unlink()
    png.unlink()
    return [round(v / SCALE - (1 if i < 2 else -1)) for i, v in enumerate(box)]

def symbol(params):
    return orbit(Frame(-30, 1, (128, 130)), **params)

def entry(name, paths, w, h):
    x0, y0, x1, y1 = bbox(paths, w, h)
    body = ",\n".join(f'    "{d}"' for d in paths)
    return f'export const {name} = {{\n  viewBox: "{x0} {y0} {x1 - x0} {y1 - y0}",\n  paths: [\n{body},\n  ],\n}}\n'

words, end = letters(Frame(0, 1, (12, -TOP + 4)))
out = "\n".join([
    entry("ORBIT", symbol(MAIN), 256, 260),
    entry("ORBIT_SMALL", symbol(SMALL), 256, 260),
    entry("WORDMARK", words, int(end) + 28, 160),
])
TARGET.write_text(out)
print(TARGET, len(out))
