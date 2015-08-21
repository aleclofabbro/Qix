define([
    'rx'
  ],
  function(Rx) {
    "use strict";
    return {
      bind: function(el, my_def) {
        // console.log('bind:', el);
        el.innerHTML = '';
        el.$qix.$broadcaster.subscribe(function(v) {
          el.innerHTML = v;
          // console.log('bound', v, el);
        });
        return {};
      }
    };
  });