/*
  JS JS Baby - Misc.

  A collection of miscellaneous functions.
*/

if(
  // Cutting the Mustard...
  // http://responsivenews.co.uk/post/18948466399/cutting-the-mustard
  'querySelector' in document &&
  'localStorage' in window &&
  'addEventListener' in window
) {

  Array.prototype.rm = function (val) {
    var index = this.indexOf(val);
    if (index >= 0) this.splice(index, 1);
    return this.length;
  };

  Array.prototype.has = function (val) {
    return (this.indexOf(val) >= 0);
  };

  Array.prototype.each = function (func, update) {
    for (var i = 0; i < this.length; i++) {
      var result = func(this[i]);
      if (true === update && result ) this[i] = result;
    }
    return this;
  };

  Array.prototype.append = function (val) {
    this[this.length] = val;
    return this;
  };

}