define([],
  function() {
    "use strict";
    return function foo(resolve, reject, opts, elem, all_done, _ctx, _binder_def) {

      elem.addEventListener('mouseover', function() {
        opts && opts.mover && opts.mover(elem);
      });
      resolve({});
      all_done
        .then(function() {
          console.log('ctrl-a!!');
        });
    };
  });