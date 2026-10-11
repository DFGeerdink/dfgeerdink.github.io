#!/usr/bin/env python3
"""Split assets/img/Voyager_Golden_Record_Cover.svg into the parts used by the cover explainer.

Writes one cropped SVG per part to _includes/voyager/<part>.svg, plus the whole
cover (cover.svg) and the ghost overview (minimap.svg). Drawing works as for the
Pioneer plaque: every stroke gets pathLength="1" and its start time in --d.

Usage: python3 scripts/build_voyager_parts.py
"""
import math
import os
import re
import xml.etree.ElementTree as ET

from build_pioneer_parts import ROOT, NS, bbox_of, split_subpaths, timeline, render, crop, svg

SRC = os.path.join(ROOT, 'assets', 'img', 'Voyager_Golden_Record_Cover.svg')
OUT = os.path.join(ROOT, '_includes', 'voyager')

NO_OFFSET = (0, 0)
FULL = (168.75, 137.5, 375.25, 406.25)  # the cover's own viewBox
PULSAR_ORIGIN = (261.94, 434.715)       # where the pulsar lines meet
RECORD_CENTRE = (243.618, 213.418)      # centre of the record in the plan view
FINAL_SCALE = 0.3                       # time compression for the whole-cover finale

GEOMETRY = {
    'path': ('d',),
    'line': ('x1', 'y1', 'x2', 'y2'),
    'polyline': ('points',),
    'rect': ('x', 'y', 'width', 'height'),
    'circle': ('cx', 'cy', 'r'),
    'ellipse': ('cx', 'cy', 'rx', 'ry'),
}


def stroke_of(e, group):
    """Turn one SVG shape into a stroke dict (tag, attrs, bbox) for the shared helpers."""
    tag = e.tag.replace(NS, '')
    a = e.attrib
    num = lambda k: float(a[k])
    if tag == 'path':
        bbox = bbox_of([p for sub in split_subpaths(a['d']) for p in (sub['bbox'][:2], sub['bbox'][2:])])
    elif tag == 'line':
        bbox = bbox_of([(num('x1'), num('y1')), (num('x2'), num('y2'))])
    elif tag == 'polyline':
        vals = [float(v) for v in re.findall(r'-?[\d.]+', a['points'])]
        bbox = bbox_of(list(zip(vals[::2], vals[1::2])))
    elif tag == 'rect':
        bbox = (num('x'), num('y'), num('x') + num('width'), num('y') + num('height'))
    elif tag == 'circle':
        bbox = (num('cx') - num('r'), num('cy') - num('r'), num('cx') + num('r'), num('cy') + num('r'))
    else:
        bbox = (num('cx') - num('rx'), num('cy') - num('ry'), num('cx') + num('rx'), num('cy') + num('ry'))
    s = {'tag': tag, 'attrs': {k: a[k] for k in GEOMETRY[tag]}, 'bbox': bbox,
         'id': a.get('id', ''), 'group': group}
    # Shapes without a fill attribute are solid black in the original (dots, binary bars)
    if tag in ('rect', 'circle', 'ellipse') and 'fill' not in a:
        s['class'] = 'svg-anim-fill'
    return s


def load_strokes():
    """All shapes, in document order, tagged with their top-level group id."""
    root = ET.parse(SRC).getroot()
    strokes = []
    for group in root:
        if group.tag != NS + 'g' or group.get('id') == 'Background':
            continue
        for e in group.iter():
            if e.tag.replace(NS, '') in GEOMETRY:
                strokes.append(stroke_of(e, group.get('id')))
    return strokes


def centre(s):
    b = s['bbox']
    return ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)


def size(s):
    b = s['bbox']
    return math.hypot(b[2] - b[0], b[3] - b[1])


def around(point):
    return lambda s: math.atan2(centre(s)[1] - point[1], centre(s)[0] - point[0])


