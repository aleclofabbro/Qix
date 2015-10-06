define('qix', [
  './compile',
  './plite',
  './template-loader'
], function(compile, plite, elem_loader) {
  "use strict";

  function _arr_slice(_arr_like) {
    return Array.prototype.slice.call(_arr_like);
  }

  function requireP(modules, localRequire) {
    return plite(function(resolve, reject) {
      (localRequire || require)(modules,
        function() {
          resolve(_arr_slice(arguments));
        }, reject);
    });
  }
  function load(name, parentRequire, onload, config) {
      var url = parentRequire.toUrl(name);
      elem_loader.loadElem(url, function(master_element) {
          function qix_compileTo(to_elem, ctx) {
            master_element.appendTo(to_elem);
            return compile(to_elem.childNodes, ctx);
          }

          function qix_compile(ctx) {
            var _clone = master_element.cloneBody();
            return compile(_clone, ctx)
              .then(function() {
                return _clone.childNodes;
              });
          }

          var qix_elem = Object.create(master_element);
          qix_elem.compileTo = qix_compileTo;
          qix_elem.compile = qix_compile;
          onload(qix_elem);
        },
        function(err) {
          console.error('qix loader err:', err);
        }
      );
    }
  return {
    requireP: requireP,
    compile: compile,
    load: load
  };
});