define([
    'qix!templ.html'
  ],
  function(templ) {
    "use strict";
    return function $qix(ctrlctx, resolve, reject) {
      var sub_ctx = {
        ctlx: {
          mover: function(xx) {
            console.log('pèreso!', xx);
          }
        }
      };
      var _inn = ctrlctx.elem.innerHTML;
      ctrlctx.elem.innerHTML = '';
      templ.compileTo(ctrlctx.elem, sub_ctx)
        .then(function(sub_elem) {
          resolve({
            setText: sub_ctx.text,
            swapCol: sub_ctx.col.swap
          });
        });

    };
  });