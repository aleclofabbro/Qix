define([
    'rx'
  ],
  function(Rx) {
    "use strict";
    return {
      bind: function(el, my_def) {
        var b;
        el.$qix.$broadcaster.subscribe(function(v) {
          if (b)
            el.style.color = 'red';
          else
            el.style.color = 'blue';
          b = !b;
        });
        return {};
      }
    };
  });