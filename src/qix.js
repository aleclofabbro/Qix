define('qix', [
  './compile',
  './plite',
  './require-plugins/element-loader'
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
          var qix_elem = Object.create(master_element);
          qix_elem.compileTo = function(to_elem, ctx) {
            this.appendTo(to_elem);
            return compile(to_elem.childNodes, ctx);
          };
          qix_elem.compile = function(ctx) {
            var _clone = master_element.cloneBody();
            return compile(_clone, ctx)
              .then(function() {
                return _clone.childNodes;
              });
          };
          qix_elem.appendTo = function(to_elem) {
            var clone = master_element.cloneBody();
            Array.prototype.slice.call(clone.childNodes)
              .forEach(function(ch) {
                to_elem.appendChild(ch);
              });
          };
          onload(qix_elem);
        },
        function(err) {
          console.error('qix loader err:', err);
        }
      );
    }
  };
});