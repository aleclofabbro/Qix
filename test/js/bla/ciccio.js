define([
    'rx'
  ],
  function(Rx) {
    "use strict";
    return {
      bind: function(el) {
        // console.log('bind:', el);
        el.innerHTML = '';
        el.$qix.$broadcaster.subscribe(function(v) {
          el.innerHTML = 'bla - ciccio:' + v;
          // console.log('bound', v, el);
        });
        return {};
      }
    };
  });