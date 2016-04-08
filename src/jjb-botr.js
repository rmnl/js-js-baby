/*
  JS JS Baby - BotR a.k.a. JW Platform Javascript API Kit.

  An Javascript API kit for interacting with the JW Platform API.
  See: http://www.jwplayer.com/

  Make sure to never ever store client credentials. This is for testing only.
*/

if (typeof(botrapi) == 'undefined') {


    /* The initial closure of the API. It takes 3 arguments to
     * initiate the api.
     * key:    the api key of the user.
     * secret: the api secret of the user.
     * login:  if set to true then the key and secret are interpreted
     *         as account_login and account_password and the key
     *         and secret are fetched from the api.
     */
    var botrapi = function(key, secret, login) {
        /* proxy = (typeof proxy === 'function') ? proxy: botrapi.proxy; */
        if (login) {
            return botrapi.login(key, secret);
        } else {
            return botrapi.initAPI(key, secret);
        }
    };


    (function(botrapi) {

        botrapi.base_url = 'https://api.jwplatform.com/v1';

        /* Setup an instance of botrapi
         */
        botrapi.initAPI = function(key, secret) {
            return new botrapi.api(key, secret);
        };

        botrapi.login = function(login, password) {
            var url = botrapi.base_url + '/accounts/credentials/show'
                    + '?api_format=json&account_login='
                    + encodeURIComponent(login) + '&account_password='
                    + encodeURIComponent(password),
            req = botrapi.proxy(url),
            xmlhttp = botrapi.utils.ajax(req, null, null, true);
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                json = botrapi.utils.parse_json(xmlhttp.responseText);
                if (json.status == 'ok') {
                    return new botrapi.api(
                        json.account.key,
                        json.account.secret
                    );
                } else {
                    botrapi.login.error = json.message;
                }
            } else {
                botrapi.login.error = 'XMLHttpRequest exited with status: '
                                    + xmlhttp.status;
            }
            return false;
        };

        botrapi.login.error = '';

        /* Browsers use the same origin policy to disallow cross domain
         * requests. The BotR api does not send Access-Control headers,
         * so most people need to use a proxy to access the server.
         * Overwrite this function to apply your proxy settings to the
         * api call or to format your custom url based on the actual
         * request url
         */
        botrapi.proxy = function (url) {
            return url;
        };

        botrapi.api = function (_key, _secret) {

            /* This variable holds the last know API error message;
             */
            var _error = '';

            /* This function starts executes a call by firing an asynchronous ajax
             * call to the api. You can set a callbacks per call or set global
             * callbacks for the api instance.
             */
            this.call = function (call, params, callback, error_callback) {
                var sqs, req, tmp;
                if (typeof(params) != 'object') params = {};
                sqs = _sign_query_string(params);
                req = _request_url(call, sqs);
                console.log(req);
                if (!callback) callback = this.callback;
                if (!error_callback) error_callback = this.error_callback;
                tmp = botrapi.utils.ajax(
                    req,
                    function (xmlhttp) {
                        var json = botrapi.utils.parse_json(xmlhttp.responseText);
                        if (json) {
                            callback(json);
                        } else {
                            error_callback(req, xmlhttp);
                        }
                    },
                    error_callback
                );
            };

            /* This is the callback that is executed after a succesfull api call.
             * Overide this callback or set it on a per call basis.
             */
            this.callback = function (json) {
                console.log('Executing callback');
                console.log(json);
            };

            /* Function to be executed if a call to the api fails.
             * Overide this callback or set it per call.
             */
            this.error_callback = function () {
                console.log('Executing error_callback');
            };

            /* If the api does not initialize, this call can be used to see
             * why.
             */
            this.error = function () {
                return _error;
            }

            /* Two functions that return the key and the secret of the user.
             * These credentials can be stored in a cookie or web storage for
             * later use on a different page.
             */
            this.key = function () { return _key; };
            this.secret = function () { return _secret; };

            /* Signs the query string and appends the signature
             */
            function _sign_query_string(params) {
                var qs = '', sig = '';

                params['api_key'] = _key;
                params['api_nonce'] = botrapi.utils.nonce(8);
                params['api_timestamp'] = botrapi.utils.timestamp();

                if (typeof(params.api_format) == 'undefined')
                    params['api_format'] = 'json';

                qs = _query_string(params);

                sig = botrapi.utils.sha1(qs + _secret);

                return qs + '&api_signature=' + sig;
            };

            /* Generates the initial ordered and encoded query string which is
             * used to generate the signature
             */
            function _query_string(params) {
                var keys = [], parts = [];
                for (k in params) {
                    keys[keys.length] = k;
                }
                keys.sort();
                for (i in keys) {
                    parts[parts.length] = keys[i] + '=' + encodeURIComponent(params[keys[i]]);
                }
                return parts.join('&');
            };

            /* Returns the complete request url for the XMLHttpRequest
             */
            function _request_url(call, qs) {
                var url = botrapi.base_url;
                if (call[0] != '/') call = '/' + call;
                if (call[call.length - 1] == '/')
                    call = call.substr(0, call.length - 1);
                return botrapi.proxy(url + call + '?' + qs);
            };

        };

        /* Container for generic utility functions
         */
        botrapi.utils = function() {};


        botrapi.utils.dummy = function () {};

        /* Returns the current timestamp in seconds
         */
        botrapi.utils.timestamp = function () {
            return Math.round(new Date().getTime() / 1000);
        };

        /* return a random string of digits with length len
         */
        botrapi.utils.nonce = function (len) {
            var val = '' + parseInt(Math.random() * Math.pow(10, len));
            while (val.length < len) val = '0' + val;
            return val;
        };

        /* Execute an asynchronous call to request_url and fire oncomplete
         * upon successful response or onerror in case of an error.
         */
        botrapi.utils.ajax = function(url, oncomplete, onerror, synchronous) {
            var xmlhttp, async = (synchronous) ? false: true;
            if (window.XMLHttpRequest) {
                // IE>7, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest();
            } else {
                // IE6
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (async) {
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState === 4) {
                        if (xmlhttp.status === 200) {
                            if (oncomplete) {
                                oncomplete(xmlhttp);
                            }
                        } else {
                            if (onerror) {
                                onerror(url, xmlhttp);
                            }
                        }
                    }
                }
            }
            try {
                xmlhttp.open("GET", url, async);
                xmlhttp.send(null);
            } catch (error) {
                if (onerror) {
                    onerror(url, false);
                }
            }
            return xmlhttp;
        };

        botrapi.utils.parse_json = function (data) {
            if ( typeof(data) !== 'string' || !data ) {
                return null;
            }

            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            data = data.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');

            // Make sure the incoming data is actual JSON
            // Logic borrowed from http://json.org/json2.js
            if ( /^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
                .replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {

                // Try to use the native JSON parser first
                return window.JSON && window.JSON.parse ?
                    window.JSON.parse( data ) :
                    (new Function("return " + data))();

            }
            return null;
        };

        /* Calculate the hex sha1 from string s.
         * Script based on sha1.js from Paul Johnston which was released
         * under the BSD License
         * See http://pajhome.org.uk/crypt/md5
         */
        botrapi.utils.sha1 = function (s) {

            /*
             * Encode a string as utf-8.
             * For efficiency, this assumes the input is valid utf-16.
             */
            function str2rstr_utf8(input) {
                var output = "";
                var i = -1;
                var x, y;

                while (++i < input.length) {
                    /* Decode utf-16 surrogate pairs */
                    x = input.charCodeAt(i);
                    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                    if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                        x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                        i++;
                    }

                    /* Encode output as utf-8 */
                    if (x <= 0x7F)
                        output += String.fromCharCode(x);
                    else if (x <= 0x7FF)
                        output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                                      0x80 | ( x         & 0x3F));
                    else if (x <= 0xFFFF)
                        output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                                      0x80 | ((x >>> 6 ) & 0x3F),
                                                      0x80 | ( x         & 0x3F));
                    else if (x <= 0x1FFFFF)
                        output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                                      0x80 | ((x >>> 12) & 0x3F),
                                                      0x80 | ((x >>> 6 ) & 0x3F),
                                                      0x80 | ( x         & 0x3F));
                }
                return output;
            }

            /*
             * Calculate the SHA1 of a raw string
             */
            function rstr_sha1(s) {
              return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
            }

            /*
             * Convert a raw string to an array of big-endian words
             * Characters >255 have their high-byte silently ignored.
             */
            function rstr2binb(input) {
                var output = Array(input.length >> 2);
                for(var i = 0; i < output.length; i++)
                    output[i] = 0;
                for(var i = 0; i < input.length * 8; i += 8)
                    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
                return output;
            }

            /*
             * Calculate the SHA-1 of an array of big-endian words, and a bit length
             */
            function binb_sha1(x, len) {
                /* append padding */
                x[len >> 5] |= 0x80 << (24 - len % 32);
                x[((len + 64 >> 9) << 4) + 15] = len;

                var w = Array(80);
                var a =    1732584193;
                var b = -271733879;
                var c = -1732584194;
                var d =    271733878;
                var e = -1009589776;

                for (var i = 0; i < x.length; i += 16) {
                    var olda = a;
                    var oldb = b;
                    var oldc = c;
                    var oldd = d;
                    var olde = e;

                    for (var j = 0; j < 80; j++) {
                        if (j < 16) w[j] = x[i + j];
                        else w[j] = bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
                        var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
                                                         safe_add(safe_add(e, w[j]), sha1_kt(j)));
                        e = d;
                        d = c;
                        c = bit_rol(b, 30);
                        b = a;
                        a = t;
                    }

                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                    e = safe_add(e, olde);
                }
                return Array(a, b, c, d, e);
            }

            /*
             * Perform the appropriate triplet combination function for the current
             * iteration
             */
            function sha1_ft(t, b, c, d) {
                if(t < 20) return (b & c) | ((~b) & d);
                if(t < 40) return b ^ c ^ d;
                if(t < 60) return (b & c) | (b & d) | (c & d);
                return b ^ c ^ d;
            }

            /*
             * Determine the appropriate additive constant for the current iteration
             */
            function sha1_kt(t) {
                return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
                       (t < 60) ? -1894007588 : -899497514;
            }

            /*
             * Bitwise rotate a 32-bit number to the left.
             */
            function bit_rol(num, cnt) {
                return (num << cnt) | (num >>> (32 - cnt));
            }

            /*
             * Add integers, wrapping at 2^32. This uses 16-bit operations internally
             * to work around bugs in some JS interpreters.
             */
            function safe_add(x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }

            /*
             * Convert an array of big-endian words to a string
             */
            function binb2rstr(input) {
                var output = "";
                for (var i = 0; i < input.length * 32; i += 8)
                    output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
                return output;
            }

            /*
             * Convert a raw string to a hex string
             */
            function rstr2hex(input) {
                try { hexcase } catch(e) { hexcase=0; }
                var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                var output = "";
                var x;
                for (var i = 0; i < input.length; i++) {
                    x = input.charCodeAt(i);
                    output += hex_tab.charAt((x >>> 4) & 0x0F)
                        +  hex_tab.charAt( x        & 0x0F);
                }
                return output;
            }

            return rstr2hex(rstr_sha1(str2rstr_utf8(s)));

        };

    })(botrapi);

}

