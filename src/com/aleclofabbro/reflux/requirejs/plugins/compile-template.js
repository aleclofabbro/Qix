define([
    'com/aleclofabbro/reflux/reflux',
    'com/aleclofabbro/reflux/requirejs/plugins/template'
  ],
  function(reflux, tpl) {
    return {
      load: function(name, parentRequire, onload, config) {
        var url = parentRequire.toUrl(name);
        tpl.loadElem(url,
          function(tpl) {
            var master_elem = tpl.clone();
            reflux.cpl.precompile(master_elem);
            onload({
              compile: function(ctx, appendChildrenTo) {
                var compiled_elem = reflux.cpl.compile(master_elem, ctx);
                if (appendChildrenTo)
                  while (compiled_elem.children.length)
                    appendChildrenTo.appendChild(compiled_elem.children[0]);
                else
                  return compiled_elem.children;
              }
            });
          },
          function(err) {
            console.error('reflux compile-template err:', err);
          }
        );
      }
    }
  });