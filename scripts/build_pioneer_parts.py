#!/usr/bin/env python3
"""Split assets/img/Pioneer_plaque.svg into the parts used by the plaque explainer.

Writes one cropped SVG per part to _includes/pioneer/<part>.svg, plus the full
plaque (plaque.svg), the ghost overview (minimap.svg) and the line-art version
of assets/img/pioneer_10.svg (pioneer-10.svg).

Every stroke gets pathLength="1" so CSS can draw it with stroke-dashoffset 1 -> 0
(https://css-tricks.com/a-trick-that-makes-drawing-svg-lines-way-easier/), and an
inline --d custom property holding its animation start time.

Usage: python3 scripts/build_pioneer_parts.py
"""
import math
import os
import re
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'img', 'Pioneer_plaque.svg')
CRAFT_SRC = os.path.join(ROOT, 'assets', 'img', 'pioneer_10.svg')
OUT = os.path.join(ROOT, '_includes', 'pioneer')

NS = '{http://www.w3.org/2000/svg}'
OFFSET = (78.879613, 1.2731172)   # translate() shared by all drawing groups
PULSAR_ORIGIN = (775, 1215)       # where the pulsar lines meet
LINE_DURATION = 0.5               # matches the line-anim duration in main.css
STROKE_RATIO = 0.0035             # stroke width as a fraction of the viewBox width
PADDING = 0.06                    # crop padding as a fraction of the part size
MIN_ASPECT = 0.3                  # crop height is at least this fraction of the width
FINAL_SCALE = 0.3                 # time compression for the full-plaque finale
CRAFT_BBOX = (742, 335, 1649, 1684)  # drawing bounds of pioneer_10.svg (measured with getBBox)
CRAFT_STEP = 0.015                # stagger between the craft's strokes
CRAFT_STROKE = 2.2                # craft stroke width multiplier, for white lines on dark


# --- Path parsing -------------------------------------------------------------

ARGS = {'m': 2, 'l': 2, 'h': 1, 'v': 1, 'c': 6, 's': 4, 'a': 7, 'z': 0}


def split_subpaths(d):
    """Return the subpaths of d as absolute path strings with their bboxes."""
    tokens = re.findall(r'[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?', d)
    i = 0
    cx = cy = sx = sy = 0.0
    cmd = None
    out = []
    cur = None
    while i < len(tokens):
        if tokens[i].isalpha():
            cmd = tokens[i]
            i += 1
        lc, rel = cmd.lower(), cmd.islower()
        if lc == 'z':
            cur['d'].append('Z')
            cx, cy = sx, sy
            continue
        a = [float(x) for x in tokens[i:i + ARGS[lc]]]
        i += ARGS[lc]
        if lc == 'm':
            x, y = (cx + a[0], cy + a[1]) if rel else (a[0], a[1])
            cur = {'d': ['M%.2f,%.2f' % (x, y)], 'pts': [(x, y)]}
            out.append(cur)
            cx, cy = sx, sy = x, y
            cmd = 'l' if rel else 'L'  # implicit lineto after moveto
            continue
        if lc in 'lhv':
            if lc == 'l':
                x, y = (cx + a[0], cy + a[1]) if rel else (a[0], a[1])
            elif lc == 'h':
                x, y = (cx + a[0] if rel else a[0]), cy
            else:
                x, y = cx, (cy + a[0] if rel else a[0])
            cur['d'].append('L%.2f,%.2f' % (x, y))
            cur['pts'].append((x, y))
        elif lc == 's':
            pts = [(cx + a[k], cy + a[k + 1]) if rel else (a[k], a[k + 1]) for k in (0, 2)]
            cur['d'].append('S' + ' '.join('%.2f,%.2f' % p for p in pts))
            cur['pts'].extend(pts)
            x, y = pts[1]
        elif lc == 'c':
            pts = [(cx + a[k], cy + a[k + 1]) if rel else (a[k], a[k + 1]) for k in (0, 2, 4)]
            cur['d'].append('C' + ' '.join('%.2f,%.2f' % p for p in pts))
            cur['pts'].extend(pts)
            x, y = pts[2]
        elif lc == 'a':
            x, y = (cx + a[5], cy + a[6]) if rel else (a[5], a[6])
            cur['d'].append('A%g,%g %g %d %d %.2f,%.2f' % (a[0], a[1], a[2], a[3], a[4], x, y))
            cur['pts'] += [(x - a[0], y - a[1]), (x + a[0], y + a[1])]
        cx, cy = x, y
    return [{'d': ''.join(s['d']), 'bbox': bbox_of(s['pts'])} for s in out]


