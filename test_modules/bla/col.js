define([],
  function() {
    "use strict";
    var _def_colors = ['red', 'blue'];
    return function $qix(ctrlctx, resolve, reject) {
      var b = true,
        _col_arr = _def_colors;
      var _export = {
        swap: function() {
          ctrlctx.elem.style.color = _col_arr[Number(b = !b)];
        },
        setColors: function(cols) {
          _col_arr = cols;
        }
      };
      _export.swap();
      resolve(_export);
    };
  });