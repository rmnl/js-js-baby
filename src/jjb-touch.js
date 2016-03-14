/*
  JS JS Baby Touch

  Extremely light weight touch lib. Only supports swiping left, right,
  up and down.
*/

if(
  // Cutting the Mustard...
  // http://responsivenews.co.uk/post/18948466399/cutting-the-mustard
  'querySelector' in document &&
  'localStorage' in window &&
  'addEventListener' in window
) {

  'use strict';

  jjbTouch = function(touchCallback, validTouches) {
      return new jjbTouch.init(touchCallback, validTouches);
  };

  (function(t){

    t.listening = false;
    t.validTouches = ['left', 'right', 'up', 'down'];
    t.touchCallback = function() {};

    var touch = {
      'x': 0,
      'y': 0,
      'timeout': false
    };

    var attach = function () {
      document.body.addEventListener('touchstart', start, false);
      document.body.addEventListener('touchend', end, false);
      t.listening = true;
    };

    var detach = function () {
      document.body.removeEventListener('touchstart', start, false);
      document.body.removeEventListener('touchend', end, false);
      t.listening = false;
    };

    var start = function (e) {
      touch.x = e.touches[0].screenX;
      touch.y = e.touches[0].screenY;
      touch.timeout = window.setTimeout(function () {
        window.clearTimeout(touch.timeout);
        touch.timeout = false;
      }, 750);
    };

    var end = function (e) {
      if (! touch.timeout || htg.help.active ) return;
      var xDiff = touch.x - e.changedTouches[0].screenX,
          yDiff = touch.y - e.changedTouches[0].screenY,
          direction = false,
          func;
      if (Math.abs(xDiff) < 10 && Math.abs(yDiff) < 10) {
        return;
      }
      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        direction = (xDiff > 0) ? 'left' : 'right';
      } else {
        direction = (yDiff > 0) ? 'up' : 'down';
      }
      if (t.validTouches.indexOf(direction) >= 0) {
        touchCallback(direction);
      }
    };

    t.init = function (touchCallback, validTouches) {
      t.touchCallback = touchCallback;
      t.validTouches = validTouches;
      attach();
      return t;
    };

    t.pause = function () {
      if (t.listening) {
        detach();
      } else {
        attach();
      }
    };

  })(jjbTouch);

}