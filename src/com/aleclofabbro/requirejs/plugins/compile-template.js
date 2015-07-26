define(['com/aleclofabbro/dom/cpl/compiler'],
  function(compiler) {
    return {
      load: function(name, parentRequire, onload, config) {
        var url = parentRequire.toUrl(name);
        parentRequire(['tpl!' + url], function(tpl) {
          //_pre_compile(tpl.elem(), function() {
            onload({
              get: function(ctx) {
                var elem = tpl.get();
                compiler.compile(elem, ctx);
                return elem;
              }
            });
          });
       // });
      }
    }
  });