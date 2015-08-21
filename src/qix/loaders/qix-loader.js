define([
    '../compiler',
    './element'
  ],
  function(compiler, tpl) {
    "use strict";
    return {
      load: function(name, parentRequire, onload, config) {
        var url = parentRequire.toUrl(name);
        tpl.loadElem(url,
          function(tpl) {
            onload({
              get: function(parent_ctx, cb) {
                return compiler(tpl.clone(), parent_ctx, cb);
              }
            });
          },
          function(err) {
            console.error('qix loader err:', err);
          }
        );
      }
    }
  });