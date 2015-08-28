define([],
  function() {
    "use strict";
    var _def_colors = ['red', 'blue'];
    return {
      control: function(ctx) {
        var b = true,
          _col_arr = _def_colors;
        ctx.myReceiver().subscribe(function() {
          el.style.color = _col_arr[Number(b = !b)];
        });
      }
    };
  });