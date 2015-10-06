;
(function() {

  'use strict';

  function _apply(args, fn) {
    try {
      return fn.apply(null, args);
    } catch (err) {
      return [err];
    }
  }

  function Promise(resolver) {
    setTimeout(resolver.bind(null, resolution_fn));

    var _resolution_args,
      my_resolve_down;

    function resolution_fn() {
      _resolution_args = arguments;
      my_resolve_down.apply()
      _listeners.forEach(_apply.bind(null, arguments));
    }

    function then(callback) {
      if (_resolution_args)
        setTimeout(_apply.bind(null, _resolution_args, resolution));


      function sub_resolver() {}
      var _sub_promise = Promise(sub_resolver);

      _listeners.push(function() {
        try {
          _resolveall();
        } catch (err) {
          sub_resolver(err);
        }
      });
      return _sub_promise;
    }

    return {
      then: then
    };
  };

  if (typeof exports === 'object') {
    module.exports = Promise;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return Promise;
    });
  } else {
    this.Promise = Promise;
  }

}.call(this));