def bbox_of(pts):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return (min(xs), min(ys), max(xs), max(ys))


def apply_matrix(transform, bbox):
    m = re.match(r'matrix\(([^)]*)\)', transform or '')
    if not m:
        return bbox
    a, b, c, d, e, f = [float(v) for v in m.group(1).split(',')]
    corners = [(x, y) for x in (bbox[0], bbox[2]) for y in (bbox[1], bbox[3])]
    return bbox_of([(a * x + c * y + e, b * x + d * y + f) for x, y in corners])


def load_elements():
    """Return {'P<n>': [stroke, ...], 'C<n>': [stroke]} in document order.

    Pn is the nth <path>, Cn the nth <circle>. Paths are split into subpaths,
    so a stroke is a dict with tag, attrs and bbox (before OFFSET).
    """
    tree = ET.parse(SRC)
    els = {}
    counts = {'path': 0, 'circle': 0}
    for e in tree.getroot().iter():
        tag = e.tag.replace(NS, '')
        if tag not in counts:
            continue
        key = ('P' if tag == 'path' else 'C') + str(counts[tag])
        counts[tag] += 1
        transform = e.get('transform')
        if tag == 'path':
            strokes = []
            for sub in split_subpaths(e.get('d')):
                attrs = {'d': sub['d']}
                if transform:
                    attrs['transform'] = transform
                strokes.append({'tag': 'path', 'attrs': attrs,
                                'bbox': apply_matrix(transform, sub['bbox'])})
            els[key] = strokes
        else:
            cx, cy, r = float(e.get('cx')), float(e.get('cy')), float(e.get('r'))
            attrs = {'cx': e.get('cx'), 'cy': e.get('cy'), 'r': e.get('r')}
            if transform:
                attrs['transform'] = transform
            els[key] = [{'tag': 'circle', 'attrs': attrs,
                         'bbox': apply_matrix(transform, (cx - r, cy - r, cx + r, cy + r))}]
    return els


# --- Part definitions ---------------------------------------------------------

def size(s):
    b = s['bbox']
    return math.hypot(b[2] - b[0], b[3] - b[1])


def centre(s):
    b = s['bbox']
    return ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)


def from_origin(s):
    x, y = centre(s)
    return math.hypot(x - PULSAR_ORIGIN[0], y - PULSAR_ORIGIN[1])


def angle(s):
    x, y = centre(s)
    return math.atan2(y - PULSAR_ORIGIN[1], x - PULSAR_ORIGIN[0])


