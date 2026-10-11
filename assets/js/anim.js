// Scroll-driven plaque explainer.
// Strokes are hidden and drawn by CSS (pathLength="1" + stroke-dashoffset, see main.css);
// this script only decides when each step starts, types its guidance text and drives the minimap.

(function () {
  const explainer = document.querySelector('.explainer');
  if (!explainer) return;

  const steps = explainer.querySelectorAll('.explainer-step');
  const minimap = explainer.querySelector('.plaque-minimap');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pause = 2500;

  // Turns on scroll snapping between steps (see html.has-explainer in main.css)
  document.documentElement.classList.add('has-explainer');

  function title(step) {
    return step.querySelector('.explainer-heading').lastChild.textContent.trim();
  }

  function scrollToStep(step) {
    step.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  // "Next" cue under each step's text, revealed once the step is done (.is-done)
  steps.forEach(function (step, i) {
    var next = steps[i + 1];
    if (!next) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'explainer-next';
    button.textContent = 'Next: ' + title(next);
    button.addEventListener('click', function () { scrollToStep(next); });
    step.querySelector('.explainer-copy').appendChild(button);
  });

  // Typewriter for one step, fed from the (invisible) final text that also sets the box height
  function makeTypewriter(step) {
    var final = step.querySelector('.explainer-text-final');
    var typed = step.querySelector('.explainer-text-typed');
    var segments = final.innerHTML.split(/<br\s*\/?>/i).map(function (s) { return s.trim(); });

    if (reducedMotion) {
      typed.innerHTML = segments.join('\n');
      return null;
    }

    var typewriter = new Typewriter(typed, {
      loop: false,
      delay: 0.2,
      cursor: '.'
    });

    // This Typewriter version types an HTML string as one element, so feed it node by node,
    // like the original .typeString('...').typeString('<strong>...</strong>') chain
    var parser = document.createElement('div');
    for (let i = 0; i < segments.length; i++) {
      parser.innerHTML = segments[i];
      parser.childNodes.forEach(function (node) {
        typewriter.typeString(node.nodeType === Node.TEXT_NODE ? node.textContent : node.outerHTML);
      });
      if (i < segments.length - 1) {
        typewriter.typeString('\n').pauseFor(pause);
      }
    }
    typewriter.callFunction(function () { step.classList.add('is-done'); });
    return typewriter;
  }

  // Draw the step's diagram, then type its text once the last stroke is done
  function play(step) {
    var svg = step.querySelector('.plaque-part');

    step.classList.add('is-drawing');
    var typewriter = makeTypewriter(step);
    if (!typewriter) {
      step.classList.add('is-done');
      return;
    }

    var totaldelay = svg ? parseFloat(svg.dataset.drawTime) : 0;
    window.setTimeout(function () { typewriter.start(); }, totaldelay * 1000);
  }

  // Start each step once, when half of it is in view
  var playObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      play(entry.target);
    });
  }, { threshold: 0.5 });

  steps.forEach(function (step) { playObserver.observe(step); });

  if (!minimap) return;

  const groups = minimap.querySelectorAll('g[data-part]');
  const label = minimap.querySelector('.plaque-minimap-label');

  // Highlight the part of the step crossing the middle of the viewport
  var activeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var step = entry.target;
      var part = step.dataset.part;
      // Steps without their own part (the whole plaque, the object) light up everything
      var whole = !minimap.querySelector('g[data-part="' + part + '"]');
      groups.forEach(function (g) {
        g.classList.toggle('is-active', whole || g.dataset.part === part);
      });
      var index = Array.prototype.indexOf.call(steps, step) + 1;
      label.textContent = index + ' / ' + steps.length + ' · ' + title(step);
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  steps.forEach(function (step) { activeObserver.observe(step); });

  // Only show the minimap while a step fills the middle of the screen
  var visibleObserver = new IntersectionObserver(function (entries) {
    minimap.classList.toggle('is-visible', entries[0].isIntersecting);
  }, { rootMargin: '-50% 0px -50% 0px' });

  visibleObserver.observe(explainer);

  // Clicking the minimap jumps to the smallest part whose outline is under the pointer
  var hitPadding = 60;
  minimap.querySelector('svg').addEventListener('click', function (event) {
    var best = null;
    var bestArea = Infinity;
    groups.forEach(function (g) {
      var box = g.getBBox();
      var pt = new DOMPoint(event.clientX, event.clientY).matrixTransform(g.getScreenCTM().inverse());
      var inside = pt.x >= box.x - hitPadding && pt.x <= box.x + box.width + hitPadding &&
                   pt.y >= box.y - hitPadding && pt.y <= box.y + box.height + hitPadding;
      var area = box.width * box.height;
      if (inside && area < bestArea) {
        best = g.dataset.part;
        bestArea = area;
      }
    });
    if (best) scrollToStep(explainer.querySelector('.explainer-step[data-part="' + best + '"]'));
  });
})();
