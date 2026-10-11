---
layout: post
title: "The Voyager Golden Record"
date: 2026-10-11 10:00:00
image: '/assets/img/Voyager_Golden_Record_Cover.svg'
description: "An interactive guide to the cover of the Voyager Golden Record: how to play a record sent into interstellar space, and how to turn its sound back into pictures."
category: 'technology'
tags:
- technology
- Voyager Golden Records
explainer: true
---

In 1977, Voyager 1 and 2 left Earth with a gold-plated copper record on board, filled with greetings, music, sounds and pictures from our planet. Long after the probes fall silent, they will keep sailing through space at almost 60,000 km/h, in the hope that someone, someday, intercepts one. Whoever does will also need to know how to play it, so the record's aluminium cover is engraved with instructions written in diagrams and binary numbers. The artist Jon Lomberg, who helped curate the record and designed the cover, had to balance two requirements that are at odds: every diagram had to be as easy to understand as possible, while still packing in as much information as possible. The cover builds on the [Pioneer plaque](/The-Pioneer-Plaque/) and goes one step further: it explains not only where the record came from, but how to get the sound off it and turn it back into images. Scroll down to decode the cover one diagram at a time, the way the Verge Science team did by hand.

<!-- Diagrams are generated from assets/img/Voyager_Golden_Record_Cover.svg by scripts/build_voyager_parts.py -->
<div class="gr-backdrop explainer">
    <nav class="plaque-minimap" aria-label="Cover overview">
        {% include voyager/minimap.svg %}
        <div class="plaque-minimap-label"></div>
    </nav>

    <section class="explainer-step" id="cover-hydrogen" data-part="hydrogen">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">01</span>Hydrogen</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Decoding starts at the bottom right, with the most abundant element in the universe: <strong>hydrogen</strong>. Once in a blue moon, roughly once every 10 million years for a single atom, its electron spontaneously flips its spin.<br>That hyperfine transition releases a tiny bit of energy as a radio wave of 1420 MHz: the 21-centimetre line astronomers use to map our galaxy.<br>Converted into time, one wave lasts 7.04 × 10⁻¹⁰ seconds, or 0.7 nanoseconds. That single number unlocks every other symbol on the cover.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include voyager/hydrogen.svg %}
    </section>

    <section class="explainer-step" id="cover-pulsars" data-part="pulsars">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">02</span>Pulsar Map</div>
            <div class="explainer-text">
                <div class="explainer-text-final">The largest design on the cover is the <strong>pulsar map</strong>, the same one that appears on the Pioneer plaque.<br>Fourteen lines run from our Sun to fourteen pulsars, collapsed stars that send out pulses of radiation with clock-like regularity. The binary code along each line gives the frequency of its pulses, which lets a finder triangulate where our Solar System is.<br>The map does not help to play the record, but it tells whoever finds it where in the universe it came from.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include voyager/pulsars.svg %}
    </section>

    <section class="explainer-step" id="cover-elevation" data-part="elevation">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">03</span>Elevation view</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Every other symbol explains how to <strong>play the record</strong>. Seen from the side, the record lies flat with the cartridge and stylus resting on its outer edge, ready to play from the outside in.<br>The binary number below it uses | for one and — for zero. Converted to decimal and multiplied by the 0.7-nanosecond hydrogen constant, it gives 3,229 seconds: roughly 53.8 minutes of playing time.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include voyager/elevation.svg %}
    </section>

    <section class="explainer-step" id="cover-plan" data-part="plan">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">04</span>Top-down view</div>
            <div class="explainer-text">
                <div class="explainer-text-final">From above, the cover shows the record with the cartridge that was mounted next to it on the spacecraft.<br>The broken ring around the edge is another binary number. Multiplied by 0.7 nanoseconds, it gives about 3.59 seconds: the time for <strong>one rotation</strong>, or roughly 16⅔ revolutions per minute.<br>Spin the record at that speed and it plays like any record on Earth: greetings in 55 languages, music from around the world, and sounds of oceans, birds, thunder and whales.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include voyager/plan.svg %}
    </section>

    <section class="explainer-step" id="cover-signal" data-part="signal">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">05</span>Signal decoding</div>
            <div class="explainer-text">
                <div class="explainer-text-final">The pictures are harder. The Voyagers' computers had only 69 kilobytes of memory, barely enough for a single image, and there are no JPEGs on the record. Instead, the <strong>image data is hidden in the audio waveform</strong> itself, much like an analog television signal.<br>This diagram shows how to break that waveform up: each sharp drop marks the start of a new section, numbered 1, 2 and 3 in binary.<br>The binary number below gives the length of each section: about 8 milliseconds.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include voyager/signal.svg %}
    </section>

    <section class="explainer-step" id="cover-sawtooth" data-part="sawtooth">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">06</span>Sawtooth</div>
            <div class="explainer-text">
                <div class="explainer-text-final">To understand the rest, you need to know how an old <strong>cathode-ray television</strong> works: a beam sweeps across the screen, drawing the picture one line at a time.<br>The sawtooth shows that motion. Each slope is one sweep from the top of the picture to the bottom, numbered 1, 2 and 3 like the sections of signal above, and each trigger snaps the beam back to the top. The circles sit at the same height on each slope: the same moment in each section lands at the same height in the picture.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include voyager/sawtooth.svg %}
    </section>

    <section class="explainer-step" id="cover-scan" data-part="scan">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">07</span>Drawing lines</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Laid side by side, the sweeps fill a frame <strong>line by line</strong>, from left to right: each 8-millisecond section of signal becomes one of the 512 vertical lines of a complete picture.<br>The Verge Science team did this by hand. They selected each section between two peaks in Audacity, exported it as numbers to Excel, and used conditional formatting to colour quiet samples light grey and loud samples dark grey. It took 12 hours, and 512 repetitions.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include voyager/scan.svg %}
    </section>

    <section class="explainer-step" id="cover-circle" data-part="circle">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">08</span>Test image</div>
            <div class="explainer-text">
                <div class="explainer-text-final">The result was a <strong>circle</strong>. Not the most exciting picture in the world, but an important one: the cover shows it as the first image to expect, so a finder who decodes a matching shape knows they are on the right track.<br>Repeating that by hand for the remaining images was out of the question, so anthropologist Manuel Arturo Izquierdo wrote code that folds the 8-millisecond sections the way an old television would. The images appeared right away, proving the message can still be decoded 40 years later, with completely different technology.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
        </div>
        {% include voyager/circle.svg %}
    </section>

    <section class="explainer-step" id="cover-specs" data-part="specs">
        <div class="explainer-copy">
            <div class="explainer-heading"><span class="explainer-index">09</span>Technical specifications</div>
            <div class="explainer-text">
                <div class="explainer-text-final">Put together, the cover is a complete manual for a <strong>gold-plated copper record</strong>, sealed in an aluminium case and carried by both Voyagers.</div>
                <div class="explainer-text-typed" aria-hidden="true"></div>
            </div>
            <dl class="explainer-specs">
                <div style="--i:0"><dt>Record</dt><dd>30 cm (12 in) copper disc, plated with nickel and gold</dd></div>
                <div style="--i:1"><dt>Cover</dt><dd>Aluminium, with an ultra-pure sample of uranium-238 as a clock (half-life 4.468 billion years)</dd></div>
                <div style="--i:2"><dt>Speed</dt><dd>16⅔ rpm, 3.6 seconds per rotation</dd></div>
                <div style="--i:3"><dt>Playing time</dt><dd>About one hour per side</dd></div>
                <div style="--i:4"><dt>Images</dt><dd>116, analog, 512 vertical lines of about 8 ms each</dd></div>
                <div style="--i:5"><dt>Sounds</dt><dd>Greetings in 55 languages, sounds of Earth and music from many cultures</dd></div>
                <div style="--i:6"><dt>Selected by</dt><dd>A committee chaired by Carl Sagan</dd></div>
                <div style="--i:7"><dt>Launched</dt><dd>Voyager 2, 20 August 1977; Voyager 1, 5 September 1977</dd></div>
            </dl>
        </div>
        {% include voyager/cover.svg %}
    </section>
