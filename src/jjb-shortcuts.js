/*
  JS JS Baby Shortcuts

  A simple and easy way to add shortcuts to your javasript app.

  Thanks to @wesbos for the initial keymap.
  https://github.com/wesbos/keycodes/blob/gh-pages/scripts.js
*/


if(
  // Cutting the Mustard...
  // http://responsivenews.co.uk/post/18948466399/cutting-the-mustard
  'querySelector' in document &&
  'localStorage' in window &&
  'addEventListener' in window
) {

  'use strict';

  jjbShortcuts = function(userShortcuts, userCallback, options) {
      return new jjbShortcuts.init(userShortcuts, userCallback, options);
  };

  (function(sc){

    var callback = null,
        down = [],
        executionTimeout,
        pressed = [],
        shortcuts = [],
        timeouts = [],
        validCombo = [],
        validShortcut = null;

    sc.delay = 500;
    sc.disableFor = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'];
    sc.exceptFor = { 27: 'escape' };
    sc.keys = {
      8   : 'backspace',
      9   : 'tab',
      13  : 'enter',
      16  : 'shift',
      17  : 'ctrl',
      18  : 'alt',
      27  : 'escape',
      32  : 'space',
      33  : 'pageup',
      34  : 'pagedown',
      35  : 'end',
      36  : 'home',
      37  : 'left',
      38  : 'up',
      39  : 'right',
      40  : 'down',
      45  : 'insert',
      46  : 'delete',
      48  : '0',
      49  : '1',
      50  : '2',
      51  : '3',
      52  : '4',
      53  : '5',
      54  : '6',
      55  : '7',
      56  : '8',
      57  : '9',
      60  : '<',
      65  : 'a',
      66  : 'b',
      67  : 'c',
      68  : 'd',
      69  : 'e',
      70  : 'f',
      71  : 'g',
      72  : 'h',
      73  : 'i',
      74  : 'j',
      75  : 'k',
      76  : 'l',
      77  : 'm',
      78  : 'n',
      79  : 'o',
      80  : 'p',
      81  : 'q',
      82  : 'r',
      83  : 's',
      84  : 't',
      85  : 'u',
      86  : 'v',
      87  : 'w',
      88  : 'x',
      89  : 'y',
      90  : 'z',
      91  : 'cmd',      // Windows Key / Left ⌘ / Chromebook Search key
      93  : 'cmd',      // Windows Menu / Right ⌘
      96  : '0',        // Numpad 0
      97  : '1',        // Numpad 1
      98  : '2',        // Numpad 2
      99  : '3',        // Numpad 3
      100 : '4',        // Numpad 4
      101 : '5',        // Numpad 5
      102 : '6',        // Numpad 6
      103 : '7',        // Numpad 7
      104 : '8',        // Numpad 8
      105 : '9',        // Numpad 9
      112 : 'f1',
      113 : 'f2',
      114 : 'f3',
      115 : 'f4',
      116 : 'f5',
      117 : 'f6',
      118 : 'f7',
      119 : 'f8',
      120 : 'f9',
      121 : 'f10',
      122 : 'f11',
      123 : 'f12',
      188 : ',',
      189 : '-',
      190 : '.',
      191 : '/',
      193 : '/',
      220 : '\\',
      222 : '\'',
      223 : '`',
    };
    sc.listening = false;

    var attach = function () {
      document.body.addEventListener('keydown', keyDown, false);
      document.body.addEventListener('keyup', keyUp, false);
      sc.listening = true;
    };

    var detach = function () {
      document.body.removeEventListener('keydown', keyDown, false);
      document.body.removeEventListener('keyup', keyUp, false);
      sc.listening = false;
    };

    var keyDown = function (e) {
      if (
        sc.disableFor.indexOf(e.target.nodeName) >= 0 &&
        !sc.exceptFor[e.which]
      ) return;
      if (!sc.keys[e.which]) return;
      var index, key = sc.keys[e.which];
      index = down.indexOf(key);
      if (index < 0) {
        down[down.length] = key;
        var combo = down.join('+');
        if (shortcuts.indexOf(combo) >= 0) {
          e.preventDefault();
          pressed[pressed.length] = combo;
          timeouts[timeouts.length] = window.setTimeout(function () {
            index = pressed.indexOf(combo);
            if (index >= 0) pressed.splice(index, 1);
          }, sc.delay);
          validCombo = combo.split('+');
        }
      }
    };

    var keyUp = function (e) {
      if (
        sc.disableFor.indexOf(e.target.nodeName) >= 0 &&
        !sc.exceptFor[e.which]
      ) return;
      if (!sc.keys[e.which]) return;
      var index, key = sc.keys[e.which];

      // Clear from the down register
      index = down.indexOf(key);
      if (index >= 0) down.splice(index, 1);

      // Add to the pressed register
      index = validCombo.indexOf(key)
      if (index < 0) {
        pressed[pressed.length] = key;

        // Clear from pressed register after timeut
        timeouts[timeouts.length] = window.setTimeout(function() {
          var index = pressed.indexOf(key);
          if (index >= 0) pressed.splice(index, 1);
        }, sc.delay);
      }

      // Check if the shortcut sequence exists
      if (down.length > 0) return;
      var shortcut = pressed.join(' ');
      if (shortcuts.indexOf(shortcut) >= 0) {
        e.preventDefault();
        validShortcut = shortcut;
        var multiple = 0;
        for (var i = 0; i < shortcuts.length; i++) {
          if (shortcuts[i].substr(0, validShortcut.length) == validShortcut) {
            multiple++;
          }
        }
        var delay = (multiple > 1) ? sc.delay : 0;
        window.clearTimeout(executionTimeout);
        executionTimeout = window.setTimeout(execute, delay);
      }
    };

    var execute = function () {
      // reset all;
      for (var i; i < timeouts.length; i++) {
        window.clearTimeout(timeouts[i]);
      }
      down = [];
      pressed = [];
      validCombo = [];

      if ('function' == typeof(callback)) {
        return callback(validShortcut);
      }
    };

    sc.init = function (userShortcuts, userCallback, options) {
      if (userShortcuts.constructor === Object) {
        shortcuts = Object.keys(userShortcuts);
      } else if (userShortcuts.constructor === Array) {
        shortcuts = userShortcuts;
      }
      callback = userCallback;
      if ('object' == typeof(options)) {
        for (var opt in options) {
          if ('undefined' != typeof(sc[opt])) sc[opt] = options[opt];
        }
      }
      attach();
      return sc;
    };

    sc.pause = function () {
      if (sc.listening) {
        detach();
      } else {
        attach();
      }
    };

  })(jjbShortcuts);

}