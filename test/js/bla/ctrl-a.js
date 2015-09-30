define([],
  function() {
    "use strict";
    return function foo(resolve, reject, opts, elem, all_done, _ctx, _binder_def) {

      if (opts && opts.mover)
        elem.addEventListener('mouseover', opts.mover);
      resolve({});
      all_done
        .then(function() {
          console.log('ctrl-a!!');
        });
    };
  });