def define_parts(strokes):
    """Each part is a list of phases (strokes, step[, duration]); see timeline()."""
    group = lambda g: [s for s in strokes if s['group'] == g]
    by_id = {s['id']: s for s in strokes if s['id']}
    ids = lambda *names: [by_id[n] for n in names]
    left_to_right = lambda ss: sorted(ss, key=lambda s: centre(s)[0])
    rows = lambda ss: sorted(ss, key=lambda s: (round(centre(s)[1]), centre(s)[0]))

    pulsars = group('Pulsars')
    pulsar_lines = sorted([s for s in pulsars if size(s) > 15], key=around(PULSAR_ORIGIN))
    pulsar_ticks = sorted([s for s in pulsars if size(s) <= 15],
                          key=lambda s: math.dist(centre(s), PULSAR_ORIGIN))

    elevation = group('Record-Elevation-View')
    elevation_binary = [s for s in elevation if s['tag'] == 'line']
    elevation_brackets = ids('Rect-Left', 'Rect-Right')
    elevation_cartridge = [s for s in elevation
                           if s not in elevation_binary + elevation_brackets and s['id'] != 'Record-Disc']

    plan = group('Record-Plan-View')
    plan_record = ids('Record-Outer-Edge_2_', 'Record-Label-Area_2_', 'Record-Spindle-Hole_2_')
    plan_binary = sorted([s for s in plan if s['id'].startswith(('Zero_', 'One_'))], key=around(RECORD_CENTRE))
    plan_cartridge = [s for s in plan if s not in plan_record + plan_binary]

    video = group('Video-Waveform-And-Scan-Triggering')
    waveform, sawtooth = [s for s in video if s['tag'] == 'polyline']
    line_numbers = [s for s in video if s['tag'] == 'rect' and 'class' in s]
    scan_binary = [s for s in video if s['tag'] in ('line', 'rect') and 'class' not in s]
    wave_numbers = [s for s in line_numbers if centre(s)[1] < 180]
    saw_numbers = [s for s in line_numbers if centre(s)[1] > 180]
    saw_marks = [s for s in video if s['tag'] == 'ellipse']

    frames = group('Video-Image-Frames')
    scan_frame, circle_frame = sorted([s for s in frames if s['tag'] == 'rect'], key=lambda s: s['bbox'][1])
    scan_lines = [s for s in frames if s['tag'] == 'polyline']
    frame_binary = [s for s in frames if s['tag'] == 'line']
    test_circle = [s for s in frames if s['tag'] == 'circle']

    return {
        'hydrogen': {'phases': [(ids('Left-State_2_', 'Electron_4_', 'Proton_4_', 'Spin-Moment-Electron-Down_2_',
                                     'Spin-Moment-Proton_1_', 'Right-State_2_', 'Electron_1_', 'Proton_1_',
                                     'Spin-Moment-Electron-Up_2_', 'Spin-Moment-Proton_4_',
                                     'Transition-Horizontal-Line_2_', 'Transition-Vertical-Line_2_'), 0.4)]},
        'pulsars': {'phases': [(pulsar_lines, 0.2), (pulsar_ticks, 0.004)]},
        'elevation': {'phases': [(ids('Record-Disc'), 0, 1.0), (elevation_cartridge, 0.15),
                                 (elevation_brackets, 0.2), (rows(elevation_binary), 0.03)]},
        'plan': {'phases': [(plan_record, 0.3, 1.2), (plan_cartridge, 0.05), (plan_binary, 0.06)]},
        'signal': {'phases': [([waveform], 0, 3.0), (left_to_right(scan_binary), 0.05),
                              (left_to_right(wave_numbers), 0.2)]},
        'sawtooth': {'phases': [([sawtooth], 0, 2.0), (left_to_right(saw_marks), 0.2),
                                (left_to_right(saw_numbers), 0.2)], 'context': ['signal']},
        'scan': {'phases': [([scan_frame], 0, 0.8), (scan_lines, 0.3, 2.5), (rows(frame_binary), 0.05)],
                 'context': ['sawtooth']},
        'circle': {'phases': [([circle_frame], 0, 0.8), (test_circle, 0, 1.5)], 'context': ['scan']},
    }


def all_strokes(part):
    return [s for phase in part['phases'] for s in phase[0]]


def main():
    strokes = load_strokes()
    parts = define_parts(strokes)
    used = [id(s) for part in parts.values() for s in all_strokes(part)]
    assert sorted(used) == sorted(id(s) for s in strokes), 'every shape must belong to exactly one part'
    os.makedirs(OUT, exist_ok=True)

    # One cropped, animated SVG per part, with related parts as faint context
    for name, part in parts.items():
        drawn, end = timeline(part['phases'])
        context = [s for c in part.get('context', []) for s in all_strokes(parts[c])]
        body = ''.join(render(s, cls='plaque-context') for s in context)
        body += ''.join(render(s, d, dur=dur) for s, d, dur in drawn)
        viewbox = crop([s for s, _, _ in drawn] + context, NO_OFFSET)
        with open(os.path.join(OUT, name + '.svg'), 'w') as f:
            f.write(svg(viewbox, body, 'plaque-part', ' data-draw-time="%.2f"' % end, offset=NO_OFFSET))

    # The whole cover, every part drawn in turn at a faster pace
    body, t = '', 0.0
    for part in parts.values():
        drawn, t = timeline(part['phases'], t, FINAL_SCALE)
        body += ''.join(render(s, d, dur=dur) for s, d, dur in drawn)
    with open(os.path.join(OUT, 'cover.svg'), 'w') as f:
        f.write(svg(FULL, body, 'plaque-part plaque-full', ' data-draw-time="%.2f"' % t, offset=NO_OFFSET))

    # Ghost overview: one group per part
    body = ''.join('<g data-part="%s">%s</g>' % (name, ''.join(render(s) for s in all_strokes(part)))
                   for name, part in parts.items())
    with open(os.path.join(OUT, 'minimap.svg'), 'w') as f:
        f.write(svg(FULL, body, 'plaque-minimap-svg', stroke=2.5, offset=NO_OFFSET))

    for name, part in parts.items():
        print('%-10s %4d strokes' % (name, len(all_strokes(part))))


if __name__ == '__main__':
    main()
