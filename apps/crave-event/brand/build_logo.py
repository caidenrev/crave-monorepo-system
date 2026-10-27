"""Generates the Crave Event logo masters (symbol, wordmark, lockups) as outlined SVG paths.

Run: python build_logo.py  -> writes into ./crave-event-logo/
All letters are drawn from round-capped lines and circular arcs (stroke 22 on a 100-unit x-height),
outlined here so the SVGs need no font.
"""
from math import cos, sin, radians, hypot
from pathlib import Path

OUT = Path(__file__).parent / "crave-event-logo"
OUT.mkdir(exist_ok=True)

BLUE = "#0A84FF"   # matches --accent in the app
RED = "#FF3B30"    # the "live" dot, matches --danger
INK = "#1D1D1F"    # matches --ink
WHITE = "#FFFFFF"

W = 22.0           # wordmark stroke width
R = W / 2


def f(n):
    return f"{n:.2f}".rstrip("0").rstrip(".")


def capsule(x1, y1, x2, y2, r=R):
    """Line with round caps, wound clockwise (screen coords)."""
    dx, dy = x2 - x1, y2 - y1
    L = hypot(dx, dy)
    nx, ny = dy / L * r, -dx / L * r  # normal chosen so the outline runs clockwise
    a = (x1 + nx, y1 + ny); b = (x2 + nx, y2 + ny)
    c = (x2 - nx, y2 - ny); d = (x1 - nx, y1 - ny)
    return (f"M{f(a[0])},{f(a[1])}L{f(b[0])},{f(b[1])}"
            f"A{f(r)},{f(r)} 0 0 1 {f(c[0])},{f(c[1])}"
            f"L{f(d[0])},{f(d[1])}A{f(r)},{f(r)} 0 0 1 {f(a[0])},{f(a[1])}Z")


def arc(cx, cy, rad, t0, t1, r=R):
    """Round-capped arc stroke from angle t0 to t1 (degrees, clockwise on screen)."""
    a0, a1 = radians(t0), radians(t1)
    big = 1 if (t1 - t0) > 180 else 0
    P = lambda rr, a: (cx + rr * cos(a), cy + rr * sin(a))
    o0, o1 = P(rad + r, a0), P(rad + r, a1)
    i0, i1 = P(rad - r, a0), P(rad - r, a1)
    return (f"M{f(o0[0])},{f(o0[1])}A{f(rad+r)},{f(rad+r)} 0 {big} 1 {f(o1[0])},{f(o1[1])}"
            f"A{f(r)},{f(r)} 0 0 1 {f(i1[0])},{f(i1[1])}"
            f"A{f(rad-r)},{f(rad-r)} 0 {big} 0 {f(i0[0])},{f(i0[1])}"
            f"A{f(r)},{f(r)} 0 0 1 {f(o0[0])},{f(o0[1])}Z")


# Glyphs on a 0..100 x-height (y=0 top of x-height, y=100 baseline). (draw, advance)
def g_c(): return [arc(50, 50, 39, 50, 310)], 100
def g_r(): return [capsule(11, 11, 11, 89), arc(50, 50, 39, 180, 285)], 64
def g_a(): return [arc(50, 50, 39, 20, 340), capsule(89, 11, 89, 89)], 100
def g_v(): return [capsule(11, 11, 45, 89), capsule(45, 89, 79, 11)], 90
def g_e(): return [arc(50, 50, 39, 40, 360), capsule(11, 50, 89, 50)], 100
def g_n(): return [capsule(11, 11, 11, 89), arc(50, 50, 39, 180, 360), capsule(89, 50, 89, 89)], 100
def g_t(): return [capsule(30, -30, 30, 60), arc(59, 60, 29, 90, 180),
                   capsule(59, 89, 72, 89), capsule(11, 11, 62, 11)], 83

