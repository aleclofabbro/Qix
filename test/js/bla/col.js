define([],
  function() {
    "use strict";
    var _def_colors = ['red', 'blue'];
    return {
      control: function(el, my_def) {
        var b = true,
          _col_arr = _def_colors;
        el.$qix.$broadcaster.subscribe(function(v) {
          el.style.color = _col_arr[Number(b = !b)];
        });
        return {
          set: function(arr) {
            _col_arr = arr;
          }
        };
      }
    };
  });