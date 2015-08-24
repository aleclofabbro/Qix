define([
    'qix!templ.html'
  ],
  function(templ) {
    "use strict";
    return {
      control: function(el, def) {
        // console.log('bind:', el);
        var _inn = el.innerHTML;
        el.innerHTML = '';
        templ.compileTo(el, el.$qix.$spawn(true), function() {
          var text_node = document.createTextNode('');
          el.$qix.$broadcaster.subscribe(function(v) {
            text_node.textContent = '::::' + def.attr.value + '::' + v + '::' + _inn;
          });

          el.insertBefore(text_node, el.childNodes[0])
        });
        return {};
      }
    };
  });