</div>

## Decoding it yourself

Manuel published his decoder on GitHub as [voyagerimb](https://github.com/aizquier/voyagerimb), and its notes add a few details the cover leaves out. He worked from a high-quality copy of the audio from David Pescovitz's team, who had access to NASA's original master tapes for their Ozma Records reissue: a 32-bit stereo recording at 384,000 samples per second. The left and right channels each carry a different image, so playing the record produces two pictures at once, even though the cover suggests a single signal. Each scan line spans about 3,197 samples, and because the analog equipment of 1977 was not perfectly regular, the alignment has to be tuned for every image. The signal also turned out to be upside down compared with the cover's drawing, which leaves it ambiguous whether a value means black or white. None of that stopped the calibration circle from appearing on his very first attempt.

## A message for the future

Etched by hand into the record itself is a short inscription: *"To the makers of music – all worlds, all times."* The uranium-238 on the cover lets a finder work out how long ago the record was made, and the record also carries a message from then-president Jimmy Carter:

> This is a present from a small, distant world, a token of our sounds, our science, our images, our music, our thoughts and our feelings. We are attempting to survive our time so we may live into yours.

Voyager 1, moving at about 17 kilometres per second, is the most distant object humans have ever made. In about 40,000 years, both Voyagers will pass within two light years of other stars. Whether anyone will ever find them is, for Jon Lomberg, beside the point:

> Whatever happens to it in space, whatever its unknown destiny is, I think it represents a high-water mark of our civilization, when we dreamed the biggest dreams.
>
> Jon Lomberg, in the Verge Science video

## Sources and links

- Verge Science, [We decoded NASA's messages to aliens by hand](https://www.youtube.com/watch?v=RRuovINxpPc) (2018): the main source for the decoding walkthrough.
- Vsauce, [Messages For The Future](https://www.youtube.com/watch?v=GDrBIKOR01c): the record's inscription, Jimmy Carter's message and where the Voyagers are heading.
- Wikipedia, [Voyager Golden Record](https://en.wikipedia.org/wiki/Voyager_Golden_Record): background and technical details.
- Manuel Arturo Izquierdo, [voyagerimb](https://github.com/aizquier/voyagerimb) on GitHub: the decoder used in the Verge Science video, and the source for the audio details above.
- Ron Barry, [How to decode the images on the Voyager Golden Record](https://boingboing.net/2017/09/05/how-to-decode-the-images-on-th.html), Boing Boing (2017): the decoding effort that inspired the Verge Science video.
- Cover diagram: NASA, public domain. Vector version revised by Brian Krent (2015), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Voyager_Golden_Record_Cover_Explanation.svg).
- The companion post on [the Pioneer plaque](/The-Pioneer-Plaque/), whose hydrogen key and pulsar map return on this cover.

### Inspiration

These three videos are what got me started on this project:

- melodysheep, [Children of Planet Earth: The Voyager Golden Record Remixed](https://www.youtube.com/watch?v=L6zulqXLPUw) (Symphony of Science)
- Verge Science, [We decoded NASA's messages to aliens by hand](https://www.youtube.com/watch?v=RRuovINxpPc)
- Vsauce, [Messages For The Future](https://www.youtube.com/watch?v=GDrBIKOR01c)
