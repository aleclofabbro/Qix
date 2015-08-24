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


/*
define([],
  function() {
    "use strict";
    var ctrl = new Rx.Observer(function(v) {
      //v={
      //  deps: Observable,
      //  exports: Observer
      //};
    });
    return ctrl;
  });
*/