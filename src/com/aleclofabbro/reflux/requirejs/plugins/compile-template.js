define([
    'com/aleclofabbro/reflux/cpl/compiler',
    'com/aleclofabbro/reflux/requirejs/plugins/template'
  ],
  function(compiler, tpl) {
    return {
      load: function(name, parentRequire, onload, config) {
        var url = parentRequire.toUrl(name);
        // require(['tpl!' + url], function(tpl) {
        tpl.loadElem(url,
          function(tpl) {
            //_pre_compile(tpl.elem(), function() {
            onload({
              get: function(ctx) {
                var elem = tpl.get();
                compiler.compile(elem, ctx);
                return elem;
              }
            });
          },
          function(err) {
            console.error('reflux compile-template err:', err);
          }
        );
        // });
      }
    }
  });