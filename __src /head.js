(function() {
    'use strict';

    function noop() {};

    function id(v) {
      return v;
    };

    function safe_string(str) {
      return (str === null || str === void(0)) ? '' : String(str);
    }

    function prop_setter(prop, obj, val) {
      return obj[prop] = val;
    }

    function safe_string_prop_setter(prop, obj, str) {
      return obj[prop] = safe_string(str);
    }

    function is_array_like(obj) {
      return ('length' in obj) && ('number' === typeof obj.length);
    }

    function as_array(obj) {
      return is_array_like(obj) ? Array.prototype.slice.call(obj) : [obj];
    }

    var get_remote_text = (function() {
      function get_remote_text(url, callback) {
        var xhr = createXMLHTTPObject();
        if (!xhr)
          throw new Error('NO XHR!');
        xhr.responseType = 'text';
        xhr.open('GET', url, true);
        // xhr.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
        xhr.onreadystatechange = function() {
          if (xhr.readyState != 4)
            return;
          if (xhr.status != 200 && xhr.status != 304) {
            throw new Error('get_remote_text HTTP error for [' + url + '] : ' + xhr.status);
          }
          callback(xhr.responseText);
        }
        if (xhr.readyState == 4)
          return;
        xhr.send();
      }

      var XMLHttpFactories = [
        function() {
          return new XMLHttpRequest()
        },
        function() {
          return new ActiveXObject('Msxml2.XMLHTTP')
        },
        function() {
          return new ActiveXObject('Msxml3.XMLHTTP')
        },
        function() {
          return new ActiveXObject('Microsoft.XMLHTTP')
        }
      ];

      function createXMLHTTPObject() {
        var xmlhttp = false;
        for (var i = 0; i < XMLHttpFactories.length; i++) {
          try {
            xmlhttp = XMLHttpFactories[i]();
          } catch (e) {
            continue;
          }
          break;
        }
        return xmlhttp;
      }
      return get_remote_text;
    })();
    /*
     * qix-seed loader
     **/
    define('qix-seed', function() {

      function path_relative_to(baseurl, path) {
        if (path.startsWith('.'))
          return baseurl + path;
        else
          return path;
      }

      function load(name, localrequire, onload, config) {
        var baseurl = name.substring(0, name.lastIndexOf('/') + 1);
        var path_resolver = path_relative_to.bind(null, baseurl);
        // var url = localrequire.toUrl(name);
        // get_remote_text(url, function(text) {
        localrequire(['text!' + name], function(text) {
          var component_seed = {
            text: text,
            require: function(deps) {
              if (Array.prototype.isPrototypeOf(deps)) {
                var args = as_array(arguments);
                args[0] = args[0].map(path_resolver);
                return require.apply(null, args);
              } else {
                var _local_path = path_resolver(deps);
                return require(_local_path);
              }
            }
          };
          onload(component_seed);
        });
      }
      return {
        load: load
      };
    });


    /*
     * text loader
     **/
    define('text', function() {
      function load(name, localrequire, onload, config) {
        var url = localrequire.toUrl(name);
        get_remote_text(url, onload);
      }
      return {
        load: load
      };
    });