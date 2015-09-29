define([],
  function() {
    "use strict";
    var _def_colors = ['red', 'blue'];
    return function(resolve, reject, opts, elem, all_done, _ctx, _binder_def) {
      var b = true,
        _col_arr = _def_colors;
      var _export = {
        swap: function() {
          elem.style.color = _col_arr[Number(b = !b)];
        },
        setColors: function(cols) {
          _col_arr = cols;
        }
      };
      _export.swap();
      resolve(_export);
      all_done
        .then(function() {
          console.log('col !!');
        });
    };
  });