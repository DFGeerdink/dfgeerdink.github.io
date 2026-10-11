---
layout: post
title: "The Pioneer Plaque"
date: 2026-10-09 10:00:00
image: '/assets/img/Pioneer_plaque.svg'
description: "An interactive guide to the Pioneer plaque, the engraved message NASA sent beyond the Solar System in 1972, decoded one element at a time."
category: 'technology'
tags:
- technology
- Voyager Golden Records
explainer: true
---

Before the Voyager probes carried their Golden Records out of the Solar System in 1977, NASA had already sent a message along with Pioneer 10 and 11: a gold-anodised aluminium plaque designed by Carl Sagan and Frank Drake, with artwork by Linda Salzman Sagan. Its picture language returns on the cover of the Voyager records, which reuse the plaque's hydrogen key and pulsar map. Scroll down to walk through the plaque one element at a time.

<!-- Diagrams are generated from assets/img/Pioneer_plaque.svg by scripts/build_pioneer_parts.py -->
<div class="gr-backdrop explainer">
    <nav class="plaque-minimap" aria-label="Plaque overview">
        {% include pioneer/minimap.svg %}
        <div class="plaque-minimap-label"></div>
    </nav>

    <section class="explainer-step" id="plaque-hydrogen" data-part="hydrogen">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">01</span>Hydrogen</div>
            <div class="explainer-text">
                <div class="explainer-text-final">This diagram shows the two lowest energy states of the <strong>hydrogen atom</strong>, the most common element in the universe.<br>The vertical lines with the dots mark the spins of the proton and the electron: in one state they are aligned, in the other they are opposed.<br>When the spin flips, the atom emits radio waves at 1420 MHz, with a wavelength of 21 cm and a period of 0.7 nanoseconds. This transition is the fundamental clock and ruler for everything else on the plaque.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/hydrogen.svg %}
    </section>

    <section class="explainer-step" id="plaque-unit" data-part="unit">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">02</span>The unit</div>
            <div class="explainer-text">
                <div class="explainer-text-final">The short vertical stroke below the line between the two states is the binary digit <strong>1</strong>.<br>It sets the units for the rest of the plaque: one unit of length is 21 cm, and one unit of time is 0.7 nanoseconds.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/unit.svg %}
    </section>

    <section class="explainer-step" id="plaque-humans" data-part="humans">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">03</span>The senders</div>
            <div class="explainer-text">
                <div class="explainer-text-final">On the right stand a <strong>man and a woman</strong>, showing what the senders look like.<br>The man raises his right hand in greeting, a gesture that also shows the opposable thumb and how our limbs move.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/humans.svg %}
    </section>

    <section class="explainer-step" id="plaque-height" data-part="height">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">04</span>Height</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Next to the woman, a bracket marks her <strong>height</strong>. Between its ends sits the binary number 1000: eight.<br>Eight times the hydrogen unit of 21 cm gives 168 cm.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/height.svg %}
    </section>

    <section class="explainer-step" id="plaque-spacecraft" data-part="spacecraft">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">05</span>The spacecraft</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Behind the figures is the outline of the <strong>Pioneer spacecraft</strong> itself, drawn at the same scale.<br>Whoever finds the probe can measure it and work out how tall we are, even without decoding the binary.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/spacecraft.svg %}
    </section>

    <section class="explainer-step" id="plaque-pulsars" data-part="pulsars">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">06</span>Pulsar map</div>
            <div class="explainer-text">
                <div class="explainer-text-final">On the left, fourteen lines radiate from the Sun. Each points to a <strong>pulsar</strong>, a spinning neutron star that sends out radio pulses as regular as a clock.<br>The length of each line shows the pulsar's relative distance from the Sun, and the tick at its end shows its height above or below the galactic plane.<br>The long binary numbers along the lines are the pulsar periods, counted in hydrogen time units. Because pulsars slow down over time, these periods also reveal when the probe was launched.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/pulsars.svg %}
    </section>

    <section class="explainer-step" id="plaque-galactic-centre" data-part="galactic-centre">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">07</span>Galactic centre</div>
            <div class="explainer-text">
                <div class="explainer-text-final">A fifteenth line runs far to the right, behind the human figures. It shows the Sun's relative distance to the <strong>centre of the Milky Way</strong>.<br>With this many reference points, a finder could triangulate our position, even if they only recognised some of the pulsars.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/galactic-centre.svg %}
    </section>

    <section class="explainer-step" id="plaque-solar-system" data-part="solar-system">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">08</span>Solar System</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Along the bottom lies our <strong>Solar System</strong>: the Sun on the left, followed by the nine planets known in 1972, from Mercury out to Pluto.<br>Saturn is recognisable by its ring.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/solar-system.svg %}
    </section>

    <section class="explainer-step" id="plaque-planet-distances" data-part="planet-distances">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">09</span>Planet distances</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Above and below the planets, binary numbers give each planet's <strong>distance from the Sun</strong>, in units of one tenth of Mercury's orbit.<br>Here the binary is written with I for one and – for zero.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/planet-distances.svg %}
    </section>

    <section class="explainer-step" id="plaque-trajectory" data-part="trajectory">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">10</span>Trajectory</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Finally, a small image of the spacecraft leaves the third planet, swings past Jupiter and heads out of the Solar System: the <strong>trajectory</strong> of the probe that carries the plaque.<br>The same plaque flew on Pioneer 11, whose path does not match the drawing: after launch it was redirected towards Saturn.<br>The arrow is also the most criticised symbol on the plaque: it may only mean "this way" to a civilisation that once hunted with pointed projectiles.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/trajectory.svg %}
    </section>

    <section class="explainer-step" id="plaque-plaque" data-part="plaque">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">11</span>The whole plaque</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Put together, the plaque tells whoever finds it <strong>who</strong> sent it, <strong>where</strong> from, and <strong>when</strong>.<br>Five years later, Voyager 1 and 2 carried the same hydrogen key and pulsar map on the covers of their Golden Records.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include pioneer/plaque.svg %}
    </section>

    <section class="explainer-step" id="plaque-object" data-part="object">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">12</span>The object</div>
            <div class="explainer-text">
                <div class="explainer-text-final">The message itself is a <strong>gold-anodised aluminium plate</strong>, slightly larger than a sheet of A5 paper.<br>It is attached to the antenna support struts of Pioneer 10, where it is shielded from erosion by interstellar dust.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
            <dl class="explainer-specs">
                <div style="--i:0"><dt>Material</dt><dd>6061-T6 aluminium, gold-anodised</dd></div>
                <div style="--i:1"><dt>Size</dt><dd>229 × 152 mm (9 × 6 in)</dd></div>
                <div style="--i:2"><dt>Thickness</dt><dd>1.27 mm</dd></div>
                <div style="--i:3"><dt>Engraving</dt><dd>0.381 mm deep on average</dd></div>
                <div style="--i:4"><dt>Mass</dt><dd>About 120 g</dd></div>
                <div style="--i:5"><dt>Design</dt><dd>Carl Sagan and Frank Drake, artwork by Linda Salzman Sagan</dd></div>
                <div style="--i:6"><dt>Launched</dt><dd>Pioneer 10, 2 March 1972; Pioneer 11, 5 April 1973</dd></div>
            </dl>
        </div>
        {% include pioneer/pioneer-10.svg %}
    </section>
</div>


## Sources and links

- Wikipedia, [Pioneer plaque](https://en.wikipedia.org/wiki/Pioneer_plaque): the main source for the meaning of each element and the plaque's physical properties.
- Wikipedia, [Pioneer 10](https://en.wikipedia.org/wiki/Pioneer_10): launch, mission and spacecraft details.
- Vsauce, [Messages For The Future](https://www.youtube.com/watch?v=GDrBIKOR01c): how the plaque's units, pulsar map and trajectory work, and the criticism of its arrow.
- Plaque drawing: NASA, public domain, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pioneer_plaque.svg).
- Pioneer 10 drawing: public domain, derivative of a NASA systems diagram by Lsanabria, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pioneer_10_Diagram_%28No_labels%29.svg).
- The line-drawing animation uses the `pathLength` technique from [CSS-Tricks](https://css-tricks.com/a-trick-that-makes-drawing-svg-lines-way-easier/).
- The companion post on [the Voyager Golden Record](/The-Voyager-Golden-Record/), whose cover reuses this plaque's hydrogen key and pulsar map.
