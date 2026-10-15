/*
 * Resizable Terminal + shell.js
 *
 * Adapted from the CodePen "Resizable Terminal + shell.js css" by
 * Jakub T. Jankiewicz (https://jcubic.pl/me):
 * https://codepen.io/jcubic/pen/WZvYGj
 *
 * Built on jQuery Terminal (https://terminal.jcubic.pl), also by
 * Jakub T. Jankiewicz, released under the MIT license.
 * Source: https://github.com/jcubic/jquery.terminal
 *
 * Changes from the original pen: CodePen-specific code (loop guards, preview
 * detection, GitHub ribbon) and the window type and dark mode options have
 * been removed (the window is fixed to ubuntu, dark), and the window markup
 * is created here so there can be several windows on the #terminal-demo
 * page: they open where #terminal-demo is and can be moved around, and
 * maximised to, the surrounding div.post. Each window has its own terminal
 * and working directory and shares the filesystem with the others.
 *
 * Added:
 * - window buttons: close (a fresh window appears 2 seconds after the last
 *   one is closed, typing a welcome text), minimise to the dock and
 *   maximise to div.post
 * - regular and secret commands, password prompts and sudo
 * - password protected directories, shown in purple by ls; cd asks for the
 *   password once per window
 * - executables: files ending in .exe run when their name is typed in the
 *   directory that contains them (see terminal-programs.js)
 * - typing the formula or name of a molecule spawns it as a pure CSS 3D
 *   molecule that floats across the screen (see spawner.js)
 */
