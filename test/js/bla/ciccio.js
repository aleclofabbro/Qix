define([
    'qix!templ.html'
  ],
  function(templ) {
    "use strict";
    return function(resolve, reject, opts, elem, all_done, _ctx, _binder_def) {
      var sub_ctx = {
        ctlx: {
          mover: function(xx) {
            console.log('pèreso!', xx);
          }
        }
      };
      var _inn = elem.innerHTML;
      elem.innerHTML = '';
      templ.compileTo(elem, sub_ctx)
        .then(function(sub_elem) {
          resolve({
            text: sub_ctx.text,
            col: sub_ctx.col.swap
          });
        });

      all_done
        .then(function() {
          console.log('ciccio!!');
        });
    };
  });