define([
    'qix!templ.html'
  ],
  function(templ) {
    "use strict";
    return function(exports, elem, opts, _ctx, _binder_def) {
      var _export = {
        ctlx: {
          mover: function(xx) {
            console.log('pèreso!', xx);
          }
        }
      };
      var _inn = elem.innerHTML;
      elem.innerHTML = '';
      templ.compileTo(elem, _export, function(sub_elem) {
        exports(_export, true);
      });
      return function() {
        console.log('ciccio!!');
      };
    };
  });