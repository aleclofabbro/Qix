define([
    'rx',
    'qix/loaders/qix-loader!../../templ.html'
  ],
  function(Rx, templ) {
    "use strict";
    return {
      bind: function(el, def) {
        // console.log('bind:', el);
        var _inn = el.innerHTML;
        el.innerHTML = '';
        templ.get(el.$qix, function(cpl_el) {
          cpl_el.childNodes[0].childNodes[0].nodeValue += '::::' + def.attr.value + '::::' + _inn;
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