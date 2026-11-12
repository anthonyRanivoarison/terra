import math

def f(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s

class Frame:
    def __init__(self, angle=0.0, scale=1.0, origin=(0.0, 0.0)):
        self.a = math.radians(angle)
        self.s = scale
        self.o = origin

    def p(self, x, y):
        c, s = math.cos(self.a), math.sin(self.a)
        return (self.o[0] + self.s * (x * c - y * s), self.o[1] + self.s * (x * s + y * c))

def line(p, q):
    return ("L", p, q)

def arc(c, r, a0, a1):
    return ("A", c, r, math.radians(a0), math.radians(a1))

def _pt(c, r, a):
    return (c[0] + r * math.cos(a), c[1] + r * math.sin(a))

def _start_end(seg):
    if seg[0] == "L":
        return seg[1], seg[2]
    _, c, r, a0, a1 = seg
    return _pt(c, r, a0), _pt(c, r, a1)

def _tangent(seg, at_end):
    if seg[0] == "L":
        dx, dy = seg[2][0] - seg[1][0], seg[2][1] - seg[1][1]
        n = math.hypot(dx, dy)
        return dx / n, dy / n
    _, c, r, a0, a1 = seg
    a = a1 if at_end else a0
    s = 1 if a1 > a0 else -1
    return -s * math.sin(a), s * math.cos(a)

def _offset(seg, d):
    if seg[0] == "L":
        tx, ty = _tangent(seg, False)
        nx, ny = -ty, tx
        p, q = seg[1], seg[2]
        return ("L", (p[0] + d * nx, p[1] + d * ny), (q[0] + d * nx, q[1] + d * ny))
    _, c, r, a0, a1 = seg
    s = 1 if a1 > a0 else -1
    return ("A", c, r - s * d, a0, a1)

def _reverse(seg):
    if seg[0] == "L":
        return ("L", seg[2], seg[1])
    _, c, r, a0, a1 = seg
    return ("A", c, r, a1, a0)

class Pen:
    def __init__(self, frame):
        self.fr = frame
        self.out = []

    def P(self, pt):
        x, y = self.fr.p(*pt)
        return f"{f(x)} {f(y)}"

    def seg(self, seg):
        if seg[0] == "L":
            self.out.append(f"L{self.P(seg[2])}")
            return
        _, c, r, a0, a1 = seg
        sweep = 1 if a1 > a0 else 0
        large = 1 if abs(a1 - a0) > math.pi else 0
        self.out.append(f"A{f(r * self.fr.s)} {f(r * self.fr.s)} 0 {large} {sweep} {self.P(_pt(c, r, a1))}")

    def cap(self, center, frm, to, via):
        r = math.hypot(frm[0] - center[0], frm[1] - center[1])
        a = math.atan2(frm[1] - center[1], frm[0] - center[0])
        m = math.atan2(via[1] - center[1], via[0] - center[0])
        sweep = 1 if (m - a) % (2 * math.pi) < math.pi else 0
        self.out.append(f"A{f(r * self.fr.s)} {f(r * self.fr.s)} 0 0 {sweep} {self.P(to)}")

def stroke(frame, segs, w):
    d = w / 2
    pen = Pen(frame)
    left = [_offset(s, d) for s in segs]
    right = [_offset(_reverse(s), d) for s in reversed(segs)]
    start = _start_end(left[0])[0]
    pen.out.append(f"M{pen.P(start)}")
    for s in left:
        pen.seg(s)
    end = _start_end(segs[-1])[1]
    tx, ty = _tangent(segs[-1], True)
    pen.cap(end, _start_end(left[-1])[1], _start_end(right[0])[0], (end[0] + d * tx, end[1] + d * ty))
    for s in right:
        pen.seg(s)
    begin = _start_end(segs[0])[0]
    tx, ty = _tangent(segs[0], False)
    pen.cap(begin, _start_end(right[-1])[1], start, (begin[0] - d * tx, begin[1] - d * ty))
    pen.out.append("Z")
    return "".join(pen.out)

def ring(frame, c, r, w):
    d = w / 2
    pen = Pen(frame)
    def circle(rad, sweep):
        a = (c[0] + rad, c[1])
        b = (c[0] - rad, c[1])
        R = f(rad * frame.s)
        return f"M{pen.P(a)}A{R} {R} 0 1 {sweep} {pen.P(b)}A{R} {R} 0 1 {sweep} {pen.P(a)}Z"
    return circle(r + d, 1) + circle(r - d, 0)

def svg(paths, w, h, fill="#000", bg=None, rx=0):
    rect = f'<rect width="{f(w)}" height="{f(h)}" rx="{f(rx)}" fill="{bg}"/>' if bg else ""
    body = "".join(f'<path d="{d}"/>' for d in paths)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}">{rect}<g fill="{fill}">{body}</g></svg>\n'

def dot(frame, c, r):
    pen = Pen(frame)
    a = (c[0] + r, c[1])
    b = (c[0] - r, c[1])
    R = f(r * frame.s)
    return f"M{pen.P(a)}A{R} {R} 0 1 1 {pen.P(b)}A{R} {R} 0 1 1 {pen.P(a)}Z"