GLYPHS = dict(c=g_c, r=g_r, a=g_a, v=g_v, e=g_e, n=g_n, t=g_t)
# Optical spacing (gap after each letter): round-to-round tighter, stems looser.
KERN = {"c": 16, "r": 12, "a": 14, "v": 12, "e": 14, "n": 18, "t": 0}
WORD_GAP = 46


def word(text, x0=0.0):
    parts, x = [], x0
    for ch in text:
        paths, adv = GLYPHS[ch]()
        parts.append(f'<g transform="translate({f(x)},0)"><path d="{"".join(paths)}"/></g>')
        x += adv + KERN[ch]
    return "".join(parts), x - KERN[text[-1]]


def wordmark_group(c1, c2):
    crave, end1 = word("crave")
    event, end2 = word("event", end1 + WORD_GAP)
    g = f'<g fill="{c1}">{crave}</g><g fill="{c2}">{event}</g>'
    return g, end2  # spans x 0..end2, y -41..100

# --- Symbol: C ring + live dot (256 canvas) ------------------------------------------
def ring(cx, cy, r_mid, half_w, open_deg):
    t0, t1 = open_deg, 360 - open_deg
    return arc(cx, cy, r_mid, t0, t1, half_w)

SYM_DX = -2  # optical centring of ring+dot on the canvas
SYMBOL_RING = ring(128 + SYM_DX, 128, 78, 21, 40)
SYMBOL_DOT = (210 + SYM_DX, 128, 22)
# Small-size cut: heavier ring, bigger dot, wider opening so the gap survives at 16 px.
SMALL_RING = ring(121, 128, 72, 26, 50)
SMALL_DOT = (207, 128, 26)


def symbol_group(ring_d, dot, ring_c, dot_c):
    cx, cy, r = dot
    return (f'<path fill="{ring_c}" d="{ring_d}"/>'
            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="{dot_c}"/>')


def svg(vw, vh, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(vw)} {f(vh)}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def write(name, content):
    (OUT / name).write_text(content, encoding="utf-8")
    print("wrote", OUT / name)


def build(theme):
    word_c1, word_c2 = (INK, BLUE) if theme == "light" else (WHITE, BLUE)
    sfx = "" if theme == "light" else "-dark"
    wm, wm_w = wordmark_group(word_c1, word_c2)
    sym = symbol_group(SYMBOL_RING, SYMBOL_DOT, BLUE, RED)

    # Wordmark only
    m = 24
    write(f"crave-event-wordmark{sfx}.svg",
          svg(wm_w + 2 * m, 141 + 2 * m, f'<g transform="translate({m},{41 + m})">{wm}</g>', "Crave Event"))

    # Horizontal: symbol ink 27..230 x 29..227; x-height 0.9 scale centred on symbol centre.
    s = 0.9
    wx = 230 + 44
    wy = 128 - 50 * s
    vw = wx + wm_w * s + 27
    write(f"crave-event-horizontal{sfx}.svg",
          svg(vw, 256, sym + f'<g transform="translate({f(wx)},{f(wy)}) scale({s})">{wm}</g>', "Crave Event"))

    # Stacked: symbol on top, wordmark below, centred.
    s2, k = 0.6, 1.4
    vw2 = wm_w * s2 + 60
    sx = (vw2 - 256 * k) / 2
    sym_bottom = 227 * k
    wy2 = sym_bottom + 52 + 41 * s2
    vh2 = wy2 + 100 * s2 + 36
    write(f"crave-event-stacked{sfx}.svg",
          svg(vw2, vh2, f'<g transform="translate({f(sx)},-16) scale({k})">{sym}</g>'
                        f'<g transform="translate(30,{f(wy2 - 16)}) scale({s2})">{wm}</g>', "Crave Event"))


build("light")
build("dark")
write("crave-event-symbol.svg", svg(256, 256, symbol_group(SYMBOL_RING, SYMBOL_DOT, BLUE, RED), "Crave Event"))
write("crave-event-symbol-small.svg", svg(256, 256, symbol_group(SMALL_RING, SMALL_DOT, BLUE, RED), "Crave Event"))