$(function () {
  var desktop = $('#terminal-demo');
  if (!desktop.length) {
    return;
  }
  // windows live in div.post (positioned in main.css), so they can be
  // moved around and maximised within it
  var bounds = desktop.closest('.post');
  if (!bounds.length) {
    bounds = desktop;
  }
  bounds.addClass('terminal-bounds');
  var dock = $('<div class="terminal-dock"></div>').appendTo(desktop);
  var escape = $.terminal.escape_brackets;

  var USER = 'user';
  var WELCOME = 'Consciousness can neither be created nor destroyed';
  var WELCOME_DELAY = 70; // ms per character
  var PASSWORD_FILE = ['projects', 'terminal', 'password.txt'];
  // SHA-256 of the sudo password
  var SUDO_HASH = 'e6ac853b27889885ddbb58405172151a22fb2a1583a4345790fd3b751ef4c62e';
  var SUDO_ATTEMPTS = 3;
  // SHA-256 of the password of top --enlightenment
  var ENLIGHTENMENT_HASH = '20c065202e0ea69cb73337e90f5b95ab6bec3d61d09fa025c8f23bc33eb312cf';
  var LOCKED_COLOR = '#c38bff';

  // Password protected directories, mapped to the SHA-256 of their password
  var locks = new WeakMap();
  function locked(hash, dir) {
    locks.set(dir, hash);
    return dir;
  }

  // Fake in memory filesystem: directories are objects, files are strings
  // and executables are functions (see terminal-programs.js). Wrap a
  // directory in locked() to protect it with a password
  var fs = {
    'bin': {
      'atom.exe': TerminalPrograms.atom,
      'boot.exe': TerminalPrograms.boot,
      'hydrogen.exe': TerminalPrograms.hydrogen
    },
    'projects': {
      'hint.txt': 'The consciousness folder only opens for a mind that doubts everything\n' +
                  'except its own thinking. Descartes put it in Latin: "..., ergo sum".',
      // password: cogito
      'consciousness': locked('d2915f0e9118f5ae8dbf87f8e7b3686f73d4905b0776284398949d80255dc575', {
        'hard_problem.txt': 'How the brain takes in light, sound and touch is the easy problem.\n' +
                            'Why any of it feels like something from the inside is the hard\n' +
                            'problem of consciousness (David Chalmers, 1995).',
        'qualia.txt': 'Qualia: the redness of red, the smell of rain, the ache of a sore knee.\n' +
                      'You can describe them in every detail, but the description is not the\n' +
                      'experience.',
        'marys_room.txt': 'Mary knows every physical fact about colour, but has lived her whole\n' +
                          'life in a black and white room. When she walks out and sees a red\n' +
                          'rose for the first time, does she learn something new?\n' +
                          '(Frank Jackson, 1982)',
        'bats.txt': 'We can know everything about how a bat finds its way by echolocation\n' +
                    'and still not know what it is like to be a bat (Thomas Nagel, 1974).',
        'awakening.txt': 'The tree under which the Buddha woke up gave its name to awakening\n' +
                         'itself. Say its name when top asks how to reach enlightenment.'
      }),
      'terminal': {
        'password.txt': 'curiosity'
      }
    }
  };

  function is_dir(obj) {
    return obj !== null && typeof obj === 'object';
  }
  function is_file(obj) {
    return typeof obj === 'string';
  }
  function is_exe(obj) {
    return typeof obj === 'function';
  }
  function child(dir, name) {
    return Object.prototype.hasOwnProperty.call(dir, name) ? dir[name] : undefined;
  }
  // Node at a path (array of names), or undefined
  function lookup(path) {
    var node = fs;
    for (var i = 0; i < path.length; i++) {
      if (!is_dir(node)) {
        return undefined;
      }
      node = child(node, path[i]);
    }
    return node;
  }
  // Path of the directory `dir` relative to `path`, or null if there is none
  function resolve(path, dir) {
    var result = dir[0] === '/' ? [] : path.slice();
    dir.split('/').forEach(function (name) {
      if (name === '..') {
        result.pop();
      } else if (name && name !== '.') {
        result.push(name);
      }
    });
    return is_dir(lookup(result)) ? result : null;
  }

  function pad(text, width) {
    return text + new Array(width - text.length + 1).join(' ');
  }
  function list_commands(win, definitions) {
    var width = Math.max.apply(null, definitions.map(function (definition) {
      return definition.usage.length;
    }));
    win.term.echo(definitions.map(function (definition) {
      return escape(pad(definition.usage, width) + '  ' + definition.description);
    }).join('\n'));
  }
  function names(definitions) {
    return definitions.map(function (definition) {
      return definition.name;
    });
  }
  function find_command(name) {
    return commands.concat(secret_commands).filter(function (definition) {
      return definition.name === name;
    })[0];
  }

  // Ask for a password without showing what is typed
  function ask_password(win, prompt) {
    var term = win.term;
    term.set_mask('');
    return term.read(prompt).then(function (password) {
      term.set_mask(false);
      return password;
    }, function () {
      term.set_mask(false);
      return $.Deferred().reject().promise();
    });
  }

  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buffer) {
      return Array.prototype.map.call(new Uint8Array(buffer), function (byte) {
        return ('0' + byte.toString(16)).slice(-2);
      }).join('');
    });
  }

  // A locked directory stays closed until its password is given in that window
  function is_closed(win, dir) {
    return locks.has(dir) && win.opened.indexOf(dir) === -1;
  }

  // Change to `path`, asking for the password of every closed directory on
  // the way there
  function enter(win, path) {
    var closed = path.map(function (_, i) {
      return path.slice(0, i + 1);
    }).filter(function (prefix) {
      return is_closed(win, lookup(prefix));
    });
    function next() {
      if (!closed.length) {
        win.path = path;
        // the prompt is only redrawn by itself when cd did not ask anything
        win.term.set_prompt(win.term.get_prompt());
        return;
      }
      var prefix = closed.shift();
      var dir = lookup(prefix);
      var name = '/' + prefix.join('/');
      ask_password(win, 'Password for ' + escape(name) + ': ').then(function (password) {
        return Promise.resolve().then(function () {
          return sha256(password);
        }).then(check, function () {
          check(null);
        });
      });
      function check(hash) {
        if (hash === locks.get(dir)) {
          win.opened.push(dir);
          next();
        } else {
          win.term.error('cd: ' + escape(name) + ': permission denied');
        }
      }
    }
    next();
  }

  function sudo(win, command) {
    var attempts = 0;
    function attempt() {
      ask_password(win, '[sudo] password for ' + USER + ': ').then(function (password) {
        return Promise.resolve().then(function () {
          return sha256(password);
        }).then(check, function () {
          check(null);
        });
      });
    }
    function check(hash) {
      if (hash === SUDO_HASH) {
        win.sudo = true;
        execute(win, command);
      } else if (++attempts < SUDO_ATTEMPTS) {
        win.term.echo('Sorry, try again.');
        attempt();
      } else {
        win.term.error('sudo: ' + SUDO_ATTEMPTS + ' incorrect password attempts');
      }
    }
    attempt();
  }

  function secret_help(win) {
    ask_password(win, 'Password: ').then(function (password) {
      var expected = lookup(PASSWORD_FILE);
      if (is_file(expected) && password === expected.trim()) {
        win.unlocked = true;
        win.term.echo('Secret commands:');
        list_commands(win, secret_commands);
      } else {
        win.term.error('help: incorrect password');
      }
    });
  }

  // top, or with --enlightenment (a secret, password protected option) the
  // way consciousness sees its true nature
  function top(win, args) {
    if (!args.length) {
      return TerminalPrograms.top(win.term);
    }
    if (args.length > 1 || args[0] !== '--enlightenment') {
      win.term.error('top: unknown option ' + escape(String(args[0])));
      return;
    }
    function check(hash) {
      if (hash === ENLIGHTENMENT_HASH) {
        // the password prompt has already ended the command, so keep the
        // terminal paused until top is quit
        win.term.pause();
        TerminalPrograms.top(win.term, { enlightenment: true }).then(function () {
          win.term.resume();
        });
      } else {
        win.term.error('top: incorrect password');
      }
    }
    ask_password(win, 'Password: ').then(function (password) {
      return Promise.resolve().then(function () {
        return sha256(password);
      }).then(check, function () {
        check(null);
      });
    });
  }

  // Commands get the window, the parsed arguments and the parsed command
  var commands = [
    {
      name: 'cd',
      usage: 'cd <directory>',
      description: 'change the current directory',
      run: function (win, args) {
        var dir = args.length ? String(args[0]) : '/';
        var path = resolve(win.path, dir);
        if (!path) {
          win.term.error('cd: ' + escape(dir) + ': no such directory');
        } else {
          enter(win, path);
        }
      }
    },
    {
      name: 'ls',
      usage: 'ls',
      description: 'list the files in the current directory',
      run: function (win) {
        var dir = lookup(win.path);
        win.term.echo(Object.keys(dir).map(function (name) {
          if (locks.has(dir[name])) {
            return '[[;' + LOCKED_COLOR + ';]' + escape(name) + '/]';
          }
          if (is_dir(dir[name])) {
            return escape(name) + '/';
          }
          if (is_exe(dir[name])) {
            return '[[;#8ae234;]' + escape(name) + ']';
          }
          return escape(name);
        }).join('\n'));
      }
    },
    {
      name: 'cat',
      usage: 'cat <file>',
      description: 'show the contents of a file',
      run: function (win, args) {
        var name = String(args[0] || '');
        var file = child(lookup(win.path), name);
        if (!name) {
          win.term.error('cat: missing file name');
        } else if (is_exe(file)) {
          win.term.error('cat: ' + escape(name) + ': binary file');
        } else if (!is_file(file)) {
          win.term.error('cat: ' + escape(name) + ': no such file');
        } else {
          win.term.echo(escape(file));
        }
      }
    },
    {
      name: 'echo',
      usage: 'echo <text>',
      description: 'print a line of text',
      run: function (win, args, command) {
        // split_arguments keeps every argument as text, e.g. 007 stays 007
        win.term.echo(escape($.terminal.split_arguments(command.rest).join(' ')));
      }
    },
    {
      name: 'top',
      usage: 'top',
      description: 'show the running processes (Esc or Ctrl+C to quit)',
      run: top
    },
    {
      name: 'sudo',
      usage: 'sudo <command>',
      description: 'run a command as administrator',
      run: function (win, args, command) {
        if (!args.length) {
          win.term.echo('usage: sudo <command>');
        } else {
          sudo(win, command.rest);
        }
      }
    },
    {
      name: 'clear',
      usage: 'clear',
      description: 'clear the terminal window',
      run: function (win) {
        win.term.clear();
      }
    },
    {
      name: 'help',
      usage: 'help',
      description: 'show the available commands',
      run: function (win, args) {
        if (args.length === 1 && args[0] === '--secret') {
          secret_help(win);
        } else if (args.length === 1 && args[0] === '--help') {
          win.term.echo([
            'Usage: help [OPTION]',
            '',
            '  --help     show this help',
            '  --secret   also show the secret commands (asks for the password)'
          ].join('\n'));
        } else if (args.length) {
          win.term.error('help: unknown option ' + escape(String(args[0])));
          win.term.echo("Try 'help --help' for more information.");
        } else {
          win.term.echo('Available commands:');
          list_commands(win, commands);
          win.term.echo("[[;#888;]Try 'help --help' for more options.]");
        }
      }
    }
  ];

  var secret_commands = [
    {
      name: 'molecules',
      usage: 'molecules',
      description: 'list the molecules you can release by typing their formula or name',
      run: function (win) {
        var rows = Spawner.catalog.map(function (m) {
          return [m.formula, m.name, m.aliases.join(', ')];
        });
        var widths = [0, 1].map(function (col) {
          return Math.max.apply(null, rows.map(function (row) {
            return row[col].length;
          }));
        });
        win.term.echo(rows.map(function (row) {
          return escape(pad(row[0], widths[0]) + '  ' + pad(row[1], widths[1]) + '  ' + row[2]);
        }).join('\n'));
      }
    },
    {
      // only lists the secret option: find_command finds the regular top first
      name: 'top',
      usage: 'top --enlightenment',
      description: 'let consciousness see its true nature (asks for a password)',
      run: top
    },
    {
      name: 'terminal',
      usage: 'terminal',
      description: 'open another terminal window',
      run: function () {
        create_window();
      }
    }
  ];

  // Helpers for executables
  function system(win) {
    return {
      origin: function () {
        var rect = win.$el[0].getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    };
  }

  function spawn_molecule(win, input) {
    var keys = Spawner.find(input);
    if (!keys.length) {
      return false;
    }
    var key = keys[Math.floor(Math.random() * keys.length)];
    var origin = system(win).origin();
    var molecule = Spawner.spawnMolecule(key, origin);
    if (!molecule) {
      win.term.error('There are already ' + Spawner.max +
                     ' things flying around, click some to make room');
    } else {
      win.term.echo(escape('Spawned ' + molecule.name + ' (' + molecule.formula + ')' +
                    (keys.length > 1 ? ', one of ' + keys.length +
                     ' molecules that match' : '')));
    }
    return true;
  }

  function execute(win, input) {
    var command = $.terminal.parse_command(input);
    var definition = find_command(command.name);
    if (definition) {
      return definition.run(win, command.args, command);
    }
    // executables only run from the directory that contains them
    var name = command.name.replace(/^\.\//, '');
    var program = child(lookup(win.path), name);
    if (/\.exe$/.test(name) && is_exe(program)) {
      return program(win.term, command.args, system(win));
    }
    if (!spawn_molecule(win, input)) {
      win.term.error(escape(command.name) + ': command not found (type help for a list of commands)');
    }
  }

  function completion(win, term, string, callback) {
    var command = $.terminal.parse_command(term.get_command());
    var cwd = lookup(win.path);
    function dirs(dir) {
      return Object.keys(dir).filter(function (name) {
        return is_dir(dir[name]);
      }).map(function (name) {
        return name + '/';
      });
    }
    if (command.name === 'ls') {
      callback([]);
    } else if (command.name === 'cd') {
      var p = string.split('/').filter(Boolean);
      if (p.length === 1) {
        callback(dirs(string[0] === '/' ? fs : cwd));
      } else {
        if (string[0] !== '/') {
          p = win.path.concat(p);
        }
        if (string[string.length - 1] !== '/') {
          p.pop();
        }
        var dir = lookup(p);
        var prefix = string.replace(/\/[^/]*$/, '');
        // don't give away what is inside a closed directory
        callback(is_dir(dir) && !is_closed(win, dir) ? dirs(dir).map(function (name) {
          return prefix + '/' + name;
        }) : []);
      }
    } else if (command.name === 'cat') {
      callback(Object.keys(cwd).filter(function (name) {
        return is_file(cwd[name]);
      }));
    } else {
      var options = names(commands).concat(Object.keys(cwd).filter(function (name) {
        return is_exe(cwd[name]);
      }));
      if (win.unlocked) {
        options = options.concat(names(secret_commands), Spawner.catalog.map(function (m) {
          return m.formula;
        }));
      }
      callback(options.filter(function (option, i, all) {
        return all.indexOf(option) === i;
      }));
    }
  }

  // ---------------------------------------------------------------------------
  // Windows
  // ---------------------------------------------------------------------------
  var WINDOW = '<div class="shell ubuntu dark shadow">' +
    '<div class="status-bar">' +
    '<div class="buttons">' +
    '<a href="javascript:;" class="close" title="Close"><i>&times;</i></a>' +
    '<a href="javascript:;" class="minimize" title="Minimize"><i>&minus;</i></a>' +
    '<a href="javascript:;" class="enlarge" title="Enlarge"><i>+</i></a>' +
    '</div>' +
    '<div class="title"></div>' +
    '</div>' +
    '<div class="content"></div>' +
    '</div>';
  var CASCADE = 30; // px between windows
  var windows = [];
  var top_z = 1;

  function is_open(win) {
    return windows.indexOf(win) !== -1;
  }

  function raise(win) {
    win.$el.css('zIndex', ++top_z);
  }

  // Where #terminal-demo is, relative to the bounds
  function home() {
    var outer = bounds[0].getBoundingClientRect();
    var inner = desktop[0].getBoundingClientRect();
    return {
      top: inner.top - outer.top - bounds[0].clientTop,
      left: inner.left - outer.left - bounds[0].clientLeft
    };
  }

  function create_window(options) {
    options = options || {};
    var offset = (windows.length % 6) * CASCADE;
    var origin = home();
    var win = {
      $el: $(WINDOW).addClass('terminal-window').appendTo(bounds),
      path: [],
      opened: [], // locked directories whose password was given
      unlocked: false,
      maximised: false,
      minimised: false,
      icon: null
    };
    win.$el.css({ top: origin.top + offset, left: origin.left + offset });
    raise(win);
    win.$el.resizable({
      minHeight: 108,
      minWidth: 250,
      containment: 'parent'
    }).draggable({
      handle: '> .status-bar .title',
      containment: 'parent'
    }).on('mousedown', function () {
      raise(win);
    });
    var title = win.$el.find('.status-bar .title');
    win.$el.find('.close').on('click', function () {
      close_window(win);
    });
    win.$el.find('.minimize').on('click', function () {
      minimise(win);
    });
    win.$el.find('.enlarge').on('click', function () {
      toggle_maximise(win);
    });
    // clicks outside .terminal would make it lose focus
    win.$el.find('.status-bar').on('click', function (event) {
      event.stopPropagation();
      if (is_open(win) && !win.minimised) {
        win.term.focus();
      }
    });
    win.term = win.$el.find('.content').terminal(function (input) {
      if ($.trim(input)) {
        return execute(win, input);
      }
    }, {
      prompt: function (callback) {
        var prompt = USER + '@host:/' + win.path.join('/') + '$ ';
        title.text(prompt);
        callback(prompt);
      },
      completion: function (string, callback) {
        completion(win, this, string, callback);
      },
      greetings: false,
      clear: false,
      checkArity: false
    });
    windows.push(win);
    if (options.welcome) {
      welcome(win, options.welcome);
    }
    return win;
  }

  // Type the welcome text with the glow of the Voyager Golden Record
  // drawings (anim-glow in main.css), followed by an empty line; the command
  // line only appears once it is done
  function welcome(win, text) {
    var term = win.term;
    var length = 1;
    function glow(part) {
      return '[[;;;terminal-welcome]' + escape(part) + ']';
    }
    // typing('echo') types in the command line, which pause() hides, so
    // type into the output instead
    term.pause();
    term.echo(glow(text.slice(0, length)));
    var timer = setInterval(function () {
      if (!is_open(win)) {
        clearInterval(timer);
        return;
      }
      term.update(-1, glow(text.slice(0, ++length)));
      if (length >= text.length) {
        clearInterval(timer);
        term.echo('');
        term.resume();
      }
    }, WELCOME_DELAY);
  }

  // A fresh window appears 2 seconds after the last one is closed
  function close_window(win) {
    windows.splice(windows.indexOf(win), 1);
    stop_animation(win);
    if (win.icon) {
      win.icon.remove();
    }
    win.term.destroy();
    win.$el.remove();
    if (!windows.length) {
      setTimeout(function () {
        create_window({ welcome: WELCOME });
      }, 2000);
    }
  }

  function toggle_maximise(win) {
    win.maximised = !win.maximised;
    var state = win.maximised ? 'disable' : 'enable';
    win.$el.toggleClass('is-maximised', win.maximised)
      .draggable(state)
      .resizable(state);
    raise(win);
  }

  // Run `done` when the CSS animation `name` has finished, or after a
  // timeout in case it never runs (e.g. in a background tab)
  function after_animation(win, name, done) {
    stop_animation(win);
    function finish() {
      stop_animation(win);
      win.$el.removeClass(name);
      done();
    }
    win.$el.addClass(name).on('animationend.window', function (event) {
      if (event.target === this) {
        finish();
      }
    });
    win.animation = setTimeout(finish, 400);
  }
  function stop_animation(win) {
    clearTimeout(win.animation);
    win.$el.off('animationend.window');
  }

  function minimise(win) {
    if (win.minimised) {
      return;
    }
    win.minimised = true;
    win.term.disable();
    after_animation(win, 'is-minimising', function () {
      win.$el.addClass('is-minimised');
    });
    win.icon = $('<button type="button" title="Restore terminal" aria-label="Restore terminal">&gt;_</button>')
      .appendTo(dock)
      .on('click', function (event) {
        event.stopPropagation();
        restore(win);
      });
  }

  function restore(win) {
    win.minimised = false;
    win.icon.remove();
    win.icon = null;
    stop_animation(win);
    win.$el.removeClass('is-minimising is-minimised');
    raise(win);
    after_animation(win, 'is-restoring', $.noop);
    win.term.focus();
  }

  create_window();
});
