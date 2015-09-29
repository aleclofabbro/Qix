define([],
  function() {
    "use strict";
    return function foo(exports, elem, opts, _ctx, _binder_def) {

      elem.addEventListener('mouseover', function() {
        opts && opts.mover && opts.mover(elem);
      });
      exports({});
      return function() {
        console.log('ctrl-a!!');
      };
    };
  });