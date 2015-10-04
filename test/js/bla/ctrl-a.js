define([],
  function() {
    "use strict";
    return function $qix(ctrlctx, resolve, reject) {

      if (ctrlctx.opts())
        ctrlctx.elem.addEventListener('mouseover', function() {
          var mover = ctrlctx.opts().mover;
          mover && mover;
        });
      resolve();
    };
  });