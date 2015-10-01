define('qix', [
  './compile',
  './require-plugins/element-loader'
], function(compile, elem_loader) {
  "use strict";
  return {
    compile: compile,
    load: function(name, parentRequire, onload, config) {
      var url = parentRequire.toUrl(name);
      elem_loader.loadElem(url, function(master_element) {
          var qix_elem = Object.create(master_element);
          qix_elem.compileTo = function(to_elem, ctx, cb) {
            return compile(master_element.cloneBody(), ctx)
              .then(function(_q_elem) {
                Array.prototype.slice.call(_q_elem.childNodes)
                  .forEach(function(ch) {
                    to_elem.appendChild(ch);
                  });
                return _q_elem.childNodes;
              });
          };
          qix_elem.compile = function(ctx, cb) {
            return compile(master_element.cloneBody(), ctx)
              .then(function(_q_elem) {
                return _q_elem.childNodes;
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