/*
 * Executables for the Terminal page.
 *
 * Each program is a function(term, args, system) that is placed in the
 * terminal's filesystem as a file ending in .exe (see terminal.js), and runs
 * when its name is typed in the directory that contains it.
 * - term:   the jQuery Terminal instance
 * - args:   the arguments typed after the name
 * - system: helpers from the terminal, e.g. system.origin() gives the centre
 *           of the terminal window on screen, to spawn sprites from
 * Return a promise (e.g. from term.animation) to keep the terminal busy until
 * the program is done.
 *
 * To add a program: add a function here and put it somewhere in the
 * filesystem in terminal.js, e.g. 'bin': { 'name.exe': TerminalPrograms.name }
 *
 * top is the exception: it runs as a regular command from anywhere (see the
 * commands in terminal.js) and only gets the terminal.
 */
(function (window, document, $) {
  'use strict';

  // ---------------------------------------------------------------------------
  // boot.exe: typing animation of a boot sequence.
  // Adapted from the CodePen "New Typing animation API" by Jakub T. Jankiewicz:
  // https://codepen.io/jcubic/pen/QWgwVVq
  // The boot sequence is taken from http://huntergregal.com/
  // ---------------------------------------------------------------------------
  var BOOT_SEQUENCE = [
    'Starting udev:...................................(  OK  )',
    'Mount devpts:....................................(  OK  )',
    'Configure kernel options.........................(  OK  )',
    'Setting clock: 1629907614438.....................(  OK  )',
    'Testing presence of GPU..........................( FAIL )',
    'SYSTEM BOOT COMPLETE.............................(  OK  )'
  ];

  function boot_status(line) {
    return $.terminal.escape_brackets(line)
      .replace(/(\(\s+)OK(\s+\))/, '$1[[;#8ae234;]OK]$2')
      .replace(/(\(\s+)FAIL(\s+\))/, '$1[[;#ef2929;]FAIL]$2');
  }

  function boot(term) {
    return term.animation(async function () {
      for (var i = 0; i < BOOT_SEQUENCE.length; i++) {
        var line = BOOT_SEQUENCE[i];
        var parts = line.split(/(\.+)/);
        await term.typing('echo', 20, parts[1], { prompt: parts[0] });
        term.update(-1, boot_status(line));
        await term.delay(400);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // atom.exe: animated ASCII hydrogen atom whose electron flips its spin and
  // sends out the 21 cm radio wave that the Voyager Golden Record is built on.
  // ---------------------------------------------------------------------------
  var ATOM = { width: 50, height: 11, cx: 16, cy: 5, a: 14, b: 4 };

  function color(text, hex) {
    return '[[;' + hex + ';]' + text + ']';
  }

  function atom_frame(angle, spin, wave) {
    var grid = [];
    for (var y = 0; y < ATOM.height; y++) {
      grid.push(new Array(ATOM.width + 1).join(' ').split(''));
    }
    for (var t = 0; t < 2 * Math.PI; t += 0.05) {
      var ox = Math.round(ATOM.cx + ATOM.a * Math.cos(t));
      var oy = Math.round(ATOM.cy + ATOM.b * Math.sin(t));
      grid[oy][ox] = color('·', '#666');
    }
    grid[ATOM.cy][ATOM.cx - 1] = color('(', '#ef2929');
    grid[ATOM.cy][ATOM.cx] = color('p', '#ef2929');
    grid[ATOM.cy][ATOM.cx + 1] = color(')', '#ef2929');
    var ex = Math.round(ATOM.cx + ATOM.a * Math.cos(angle));
    var ey = Math.round(ATOM.cy + ATOM.b * Math.sin(angle));
    grid[ey][ex] = color('e', '#fce94f');
    grid[ey][ex + 1] = color(spin, '#fce94f');
    for (var w = 0; w < wave; w++) {
      var wx = ATOM.cx + ATOM.a + 3 + w;
      if (wx < ATOM.width) {
        grid[ATOM.cy][wx] = color('~', '#34e2e2');
      }
    }
    return grid.map(function (row) {
      return row.join('');
    }).join('\n');
  }

  function atom(term) {
    return term.animation(async function () {
      var angle = 0;
      term.echo(atom_frame(angle, '↑', 0));
      // three orbits
      for (var i = 0; i < 90; i++) {
        angle += 2 * Math.PI / 30;
        term.update(-1, atom_frame(angle, '↑', 0));
        await term.delay(50);
      }
      // the spin flips and the wave leaves the atom
      for (var w = 0; w <= ATOM.width - ATOM.cx - ATOM.a - 3; w++) {
        angle += 2 * Math.PI / 30;
        term.update(-1, atom_frame(angle, '↓', w));
        await term.delay(50);
      }
      term.echo('Spin flip: 1420 MHz, a wavelength of 21 cm, one wave every 0.704 ns.');
    });
  }

  // ---------------------------------------------------------------------------
  // hydrogen.exe: releases the hydrogen symbol from the Voyager Golden Record
  // post (included on the page as <template id="sprite-voyager-hydrogen">).
  // ---------------------------------------------------------------------------
  function hydrogen(term, args, system) {
    var template = document.getElementById('sprite-voyager-hydrogen');
    if (!template) {
      term.error('hydrogen.exe: data file missing');
      return;
    }
    var svg = template.content.firstElementChild.cloneNode(true);
    var origin = system.origin();
    var spawned = Spawner.spawnElement(svg, {
      x: origin.x,
      y: origin.y,
      className: 'sprite-plaque is-drawing'
    });
    if (spawned) {
      term.echo('Released the hydrogen symbol from the Voyager Golden Record cover');
    } else {
      term.error('There are already ' + Spawner.max +
                 ' things flying around, click some to make room');
    }
  }

  // ---------------------------------------------------------------------------
  // top: a live process list in which consciousness is the only process that
  // is really running, with as many of its subprocesses as fit in the window
  // and as many columns as fit across it. Every number changes once a second;
  // Esc, Ctrl+C or q quits.
  //
  // top --enlightenment (password protected in terminal.js): over twenty
  // seconds the senses fade, mindfulness, happiness and freedom grow to their
  // maximum, self and duality disappear and all text glows ever brighter. In
  // the first ten the subprocesses end until consciousness only experiences
  // emptiness and bliss, which glow like consciousness itself. Then the
  // process list turns into the indestructible drop, the essence of the
  // enlightened mind, which keeps radiating further until top is quit.
  // ---------------------------------------------------------------------------
  var TOP_SUBPROCESSES = [
    'perception', 'attention', 'memory', 'emotion', 'language', 'introspect',
    'self_model', 'inner_voice', 'intuition', 'imagination', 'curiosity',
    'time_sense', 'empathy', 'recall', 'dreamd', 'habitd', 'deja_vu', 'wonder'
  ];
  var TOP_UID = 1000;
  var GLOW_PERIOD = 3000; // ms, the length of terminal-welcome-glow in terminal.css
  var ENLIGHTENMENT = 20; // s until everything is at its maximum
  var ENDING = 10; // s until only emptiness and bliss are left
  var BIRTHS = [['emptiness', 3], ['bliss', 5]]; // s when they appear
  var DROP_START = 12; // s, when the process list starts turning into the drop
  var DROP_FORMING = 8; // s that takes
  var DISSOLVE_START = 10; // s, when the plain header lines start to dissolve
  var DISSOLVING = 4; // s until they are gone
  var DISSOLVED = [0, 1, 2, 3, 8]; // Processes, Load Avg, Neurons, Memory and Nerves
  var FREE = 'Boundless and free.'; // typed where Nerves was, done at ENLIGHTENMENT
  var FREE_LINE = 8;
  var DROP_INSIDE = '+*#%@';
  var DROP_OUTSIDE = ' .:-=+*#';

  function random(min, max) {
    return min + Math.random() * (max - min);
  }
  function int(min, max) {
    return Math.floor(random(min, max + 1));
  }
  function clamp(value) {
    return Math.max(0, Math.min(1, value));
  }
  function lerp(from, to, t) {
    return from + (to - from) * t;
  }
  function pad(text, width) {
    text = String(text);
    return text + new Array(Math.max(0, width - text.length) + 1).join(' ');
  }
  function two(n) {
    return (n < 10 ? '0' : '') + n;
  }
  function percent(value) {
    return Math.round(value) + '%';
  }
  // kilobytes as top shows them, e.g. 0B, 8144K, 130M or 2G
  function size(kb) {
    if (kb < 1) {
      return '0B';
    }
    if (kb < 10000) {
      return Math.round(kb) + 'K';
    }
    if (kb < 10000 * 1024) {
      return Math.round(kb / 1024) + 'M';
    }
    return Math.round(kb / 1048576) + 'G';
  }
  // CPU time as minutes:seconds.hundredths, e.g. 06:26.79
  function cpu_time(seconds) {
    var cs = Math.floor(seconds * 100);
    return two(Math.floor(cs / 6000)) + ':' + ((cs % 6000) / 100 < 10 ? '0' : '') +
      ((cs % 6000) / 100).toFixed(2);
  }
  // A fixed pseudo random number in [0, 1) for every character position
  function noise(x, y) {
    var n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }
  // Text that turns into other text character by character as t goes from
  // 0 to 1, with a spark where a character is about to change
  function morph(from, to, t, seed) {
    if (t <= 0) {
      return from;
    }
    if (t >= 1) {
      return to;
    }
    var length = Math.max(from.length, to.length);
    from = pad(from, length);
    to = pad(to, length);
    var text = '';
    for (var i = 0; i < length; i++) {
      var n = noise(i, seed);
      text += Math.abs(n - t) < 0.04 ? '*' : (n < t ? to[i] : from[i]);
    }
    return text;
  }
  // Text whose characters turn into flickering random characters and then
  // vanish as t goes from 0 to 1; at 1 only spaces are left
  var DISSOLVE_CHARACTERS = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`' +
                            'abcdefghijklmnopqrstuvwxyz{|}~';
  function dissolve(text, t, seed) {
    if (t <= 0) {
      return text;
    }
    var g = t * 4 / 3;
    return text.replace(/\S/g, function (character, i) {
      var n = noise(i, seed);
      if (n < g - 1 / 3) {
        return ' ';
      }
      if (n < g) {
        return DISSOLVE_CHARACTERS[Math.floor(Math.random() * DISSOLVE_CHARACTERS.length)];
      }
      return character;
    });
  }

  function counter(key) {
    return function (p) {
      return p[key] + (p.signs[key] || '');
    };
  }
  // The columns of macOS top; widths include the space after the column
  var TOP_COLUMNS = [
    { title: 'PID', width: 6, value: function (p) { return p.pid; } },
    { title: 'COMMAND', width: 14, value: function (p) { return p.name.slice(0, 13); } },
    { title: '%CPU', width: 6, value: function (p) { return p.cpu.toFixed(1); } },
    { title: 'TIME', width: 11, value: function (p) { return cpu_time(p.time); } },
    { title: '#TH', width: 7, value: function (p) {
      return p.threads + (p.state === 'running' ? '/1' : '');
    } },
    { title: '#WQ', width: 5, value: function (p) {
      return p.wq + (p.state === 'running' && p.wq ? '/1' : '');
    } },
    { title: '#PORT', width: 6, value: function (p) { return p.ports; } },
    { title: 'MEM', width: 7, value: function (p) { return size(p.mem) + (p.signs.mem || ''); } },
    { title: 'PURG', width: 7, value: function (p) { return size(p.purg); } },
    { title: 'CMPRS', width: 7, value: function (p) { return size(p.cmprs) + (p.signs.cmprs || ''); } },
    { title: 'PGRP', width: 5, value: function () { return 1; } },
    { title: 'PPID', width: 5, value: function (p) { return p.ppid; } },
    { title: 'STATE', width: 9, value: function (p) { return p.state; } },
    { title: 'BOOSTS', width: 13, value: function (p) {
      return (p.state === 'running' ? '*' : '') + p.boost + '[' + p.boosts + ']';
    } },
    { title: '%CPU_ME', width: 8, value: function (p) { return p.cpu_me.toFixed(5); } },
    { title: '%CPU_OTHRS', width: 11, value: function (p) { return p.cpu_others.toFixed(5); } },
    { title: 'UID', width: 5, value: function () { return TOP_UID; } },
    { title: 'FAULTS', width: 9, value: counter('faults') },
    { title: 'COW', width: 6, value: counter('cow') },
    { title: 'MSGSENT', width: 10, value: counter('sent') },
    { title: 'MSGRECV', width: 10, value: counter('received') },
    { title: 'SYSBSD', width: 10, value: counter('bsd') },
    { title: 'SYSMACH', width: 10, value: counter('mach') },
    { title: 'CSW', width: 10, value: counter('csw') },
    { title: 'PAGEI', width: 6, value: counter('pagein') },
    { title: 'IDLEW', width: 9, value: counter('idlew') },
    { title: 'POWER', width: 6, value: function (p) { return p.power.toFixed(1); } },
    { title: 'INSTRS', width: 11, value: function (p) { return p.instrs; } },
    { title: 'CYCLES', width: 10, value: function (p) { return p.cycles; } }
  ];

  // busy: the range of %CPU of a running process
  function top_process(name, pid, ppid, busy) {
    return {
      name: name,
      pid: pid,
      ppid: ppid,
      busy: busy,
      state: busy ? 'running' : 'sleeping',
      time: random(10, 2000),
      threads: int(1, 30),
      wq: int(0, 6),
      ports: int(20, 900),
      mem: random(2000, 400000),
      purg: Math.random() < 0.7 ? 0 : random(16, 30000),
      cmprs: random(0, 100000),
      boost: int(0, 3),
      boosts: int(100, 60000),
      faults: int(1e3, 6e5),
      cow: int(10, 400),
      sent: int(1e3, 2e6),
      received: int(1e3, 1e6),
      bsd: int(1e3, 2e6),
      mach: int(1e3, 6e6),
      csw: int(1e3, 2e6),
      pagein: int(0, 2000),
      idlew: int(0, 2e5),
      signs: {}
    };
  }

  // A new second of work: running processes are busy, the others mostly idle
  function top_tick(p) {
    p.cpu = p.busy ? random(p.busy[0], p.busy[1]) : Math.pow(Math.random(), 3) * 12;
    p.time += p.cpu / 100;
    p.threads = Math.max(1, p.threads + int(-2, 2));
    p.wq = Math.max(0, p.wq + int(-1, 1));
    p.ports = Math.max(1, p.ports + int(-5, 5));
    p.signs = {};
    ['mem', 'cmprs'].forEach(function (key) {
      if (Math.random() < 0.5) {
        var value = p[key] * random(0.97, 1.03);
        p.signs[key] = value > p[key] ? '+' : '-';
        p[key] = value;
      }
    });
    var work = 1 + p.cpu;
    ['faults', 'sent', 'received', 'bsd', 'mach', 'csw', 'idlew', 'cow', 'pagein'].forEach(function (key) {
      var chance = key === 'cow' || key === 'pagein' ? 0.1 : 0.6;
      if (Math.random() < chance) {
        p[key] += int(1, 40 * work);
        p.signs[key] = '+';
      }
    });
    if (Math.random() < 0.2) {
      p.boosts += int(1, 20);
    }
    p.cpu_me = Math.random() * p.cpu / 50;
    p.cpu_others = Math.random() < 0.8 ? 0 : Math.random() / 10;
    p.power = p.cpu * random(0.2, 0.4);
    p.instrs = Math.round(p.cpu * random(4e6, 8e6));
    p.cycles = Math.round(p.instrs * random(0.5, 0.8));
  }

  // The indestructible drop, `time` seconds after it appeared: a luminous
  // drop whose rays and rings reach further the longer it shines
  function drop(width, height, time) {
    var radius = Math.max(1, height * 0.4); // half the height of the drop, in rows
    var cx = width / 2;
    var cy = height / 2;
    var reach = 0.6 + Math.min(time, 40) * 0.2; // how far it radiates, in radii
    var strength = 0.4 + 0.6 * clamp(time / 10);
    var lines = [];
    for (var y = 0; y < height; y++) {
      var line = '';
      for (var x = 0; x < width; x++) {
        // characters are about twice as high as they are wide
        var u = (x + 0.5 - cx) / 2 / radius;
        var v = (y + 0.5 - cy) / radius; // -1 at the tip, 1 at the bottom
        var t = Math.acos(Math.max(-1, Math.min(1, -v)));
        var inside = Math.abs(v) <= 1 && Math.abs(u) <= Math.sin(t) * Math.sin(t / 2);
        var d = Math.sqrt(u * u + (v - 0.3) * (v - 0.3)); // from the heart of the drop
        var value;
        if (inside) {
          value = d < 0.25 ? 1 : 0.55 + 0.45 * Math.sin(time * 3 - d * 5);
          line += DROP_INSIDE[Math.min(DROP_INSIDE.length - 1, Math.floor(value * DROP_INSIDE.length))];
        } else {
          var a = Math.atan2(v - 0.3, u);
          var rays = Math.pow(Math.max(0, Math.cos(9 * a + time * 0.7)), 6) +
                     0.6 * Math.pow(Math.max(0, Math.cos(5 * a - time * 0.4)), 10);
          var rings = Math.pow(Math.max(0, Math.sin(d * 4 - time * 3)), 4);
          var falloff = Math.min(1, Math.exp(-(d - 0.8) / reach));
          var halo = 0.5 * Math.min(1, Math.exp(-(d - 0.8) * 4));
          value = (0.7 * rays + 0.5 * rings) * falloff * strength + halo;
          line += DROP_OUTSIDE[Math.min(DROP_OUTSIDE.length - 1, Math.floor(value * DROP_OUTSIDE.length))];
        }
      }
      lines.push(line);
    }
    return lines;
  }

  function top(term, options) {
    var enlightenment = Boolean(options && options.enlightenment);
    var done = $.Deferred();
    var start = Date.now();
    var main = top_process('consciousness', 1, 0, [40, 90]);
    main.time = random(3e5, 6e5);
    var subprocesses = TOP_SUBPROCESSES.map(function (name) {
      return top_process(name, int(100, 9999), 1);
    });
    var originals = subprocesses.slice().sort(function () {
      return Math.random() - 0.5;
    }); // the order in which they end during enlightenment
    var load = [random(1, 2), random(1, 2), random(1, 2)];
    var nerves = { packets_in: int(5e5, 6e5), kb_in: random(6e5, 7e5),
                   packets_out: int(1e5, 2e5), kb_out: random(5e4, 6e4) };
    var forgotten = int(400, 500);
    var state = {};
    var index, timer, last_tick = 0, stopped = false;

    // Seconds into enlightenment, or 0 for a plain top
    function elapsed() {
      return enlightenment ? (Date.now() - start) / 1000 : 0;
    }

    function tick() {
      [main].concat(subprocesses).forEach(top_tick);
      load = load.map(function (l) {
        return Math.max(0.1, l + random(-0.1, 0.1));
      });
      nerves.packets_in += int(10, 400);
      nerves.kb_in += random(10, 400);
      nerves.packets_out += int(5, 150);
      nerves.kb_out += random(5, 100);
      forgotten += int(0, 3);
      var senses = [random(50, 80), random(10, 25), random(3, 10), random(1, 5),
                    random(0.5, 3), random(1, 5)];
      var total = senses.reduce(function (sum, s) {
        return sum + s;
      }, 0);
      state = {
        user: random(10, 25),
        sys: random(3, 8),
        firing: int(800, 1600),
        synapses: random(2, 5),
        working: int(5, 9),
        senses: senses.map(function (s) {
          return s / total * 100;
        }),
        mind: [random(5, 20), random(5, 15), random(5, 20), random(10, 30), random(1, 5)],
        self: random(85, 99),
        duality: random(80, 99),
        happiness: random(20, 60),
        suffering: random(10, 40),
        freedom: random(0, 5)
      };
    }

    // Subprocesses end one by one until only emptiness and bliss are left
    function let_go(s) {
      var ending = Math.round(originals.length * clamp(s / ENDING));
      originals.slice(0, ending).forEach(function (p) {
        var i = subprocesses.indexOf(p);
        if (i !== -1) {
          subprocesses.splice(i, 1);
        }
      });
      BIRTHS.forEach(function (birth) {
        var exists = subprocesses.some(function (p) {
          return p.name === birth[0];
        });
        if (s >= birth[1] && !exists) {
          var p = top_process(birth[0], int(100, 9999), 1, [15, 35]);
          p.glows = true;
          top_tick(p);
          subprocesses.unshift(p);
        }
      });
    }

    function header(cols, e, s) {
      var q = clamp((e - 0.4) / 0.4); // how far the words have changed
      var now = new Date();
      var all = [main].concat(subprocesses);
      var threads = all.reduce(function (sum, p) {
        return sum + p.threads;
      }, 0);
      var running = all.filter(function (p) {
        return p.state === 'running';
      }).length;
      var user = lerp(state.user, 0, e);
      var sys = lerp(state.sys, 0, e);
      var senses = state.senses.map(function (value, i) {
        return percent(lerp(value, i === 5 ? 100 : 0, e));
      });
      var mind = state.mind.map(function (value) {
        return percent(lerp(value, 100, e));
      });
      var first = 'Processes: ' + all.length + ' total, ' + running + ' running, ' +
        (all.length - running) + ' sleeping, ' + threads + ' threads';
      var time = two(now.getHours()) + ':' + two(now.getMinutes()) + ':' + two(now.getSeconds());
      return [
        pad(first, cols - time.length - 1) + ' ' + time,
        'Load Avg: ' + load.map(function (l) {
          return lerp(l, 0, e).toFixed(2);
        }).join(', ') + '  CPU: ' + user.toFixed(2) + '% user, ' + sys.toFixed(2) +
          '% sys, ' + (100 - user - sys).toFixed(2) + '% idle',
        'Neurons: 86G total, ' + state.firing + 'M firing, ' +
          state.synapses.toFixed(1) + 'T synapses active.',
        'Memory: 2.5P long-term, ' + state.working + ' items working, ' + forgotten + 'M forgotten.',
        'Senses: sight ' + senses[0] + ' sound ' + senses[1] + ' touch ' + senses[2] +
          ' smell ' + senses[3] + ' taste ' + senses[4] + ' mindfulness ' + senses[5],
        'Mindful: aware ' + mind[0] + ', present ' + mind[1] + ', calm ' + mind[2] +
          ', loving ' + mind[3] + ', wise ' + mind[4],
        'Self: ' + percent(lerp(state.self, 0, e)) + ', duality: ' +
          percent(lerp(state.duality, 0, e)) + ', reality: ' +
          morph('seems solid', 'non-dual, as it is', q, 1),
        'Happiness: ' + percent(lerp(state.happiness, 100, e)) + ', suffering: ' +
          percent(lerp(state.suffering, 0, e)) + ', freedom: ' +
          percent(lerp(state.freedom, 100, e)) + '; ' + morph('it passes', 'pure and lasting', q, 2),
        'Nerves: ' + nerves.packets_in + '/' + size(nerves.kb_in) + ' in, ' +
          nerves.packets_out + '/' + size(nerves.kb_out) + ' out.'
      ];
    }

    function frame() {
      var s = elapsed();
      var e = clamp(s / ENLIGHTENMENT);
      if (enlightenment) {
        let_go(s);
      }
      // leave room for the hidden command line and its margin, and don't wrap
      var cols = term.cols() - 1;
      var rows = term.rows() - 2;
      var width = 0;
      var columns = TOP_COLUMNS.filter(function (column) {
        width += column.width;
        return width <= cols;
      });
      function format(text, name) {
        text = text.slice(0, cols);
        return $.trim(text) ? '[[;;;' + name + ']' + $.terminal.escape_brackets(text) + ']' : '';
      }
      function row(p) {
        return columns.map(function (column) {
          return pad(column.value(p), column.width);
        }).join('');
      }
      var dissolving = clamp((s - DISSOLVE_START) / DISSOLVING);
      var lines = header(cols, e, s).map(function (line, i) {
        if (DISSOLVED.indexOf(i) !== -1) {
          line = dissolve(line, dissolving, 200 + i);
        }
        return format(line, 'top-text');
      });
      // once the line has gone, type the words like the welcome text
      var start = DISSOLVE_START + DISSOLVING;
      if (s >= start) {
        var typed = Math.floor(FREE.length * clamp((s - start) / (ENLIGHTENMENT - start)));
        lines[FREE_LINE] = format(FREE.slice(0, typed) + (typed < FREE.length ? '_' : ''),
                                  'terminal-welcome');
      }
      lines.push('');
      // the process list, as [text, class] for every line that is left
      var height = Math.max(0, rows - lines.length);
      var table = [[columns.map(function (column) {
        return pad(column.title, column.width);
      }).join(''), 'top-text'], [row(main), 'terminal-welcome']];
      subprocesses.slice().sort(function (a, b) {
        return b.cpu - a.cpu;
      }).forEach(function (p) {
        table.push([row(p), p.glows ? 'terminal-welcome' : 'top-text']);
      });
      table = table.slice(0, height);
      var forming = clamp((s - DROP_START) / DROP_FORMING);
      if (forming > 0) {
        while (table.length < height) {
          table.push(['', 'top-text']);
        }
        var art = drop(cols, height, s - DROP_START);
        table = table.map(function (line, i) {
          return [morph(line[0], art[i], forming, 100 + i),
                  forming < 0.5 ? line[1] : 'top-drop'];
        });
      }
      table.forEach(function (line) {
        lines.push(format(line[0], line[1]));
      });
      return lines.join('\n');
    }

    // The glow of consciousness restarts whenever its line is redrawn, so
    // start each new line where a glow that never stopped would be; during
    // enlightenment all other text glows more and more (--glow in terminal.css)
    function draw() {
      var s = elapsed();
      var glow = clamp(s / ENLIGHTENMENT);
      if (s > ENLIGHTENMENT) {
        glow += 0.2 * Math.sin((s - ENLIGHTENMENT) * 2);
      }
      term[0].style.setProperty('--glow-delay', -(Date.now() % GLOW_PERIOD) + 'ms');
      term[0].style.setProperty('--glow', glow.toFixed(3));
      if (Date.now() - last_tick >= 1000) {
        last_tick = Date.now();
        tick();
      }
      term.update(index, frame());
    }

    function stop(alive) {
      if (stopped) {
        return;
      }
      stopped = true;
      clearInterval(timer);
      document.removeEventListener('keydown', key, true);
      term[0].style.removeProperty('--glow');
      term[0].classList.remove('is-enlightened');
      if (alive) {
        term.remove_line(index);
        done.resolve();
      }
    }

    function key(event) {
      if (!term.enabled()) {
        return;
      }
      var name = event.key;
      if (name === 'Escape' || name === 'q' ||
          (event.ctrlKey && (name === 'c' || name === 'C'))) {
        event.preventDefault();
        event.stopPropagation();
        stop(true);
      }
    }

    term.echo('');
    index = term.last_index();
    if (enlightenment) {
      // only top is left on screen until it is quit (see terminal.css)
      term[0].classList.add('is-enlightened');
    }
    draw();
    document.addEventListener('keydown', key, true);
    // enlightenment is animated, a plain top only changes once a second
    timer = setInterval(function () {
      if (!document.body.contains(term[0])) {
        stop(false); // the window was closed
      } else if (!term.paused()) {
        stop(true); // stopped with Ctrl+D
      } else {
        draw();
      }
    }, enlightenment ? 100 : 1000);
    // the terminal stays paused, without a prompt, until the promise resolves
    return done.promise();
  }

  window.TerminalPrograms = {
    boot: boot,
    atom: atom,
    hydrogen: hydrogen,
    top: top
  };
})(window, document, jQuery);
