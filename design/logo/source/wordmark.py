from geom import arc, line, ring, stroke

W = 20
X = 90
R = X / 2
GAP = 34

def letters(frame, x=0.0):
    out = []

    def t(x):
        out.append(stroke(frame, [line((x, -122), (x, -28)), arc((x + 28, -28), 28, 180, 90), line((x + 28, 0), (x + 38, 0))], W))
        out.append(stroke(frame, [line((x - 22, -X), (x + 34, -X))], W))
        return x + 38

    def e(x):
        c = (x + R, -R)
        out.append(stroke(frame, [line((x, -R), (x + 2 * R, -R))], W))
        out.append(stroke(frame, [arc(c, R, 0, -320)], W))
        return x + 2 * R

    def r(x):
        out.append(stroke(frame, [line((x, -X), (x, 0))], W))
        out.append(stroke(frame, [line((x, -46), (x, -52)), arc((x + 38, -52), 38, 180, 285)], W))
        return x + 48

    def a(x):
        out.append(ring(frame, (x + R, -R), R, W))
        out.append(stroke(frame, [line((x + 2 * R, -X), (x + 2 * R, 0))], W))
        return x + 2 * R

    x = t(x + 22) + GAP + 4
    x = e(x) + GAP
    x = r(x) + GAP - 4
    x = r(x) + GAP - 4
    x = a(x)
    return out, x + W / 2

WIDTH = 478
TOP = -132
HEIGHT = 142
