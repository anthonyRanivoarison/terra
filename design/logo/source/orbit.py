import math
from geom import Frame, arc, dot, line, stroke

def planet_gap(r, line_y, w, g):
    x = math.sqrt(r * r - line_y * line_y)
    a0 = math.degrees(math.atan2(line_y, x))
    tangent = math.radians(90) - math.atan2(line_y, x)
    half = math.degrees((w + g) / math.sin(tangent) / r)
    return a0, half

def orbit(frame, w=18, g=8, r=52, band=20, half_len=88, moon=0):
    a0, half = planet_gap(r, band, w, g)
    hide = math.sqrt((r + w + g) ** 2 - band ** 2)
    planet_front = [arc((0, 0), r, a0 + half, 180 - a0 - half)]
    planet_back = [arc((0, 0), r, 180 + a0 + half - 2 * a0, 360 - a0 - half + 2 * a0)]
    ring_path = [
        line((-hide, -band), (-half_len, -band)),
        arc((-half_len, 0), band, -90, -270),
        line((-half_len, band), (half_len, band)),
        arc((half_len, 0), band, 90, -90),
        line((half_len, -band), (hide, -band)),
    ]
    paths = [stroke(frame, planet_front, w), stroke(frame, planet_back, w), stroke(frame, ring_path, w)]
    if moon:
        paths.append(dot(frame, (half_len, 0), moon))
    return paths

def symbol(size=256, angle=-30, scale=0.98, **kw):
    fr = Frame(angle, size / 256 * scale, (size / 2, size / 2 + size * 0.01))
    return orbit(fr, **kw)
