define([],
  function() {
    "use strict";
    return {
      control: function(el, my_def) {
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