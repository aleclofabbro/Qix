define('qix', [
  './compile',
  './plite',
  './template-loader'
], function(compile, promise, elem_loader) {
  "use strict";
  return {
    requireP: function(modules, localRequire) {
      var pr = promise.Promise();
      (localRequire || require)(modules,
        function() {
          return (res([].slice.call(arguments)));
        }, rej);
      return pr;
    },
    compile: compile,
    load: function(name, parentRequire, onload, config) {
      var url = parentRequire.toUrl(name);
      elem_loader.loadElem(url, function(master_element) {
          function qix_compileTo(to_elem, ctx) {
            this.appendTo(to_elem);
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
  };
});