define([
    'com/aleclofabbro/qix/qix',
    'com/aleclofabbro/qix/requirejs/plugins/template'
  ],
  function(qix, tpl) {
    return {
      load: function(name, parentRequire, onload, config) {
        var url = parentRequire.toUrl(name);
        tpl.loadElem(url,
          function(tpl) {
            var master_elem = tpl.clone();
            qix.cpl.precompile(master_elem);
            onload({
              compile: function(ctx, appendChildrenTo) {
                var compiled_elem = qix.cpl.compile(master_elem, ctx);
                if (appendChildrenTo)
                  while (compiled_elem.children.length)
                    appendChildrenTo.appendChild(compiled_elem.children[0]);
                else
                  return compiled_elem.children;
              }
            });
          },
          function(err) {
            console.error('qix compile-template err:', err);
          }
        );
      }
    }
  });