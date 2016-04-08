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

  // Array extensions

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

  // querystring

  var parseQueryString = function (queryString) {
    var i, pairs, pair, query = {};
    if ('string' != typeof(queryString)) return {};
    pairs = queryString.split('&');
    for (i = 0; i < pairs.length; i++) {
      pair = pairs[i].split('=');
      if (pair.length == 1) query[pair[0]] = true;
      if (pair.length == 2) {
        query[pair[0]] = decodeURIComponent(pair[1]);
        if (parseInt(query[pair[0]], 10) + "" == query[pair[0]])
          query[pair[0]] = parseInt(query[pair[0]], 10);
      };
    }
    return query;
  };

  var updateQueryString = function (original_query, updated_params) {
    var param, params, i, pairs = [],
        query = JSON.parse(JSON.stringify(original_query));
    if (updated_params) {
      for (param in updated_params) {
        query[param] = updated_params[param];
      }
    }
    params = Object.keys(query).sort();
    for (i = 0; i < params.length; i++) {
      param = params[i];
      if (true === query[param]) {
        pairs[pairs.length] = param;
      } else if (
        null !== query[param] &&
        false !== query[param] &&
        undefined !== query[param]
      ) {
        pairs[pairs.length] = param + '=' + encodeURIComponent(query[param]);
      }
    }
    return pairs.join('&');
  };

}