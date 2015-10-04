define([],
  function() {
    "use strict";
    return function $qix(ctrlctx, resolve, reject) {
      ctrlctx.elem.innerHTML = '';
      resolve(function(str) {
        if (ctrlctx.elem.innerHTML !== str)
          ctrlctx.elem.innerHTML = str;
      });
      // all_done
      //   .then(function() {
      //     console.log('dind !!');
      // });
    };
  });