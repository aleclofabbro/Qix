define([
    '../compile',
    './element'
  ],
  function(compile, tpl) {
    "use strict";
    return {
      load: function(name, parentRequire, onload, config) {
        var url = parentRequire.toUrl(name);
        tpl.loadElem(url,
          function(tpl) {
            onload({
              get: function(parent_ctx, cb) {
                return compile(tpl.clone(), parent_ctx, cb);
              }
            });
          },
          function(err) {
            console.error('qix loader err:', err);
          }
        );
      }
    };
  });