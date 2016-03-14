/*
  JS JS Baby Shortcut Help

  Create a overlay to show help for your keyboard shortcuts.
  Requires: jjb-shortcut-help.css
*/

if(
  // Cutting the Mustard...
  // http://responsivenews.co.uk/post/18948466399/cutting-the-mustard
  'querySelector' in document &&
  'localStorage' in window &&
  'addEventListener' in window
) {

  'use strict';

  jjbShortcutHelp = function(user_shortcuts, user_check, options) {
      return new jjbShortcutHelp.init(user_shortcuts, user_check, options);
  };

  (function(sch){

    sch.active = false;
    sch.check = undefined;
    sch.title = '';

    var modal;
    var overruledEscape;
    var shortcuts = {};

    var createModal = function () {
      // Create the modal
      modal = document.createElement('div');
      modal.id = 'jjb-shortcuts-modal';
      modal.classList.add('jjb-fade');
      modal.style.display = 'none';
      modal.innerHTML = '\
        <div id="jjb-shortcuts-container">\
          <h4 id="jjb-shortcuts-title">' + sch.title + '</h4>\
          <table>\
            <tbody id="jjb-shortcuts-tbody">\
            </tbody>\
          </table>\
          <div id="jjb-shortcuts-close">&#215;</div>\
        </div>\
      ';
      document.body.appendChild(modal);
      document.getElementById('jjb-shortcuts-close').addEventListener(
        'click', sch.hide, false
      );
    };

    var updateModal = function () {
      var combos, combo, html = '', i, j, keys;
      for (combo in shortcuts) {
        html += '\
          <tr>\
            <td class="jjb-shortcuts-keys">\
        ';
        combos = combo.split(', ');
        for (i = 0; i < combos.length; i++) {
          if (i > 0) html += '<span class="jjb-shortcuts-or">or</span>';
          keys = combos[i].split(' ');
          for (j = 0; j < keys.length; j++) {
            if (j > 0) html += '<span class="jjb-shortcuts-then">then</span>';
            html += '\
              <span class="jjb-shortcuts-key">' + keys[j] + '</span>\
            ';
          }
        }
        html += '\
            </td>\
            <td class="jjb-shortcuts-text">' + shortcuts[combo] + '</td>\
          </tr>\
        ';
      }
      document.getElementById('jjb-shortcuts-tbody').innerHTML = html;
    };

    sch.init = function (user_shortcuts, options) {
      if ('object' == typeof(options)) {
        for (var opt in options) {
          if ('undefined' != typeof(sch[opt])) {
            sch[opt] = options[opt];
          }
        }
      }
      createModal();
      sch.update(user_shortcuts);
      return sch;
    };

    sch.update = function (user_shortcuts) {
      if ('object' == typeof(user_shortcuts)) shortcuts = user_shortcuts;
      updateModal();
    };

    sch.toggle = function (user_shortcuts) {
      if (true === sch.active) {
        sch.hide();
      } else {
        sch.show(user_shortcuts);
      }
    };

    sch.show = function (user_shortcuts) {
      sch.update(user_shortcuts);
      var open = ('function' == typeof(sch.check)) ? sch.check() : true;
      if (true === open) {
        modal.classList.add('jjb-in');
        sch.active = true;
      }
    };

    sch.hide = function () {
      modal.classList.remove('jjb-in');
      sch.active = false;
    };

  })(jjbShortcutHelp);

}
