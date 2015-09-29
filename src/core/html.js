define([],
  function() {
    "use strict";
    return function(exports, el, opts, _ctx, _binder_def) {
      // console.log('bind:', el);
      el.innerHTML = '';
      exports(function(str) {
        if (el.innerHTML !== str)
          el.innerHTML = str;
      });
      return function() {
        console.log('dind !!');
      };
    };
  });