def define_parts(els):
    """Each part is a list of phases (strokes, step between stroke starts).

    Phases play one after another. 'context' names parts shown faintly behind
    this part in its own cropped view.
    """
    one = lambda *keys: [s for k in keys for s in els[k]]
    big = els['P17']  # pulsars, galactic centre, spacecraft and height bracket in one path
    pick = lambda *idx: [big[i] for i in idx]

    spacecraft = set(range(0, 8))
    height = {8, 9, 10, 11, 466, 467, 468}
    galactic = {462, 463, 464, 465}
    pulsar = [s for i, s in enumerate(big) if i not in spacecraft | height | galactic]
    pulsar_lines = sorted([s for s in pulsar if size(s) > 25], key=angle)
    pulsar_ticks = sorted([s for s in pulsar if size(s) <= 25], key=from_origin)

    for k in ('P0', 'P1', 'P3', 'P10'):
        els[k][0]['class'] = 'svg-anim-fill'

    solar_bodies = sorted(one('C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'P12', 'C7', 'C8', 'C9'),
                          key=lambda s: centre(s)[0])

    return {
        'hydrogen': {'phases': [(one('P5', 'P4', 'P0', 'P2', 'P3', 'P11', 'P8', 'P1', 'P9', 'P10', 'P6'), 0.4)]},
        'unit': {'phases': [(one('P7'), 0.4)], 'context': ['hydrogen']},
        'humans': {'phases': [(one('P23', 'P21', 'P22'), 0.03), (one('P20', 'P18', 'P19'), 0.03)]},
        'height': {'phases': [(pick(8, 468), 0.4), (pick(467, 11, 10, 9, 466), 0.2)], 'context': ['humans']},
        'spacecraft': {'phases': [(pick(7, 5, 6, 2, 1, 4, 0, 3), 0.3)], 'context': ['humans']},
        'pulsars': {'phases': [(pulsar_lines, 0.2), (pulsar_ticks, 0.004)]},
        'galactic-centre': {'phases': [(pick(462, 463, 464, 465), 0.3)], 'context': ['pulsars', 'humans']},
        'solar-system': {'phases': [(one('C0'), 0.4), (solar_bodies, 0.2)]},
        'planet-distances': {'phases': [(sorted(one('P15'), key=lambda s: centre(s)[0]), 0.012)],
                             'context': ['solar-system']},
        'trajectory': {'phases': [(one('P13', 'P16', 'P14'), 0.4)], 'context': ['solar-system']},
    }


# --- Output -------------------------------------------------------------------

def timeline(phases, start=0.0, scale=1.0):
    """Return [(stroke, delay, duration)] and the time the last stroke finishes.

    A phase is (strokes, step) or (strokes, step, duration) for strokes that
    should draw slower than LINE_DURATION, such as one long waveform.
    """
    out = []
    t = start
    for phase in phases:
        strokes, step = phase[:2]
        dur = phase[2] if len(phase) > 2 else LINE_DURATION
        for i, s in enumerate(strokes):
            out.append((s, t + i * step * scale, dur))
        t += ((len(strokes) - 1) * step + dur) * scale
    return out, t


def render(s, delay=None, cls=None, dur=None):
    attrs = dict(s['attrs'])
    animated = delay is not None
    classes = [c for c in ('plaque-stroke' if animated else None, s.get('class') if animated else None, cls) if c]
    if classes:
        attrs['class'] = ' '.join(classes)
    if animated:
        attrs['pathLength'] = '1'
        attrs['style'] = '--d:%.3fs' % delay
        if dur is not None and abs(dur - LINE_DURATION) > 1e-6:
            attrs['style'] += ';--dur:%.2fs' % dur
    body = ' '.join('%s="%s"' % kv for kv in attrs.items())
    return '<%s %s/>' % (s['tag'], body)


def crop(strokes, offset=OFFSET):
    x0, y0, x1, y1 = bbox_of([p for s in strokes for p in (s['bbox'][:2], s['bbox'][2:])])
    pad = PADDING * max(x1 - x0, y1 - y0)
    x0, y0, x1, y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    w, h = x1 - x0, y1 - y0
    if h < MIN_ASPECT * w:
        y0 -= (MIN_ASPECT * w - h) / 2
        h = MIN_ASPECT * w
    return x0 + offset[0], y0 + offset[1], w, h


def svg(viewbox, body, cls, extra='', stroke=None, offset=OFFSET):
    x, y, w, h = viewbox
    return ('<svg class="%s" viewBox="%.1f %.1f %.1f %.1f"%s xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
            '<g transform="translate(%g,%g)" stroke-width="%.2f">%s</g></svg>\n'
            % (cls, x, y, w, h, extra, offset[0], offset[1], stroke or w * STROKE_RATIO, body))


def all_strokes(part):
    return [s for phase in part['phases'] for s in phase[0]]


# --- Pioneer 10 line art ------------------------------------------------------

def craft_fill(fill):
    """Map an original fill to (fill, opacity) for faint shading on the dark backdrop."""
    if fill in (None, 'none'):
        return None
    if fill.startswith('url('):
        return fill.replace('url(#', 'url(#p10-'), 0.25
    r, g, b = (int(fill[i:i + 2], 16) / 255 for i in (1, 3, 5))
    if r - b > 0.25:  # the gold magnetometer boom and RTG trusses
        return 'var(--plaque-gold)', 0.9
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return 'white', max(0.03, min(0.22, 0.22 * (lum - 0.55) / 0.45))


def build_craft():
    """Turn the Pioneer 10 drawing into animated white line art with faint fills."""
    xlink = '{http://www.w3.org/1999/xlink}href'
    root = ET.parse(CRAFT_SRC).getroot()
    defs = ''
    for grad in root.iter():
        tag = grad.tag.replace(NS, '')
        if 'Gradient' not in tag:
            continue
        attrs = {k.replace(xlink, 'href'): v for k, v in grad.attrib.items()}
        attrs['id'] = 'p10-' + attrs['id']
        if 'href' in attrs:
            attrs['href'] = attrs['href'].replace('#', '#p10-')
        stops = ''.join('<stop offset="%s" style="%s"/>' % (s.get('offset'), s.get('style', ''))
                        for s in grad if s.tag == NS + 'stop')
        defs += '<%s %s>%s</%s>' % (tag, ' '.join('%s="%s"' % kv for kv in attrs.items()), stops, tag)

    count = [0]

    def walk(e):
        out = ''
        for child in e:
            tag = child.tag.replace(NS, '')
            transform = child.get('transform')
            t = ' transform="%s"' % transform if transform else ''
            if tag == 'g':
                out += '<g%s>%s</g>' % (t, walk(child))
            elif tag == 'path':
                style = dict(kv.split(':', 1) for kv in child.get('style', '').split(';') if ':' in kv)
                width = float(style.get('stroke-width', 1)) * CRAFT_STROKE
                css = '--d:%.3fs' % (count[0] * CRAFT_STEP)
                fill = craft_fill(style.get('fill'))
                if fill:
                    css += ';--fill:%s;--fo:%.2f' % fill
                count[0] += 1
                out += ('<path class="plaque-stroke" d="%s"%s stroke-width="%.1f" pathLength="1" style="%s"/>'
                        % (child.get('d'), t, width, css))
        return out

    body = walk(root)
    end = (count[0] - 1) * CRAFT_STEP + LINE_DURATION
    x, y, w, h = CRAFT_BBOX
    pad = PADDING * max(w, h)
    with open(os.path.join(OUT, 'pioneer-10.svg'), 'w') as f:
        f.write('<svg class="plaque-part plaque-craft" viewBox="%.1f %.1f %.1f %.1f" data-draw-time="%.2f" '
                'style="--fill-delay:%.2fs" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
                '<defs>%s</defs>%s</svg>\n' % (x - pad, y - pad, w + 2 * pad, h + 2 * pad, end, end, defs, body))
    return count[0]


def main():
    els = load_elements()
    parts = define_parts(els)
    os.makedirs(OUT, exist_ok=True)

    # One cropped, animated SVG per part, with related parts as faint context
    for name, part in parts.items():
        drawn, end = timeline(part['phases'])
        context = [s for c in part.get('context', []) for s in all_strokes(parts[c])]
        body = ''.join(render(s, cls='plaque-context') for s in context)
        body += ''.join(render(s, d, dur=dur) for s, d, dur in drawn)
        viewbox = crop([s for s, _, _ in drawn] + context)
        with open(os.path.join(OUT, name + '.svg'), 'w') as f:
            f.write(svg(viewbox, body, 'plaque-part', ' data-draw-time="%.2f"' % end))

    # The whole plaque, every part drawn in turn at a faster pace
    body, t = '', 0.0
    for part in parts.values():
        drawn, t = timeline(part['phases'], t, FINAL_SCALE)
        body += ''.join(render(s, d, dur=dur) for s, d, dur in drawn)
    full = (0, 0, 3063.3, 2427.2)  # the plaque's own size
    with open(os.path.join(OUT, 'plaque.svg'), 'w') as f:
        f.write(svg(full, body, 'plaque-part plaque-full', ' data-draw-time="%.2f"' % t))

    # Ghost overview: one group per part, paths merged to keep the DOM small
    body = ''
    for name, part in parts.items():
        strokes = all_strokes(part)
        plain = [s for s in strokes if s['tag'] == 'path' and 'transform' not in s['attrs']]
        merged = '<path d="%s"/>' % ''.join(s['attrs']['d'] for s in plain) if plain else ''
        body += '<g data-part="%s">%s%s</g>' % (
            name, merged, ''.join(render(s) for s in strokes if s not in plain))
    with open(os.path.join(OUT, 'minimap.svg'), 'w') as f:
        f.write(svg(full, body, 'plaque-minimap-svg', stroke=20))

    for name, part in parts.items():
        print('%-18s %4d strokes' % (name, len(all_strokes(part))))
    print('%-18s %4d strokes' % ('pioneer-10', build_craft()))


if __name__ == '__main__':
    main()
