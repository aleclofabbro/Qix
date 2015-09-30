define([],
  function() {
    "use strict";
    return function(resolve, reject, opts, el, all_done, _ctx, _binder_def) {
      // console.log('bind:', el);
      el.innerHTML = '';
      resolve(function(str) {
        if (el.innerHTML !== str)
          el.innerHTML = str;
      });
      all_done
        .then(function() {
          console.log('dind !!');
        });
    };
  });