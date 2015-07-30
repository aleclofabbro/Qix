define([
    'com/aleclofabbro/reflux/reflux',
    'com/aleclofabbro/reflux/requirejs/plugins/template'
  ],
  function(reflux, tpl) {
    var compiler = reflux.cpl;
    return {
      load: function(name, parentRequire, onload, config) {
        var url = parentRequire.toUrl(name);
        // require(['tpl!' + url], function(tpl) {
        tpl.loadElem(url,
          function(tpl) {
            var master_elem = tpl.get();
            compiler.precompile(master_elem);
            onload({
              get: function(ctx) {
                return compiler.compile(master_elem, ctx);
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