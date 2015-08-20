define([
    '../qix',
    './element'
  ],
  function(qix, tpl) {
    return {
      load: function(name, parentRequire, onload, config) {
        var url = parentRequire.toUrl(name);
        tpl.loadElem(url,
          function(tpl) {
            var master_elem = tpl.clone();
            onload({
              get: function(parent_ctx) {
                return qix.compile(master_elem, parent_ctx);
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