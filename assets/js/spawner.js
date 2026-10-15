/*
 * Sprite spawner for the Terminal page.
 *
 * Spawns sprites that drift across the viewport, bounce off its edges and
 * explode into their parts when clicked: the pure CSS 3D molecules from
 * assets/css/molecules.css, or any other element (e.g. an SVG from
 * elsewhere on the site). The molecules (geometry and markup) are based on
 * "Pure CSS Animated 3D Molecules (alpha)" by Ana Tudor:
 * https://codepen.io/thebabydino/pen/DzzjNd
 *
 * Usage:
 *   Spawner.find('CH3CH2OH')  // -> ['C2H6O'] (keys of matching molecules)
 *   Spawner.spawnMolecule('C2H6O', { x: 100, y: 100 })
 *   Spawner.spawnElement(svg, { x: 100, y: 100, className: 'sprite-plaque' })
 */
(function (window, document) {
  'use strict';

  // Atom diameters in em, matching $ap in assets/scss/molecules.scss
  var DIAMETERS = { O: 3.55, H: 1.6, C: 3.1, N: 3.15, Cl: 3.7 };

  // key: CSS class in molecules.css; atoms: element order expected by the
  // :nth-of-type rules for that class; aliases: other ways to type it
  // (condensed structural formulas and alternative names).
  var CATALOG = [
    ['H2', 'hydrogen', 'H2', 'H H', ['HH']],
    ['H2O', 'water', 'H2O', 'H H O', ['HOH']],
    ['O2', 'oxygen', 'O2', 'O O', ['OO']],
    ['CO2', 'carbon dioxide', 'CO2', 'C O O', ['OCO']],
    ['HCN', 'hydrogen cyanide', 'HCN', 'H C N', []],
    ['NH3', 'ammonia', 'NH3', 'N H H H', []],
    ['CH4', 'methane', 'CH4', 'C H H H H', []],
    ['CH2O', 'formaldehyde', 'CH2O', 'C H H O', ['HCHO', 'H2CO', 'methanal']],
    ['CCl4', 'carbon tetrachloride', 'CCl4', 'C Cl Cl Cl Cl', ['tetrachloromethane']],
    ['CH3Cl', 'methyl chloride', 'CH3Cl', 'C H H H Cl', ['chloromethane']],
    ['C2H2', 'acetylene', 'C2H2', 'C C H H', ['HCCH', 'ethyne']],
    ['C2H4', 'ethylene', 'C2H4', 'C C H H H H', ['CH2CH2', 'H2CCH2', 'ethene']],
    ['C2H6', 'ethane', 'C2H6', 'C C H H H H H H', ['CH3CH3']],
    ['C2H3N', 'acetonitrile', 'C2H3N', 'C C H H H N', ['CH3CN']],
    ['C2H4O2', 'acetic acid', 'C2H4O2', 'C C H H H H O O', ['CH3COOH', 'CH3CO2H', 'ethanoic acid']],
    ['C2H4O2b', 'glycolaldehyde', 'C2H4O2', 'C C H H H H O O', ['HOCH2CHO']],
    ['C2H4O2c', 'methyl formate', 'C2H4O2', 'C C H H H H O O', ['HCOOCH3', 'HCO2CH3', 'methyl methanoate']],
    ['C2H4O', 'acetaldehyde', 'C2H4O', 'C C H H H H O', ['CH3CHO', 'ethanal']],
    ['C2H4Ob', 'vinyl alcohol', 'C2H4O', 'C C H H H H O', ['CH2CHOH', 'H2CCHOH', 'ethenol']],
    ['C2H4Oc', 'ethylene oxide', 'C2H4O', 'C C H H H H O', ['(CH2)2O', 'oxirane']],
    ['C2H6O', 'ethanol', 'C2H6O', 'C C H H H H H H O', ['CH3CH2OH', 'C2H5OH']],
    ['C2H6Ob', 'dimethyl ether', 'C2H6O', 'C C H H H H H H O', ['CH3OCH3', '(CH3)2O', 'methoxymethane']],
    ['C2H6O2', 'ethylene glycol', 'C2H6O2', 'C C H H H H H H O O', ['HOCH2CH2OH', '(CH2OH)2', 'ethane-1,2-diol']],
    ['C2H3NO', 'glycolonitrile', 'C2H3NO', 'C C H H H N O', ['HOCH2CN']],
    ['C2H3NOb', 'methyl isocyanate', 'C2H3NO', 'C C H H H N O', ['CH3NCO']],
    ['C3H6', 'cyclopropane', 'C3H6', 'C C C H H H H H H', ['(CH2)3']],
    ['C3H6b', 'propylene', 'C3H6', 'C C C H H H H H H', ['CH3CHCH2', 'CH2CHCH3', 'propene']],
    ['C4H8', 'α-butylene', 'C4H8', 'C C C C H H H H H H H H', ['CH2CHCH2CH3', 'CH3CH2CHCH2', 'alpha-butylene', '1-butene', 'but-1-ene']],
    ['C4H8b', 'Z-β-butylene', 'C4H8', 'C C C C H H H H H H H H', ['CH3CHCHCH3', 'cis-2-butene', 'Z-beta-butylene', '(Z)-but-2-ene']],
    ['C4H8c', 'E-β-butylene', 'C4H8', 'C C C C H H H H H H H H', ['CH3CHCHCH3', 'trans-2-butene', 'E-beta-butylene', '(E)-but-2-ene']],
    ['C4H8d', 'isobutylene', 'C4H8', 'C C C C H H H H H H H H', ['(CH3)2CCH2', 'CH2C(CH3)2', 'isobutene', '2-methylpropene']],
    ['C6H6', 'benzene', 'C6H6', 'C C C C C C H H H H H H', []],
    ['C6H12', 'cyclohexane', 'C6H12', 'C C C C C C H H H H H H H H H H H H', ['(CH2)6']],
    ['C6H12b', 'methylcyclopentane', 'C6H12', 'C C C C C C H H H H H H H H H H H H', ['CH3C5H9']]
  ].map(function (m) {
    return { key: m[0], name: m[1], formula: m[2], atoms: m[3].split(' '), aliases: m[4] };
  });

  var MAX_SPRITES = 25;
  var FONT_SIZE = 10;           // px; molecules and sprites are sized in em
  var DRIFT_SPEED = [40, 90];   // px/s
  var SPIN_PERIOD = [20, 40];   // s per full turn of a molecule
  var BLAST_SPEED = [350, 750]; // px/s

  // Case-insensitive, ignoring spaces and bond characters (-, =, ≡, #)
  function normalize(text) {
    return String(text).replace(/[\s\-=≡#]+/g, '').toUpperCase();
  }

  var index = {};
  CATALOG.forEach(function (m) {
    [m.key, m.formula, m.name].concat(m.aliases).forEach(function (alias) {
      var k = normalize(alias);
      index[k] = index[k] || [];
      if (index[k].indexOf(m) === -1) {
        index[k].push(m);
      }
    });
  });

  function find(text) {
    return (index[normalize(text)] || []).map(function (m) { return m.key; });
  }

  function get(key) {
    for (var i = 0; i < CATALOG.length; i++) {
      if (CATALOG[i].key === key) {
        return CATALOG[i];
      }
    }
  }

  function random(range) {
    return range[0] + Math.random() * (range[1] - range[0]);
  }

  var layer = null;
  var instances = [];
  var fragments = [];
  var frame = null;
  var last = null;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getLayer() {
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'spawn-layer';
      layer.style.fontSize = FONT_SIZE + 'px';
      document.body.appendChild(layer);
    }
    return layer;
  }

  function viewport() {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };
  }

  // Spawn a molecule from the catalog by its key
  function spawnMolecule(key, options) {
    var molecule = get(key);
    if (!molecule) {
      throw new Error('Unknown molecule ' + key);
    }
    if (instances.length >= MAX_SPRITES) {
      return false;
    }
    var sprite = document.createElement('div');
    sprite.className = 'spawn-sprite molecule-sprite';
    var spin = random(SPIN_PERIOD);
    sprite.style.setProperty('--spin', spin.toFixed(2) + 's');
    sprite.style.setProperty('--phase', (-Math.random() * spin).toFixed(2) + 's');
    if (Math.random() < 0.5) {
      sprite.style.setProperty('--direction', 'reverse');
    }
    var list = document.createElement('ul');
    list.className = 'molecule ' + molecule.key;
    molecule.atoms.forEach(function (element) {
      var atom = document.createElement('li');
      atom.className = 'atom ' + element;
      list.appendChild(atom);
    });
    sprite.appendChild(list);
    var atoms = Array.prototype.slice.call(list.children);
    launch(sprite, options, {
      // only the atoms are solid, not the box around them
      hit: function (target) {
        return target.classList.contains('atom');
      },
      bodies: atoms,
      parts: function (instance) {
        return atoms.map(function (atom) {
          var rect = atom.getBoundingClientRect();
          var element = atom.className.replace('atom ', '');
          var node = document.createElement('div');
          node.className = 'atom ' + element + ' spawn-fragment';
          node.style.fontSize = (rect.width / DIAMETERS[element]) + 'px';
          return { node: node, rect: rect, offsetX: -rect.width / 2, offsetY: -rect.height / 2 };
        });
      }
    });
    return molecule;
  }

  // Spawn any element (e.g. an SVG from elsewhere on the site). An SVG
  // explodes into its individual shapes, anything else flies off whole.
  // options.className is added to the sprite and to its fragments, so they
  // can be styled together.
  function spawnElement(element, options) {
    options = options || {};
    if (instances.length >= MAX_SPRITES) {
      return false;
    }
    var sprite = document.createElement('div');
    sprite.className = 'spawn-sprite spawn-element ' + (options.className || '');
    var sway = document.createElement('div');
    sway.className = 'spawn-sway';
    sway.style.animationDelay = (-Math.random() * 6).toFixed(2) + 's';
    sway.appendChild(element);
    sprite.appendChild(sway);
    launch(sprite, options, {
      hit: function () {
        return true;
      },
      bodies: [element],
      parts: function () {
        if (element instanceof SVGSVGElement) {
          return svgParts(element, options.className);
        }
        var rect = element.getBoundingClientRect();
        var node = element.cloneNode(true);
        node.classList.add('spawn-fragment');
        node.style.width = rect.width + 'px';
        node.style.height = rect.height + 'px';
        return [{ node: node, rect: rect, offsetX: -rect.width / 2, offsetY: -rect.height / 2 }];
      }
    });
    return true;
  }

  // One full-size copy of the SVG per shape, each holding just that shape
  // (inside copies of its parent groups, so transforms still apply)
  function svgParts(svg, className) {
    var box = svg.getBoundingClientRect();
    var shapes = svg.querySelectorAll('circle, ellipse, line, path, polygon, polyline, rect, text');
    return Array.prototype.map.call(shapes, function (shape) {
      var rect = shape.getBoundingClientRect();
      var node = svg.cloneNode(false);
      node.classList.add('spawn-fragment');
      if (className) {
        node.classList.add.apply(node.classList, className.split(' ').filter(Boolean));
      }
      node.style.width = box.width + 'px';
      node.style.height = box.height + 'px';
      var parent = node;
      var chain = [];
      for (var el = shape.parentNode; el !== svg; el = el.parentNode) {
        chain.unshift(el);
      }
      chain.forEach(function (group) {
        parent = parent.appendChild(group.cloneNode(false));
      });
      parent.appendChild(shape.cloneNode(true));
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      return { node: node, rect: rect, offsetX: box.left - cx, offsetY: box.top - cy };
    });
  }

  function launch(sprite, options, kind) {
    getLayer().appendChild(sprite);
    var halfWidth = sprite.offsetWidth / 2;
    var halfHeight = sprite.offsetHeight / 2;
    var size = viewport();
    var x = Math.min(Math.max(options.x || size.width / 2, halfWidth), size.width - halfWidth);
    var y = Math.min(Math.max(options.y || size.height / 2, halfHeight), size.height - halfHeight);
    var angle = Math.random() * 2 * Math.PI;
    var speed = random(DRIFT_SPEED) * (reduceMotion ? 0.5 : 1);
    var instance = {
      sprite: sprite,
      bodies: kind.bodies,
      parts: kind.parts,
      halfWidth: halfWidth,
      halfHeight: halfHeight,
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    };
    sprite.addEventListener('pointerdown', function (event) {
      if (kind.hit(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        swallowClick();
        explode(instance);
      }
    });
    place(instance);
    instances.push(instance);
    start();
  }

  // The clicked sprite is gone before the click event fires, so that click
  // lands on the page behind it (and e.g. makes jQuery Terminal lose focus);
  // stop it before it reaches any other handler.
  var swallowing = null;
  function swallowClick() {
    clearTimeout(swallowing);
    swallowing = setTimeout(function () {
      swallowing = null;
    }, 500);
  }
  window.addEventListener('click', function (event) {
    if (swallowing !== null) {
      clearTimeout(swallowing);
      swallowing = null;
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  function place(instance) {
    instance.sprite.style.transform = 'translate(' +
      (instance.x - instance.halfWidth) + 'px,' + (instance.y - instance.halfHeight) + 'px)';
  }

  // Replace the sprite by its parts, at the same spot on screen, flying
  // away from its centre; the sprite is gone once all of its parts have
  // left the screen.
  function explode(instance) {
    var i = instances.indexOf(instance);
    if (i === -1) {
      return;
    }
    instances.splice(i, 1);
    var parts = instance.parts(instance).map(function (part) {
      var cx = part.rect.left + part.rect.width / 2;
      var cy = part.rect.top + part.rect.height / 2;
      var dx = cx - instance.x;
      var dy = cy - instance.y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      var angle = distance > 2 ? Math.atan2(dy, dx) : Math.random() * 2 * Math.PI;
      angle += (Math.random() - 0.5) * 0.6;
      var speed = random(BLAST_SPEED);
      layer.appendChild(part.node);
      return {
        node: part.node,
        halfWidth: part.rect.width / 2,
        halfHeight: part.rect.height / 2,
        offsetX: part.offsetX,
        offsetY: part.offsetY,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed + instance.vx,
        vy: Math.sin(angle) * speed + instance.vy
      };
    });
    layer.removeChild(instance.sprite);
    parts.forEach(function (part) {
      placeFragment(part);
      fragments.push(part);
    });
    start();
  }

  function placeFragment(part) {
    part.node.style.transform = 'translate(' +
      (part.x + part.offsetX) + 'px,' + (part.y + part.offsetY) + 'px)';
  }

  function start() {
    if (frame === null) {
      last = null;
      frame = window.requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    // cap the step so a background tab doesn't teleport everything
    var dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05);
    last = now;
    var size = viewport();
    // read all bounding boxes before writing any transforms
    var bounds = instances.map(function (instance) {
      var box = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
      instance.bodies.forEach(function (body) {
        var rect = body.getBoundingClientRect();
        box.left = Math.min(box.left, rect.left);
        box.top = Math.min(box.top, rect.top);
        box.right = Math.max(box.right, rect.right);
        box.bottom = Math.max(box.bottom, rect.bottom);
      });
      return box;
    });
    instances.forEach(function (instance, i) {
      var box = bounds[i];
      if ((box.left < 0 && instance.vx < 0) ||
          (box.right > size.width && instance.vx > 0)) {
        instance.vx = -instance.vx;
      }
      if ((box.top < 0 && instance.vy < 0) ||
          (box.bottom > size.height && instance.vy > 0)) {
        instance.vy = -instance.vy;
      }
      instance.x += instance.vx * dt;
      instance.y += instance.vy * dt;
      place(instance);
    });
    fragments = fragments.filter(function (part) {
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      if (part.x + part.halfWidth < 0 || part.x - part.halfWidth > size.width ||
          part.y + part.halfHeight < 0 || part.y - part.halfHeight > size.height) {
        layer.removeChild(part.node);
        return false;
      }
      placeFragment(part);
      return true;
    });
    if (instances.length || fragments.length) {
      frame = window.requestAnimationFrame(tick);
    } else {
      frame = null;
    }
  }

  window.Spawner = {
    catalog: CATALOG,
    find: find,
    get: get,
    spawnMolecule: spawnMolecule,
    spawnElement: spawnElement,
    count: function () { return instances.length; },
    max: MAX_SPRITES
  };
})(window, document);
