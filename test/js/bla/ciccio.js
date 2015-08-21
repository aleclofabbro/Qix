define([
    'rx',
    'qix/loaders/qix-loader!../../templ.html'
  ],
  function(Rx, templ) {
    "use strict";
    return {
      bind: function(el) {
        // console.log('bind:', el);
        el.innerHTML = '';
        templ.get(el.$qix, function(cpl_el) {
          el.appendChild(cpl_el);
        });
        // el.$qix.$broadcaster.subscribe(function(v) {
        //   el.innerHTML = 'bla - ciccio:' + v;
        //   // console.log('bound', v, el);
        // });
        return {};
      }
    };
  });