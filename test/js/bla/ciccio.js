define([
    'qix!templ.html'
  ],
  function(templ) {
    "use strict";
    return function(resolve, reject, opts, elem, all_done, _ctx, _binder_def) {
      var _export = {
        ctlx: {
          mover: function(xx) {
            console.log('pèreso!', xx);
          }
        }
      };
      var _inn = elem.innerHTML;
      elem.innerHTML = '';
      templ.compileTo(elem, _export)
        .then(function(sub_elem) {});
      // setTimeout(function() {
      resolve(_export);

      // }, 100)
      all_done
        .then(function() {
          console.log('ciccio!!');
        });
    };
  });