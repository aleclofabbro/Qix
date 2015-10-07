;
(function() {
  'use strict';

  function promise(fullfiller) {
    setTimeout(fullfiller.bind(null, fullfill_fn));

    var _fullfillment_array,
      _subscribers = [];

    function fullfill_fn() {
      if (_fullfillment_array)
        return console.warn('Can\'t fullfill a fullfilled Promise:  ', _fullfillment_array, arguments);
      _fullfillment_array = Array.prototype.slice.call(arguments);
      _subscribers.forEach(function(_map_resolve) {
        _map_resolve(_fullfillment_array);
      });
      _subscribers = null;
    }

    function _map_resolve_fn(callback, _fulfill_sub_fn, _fullfillment_array) {
      try {
        var map_result = callback.apply(null, _fullfillment_array);
        _fulfill_sub_fn.apply(null, map_result);
      } catch (err) {
        _fulfill_sub_fn.call(null, err);
      }
    }

    function map(callback) {
      function sub_fullfiller(_fulfill_sub_fn) {
        var _my_map_resolve = _map_resolve_fn.bind(null, callback, _fulfill_sub_fn);
        if (_fullfillment_array)
          _my_map_resolve(_fullfillment_array);
        else
          _subscribers.push(_my_map_resolve);
      }
      return promise(sub_fullfiller);
    }

    return {
      map: map
    };
  };

  if (typeof exports === 'object') {
    module.exports = promise;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return promise;
    });
  } else {
    this.promise = promise;
  }

}.call(this));