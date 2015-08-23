define('qix', [
  './rootScope',
  './compile',
  './JsonSubject',
  './require-plugins/element-loader',
  'require',
], function(rootScope, compile, JsonSubject, elem_loader, _local_require) {
  "use strict";
  return {
    compile: compile,
    JsonSubject: JsonSubject,
    load: function(name, parentRequire, onload, config) {
      var url = parentRequire.toUrl(name);
      elem_loader.loadElem(url, function(master_element) {
          onload({
            master: master_element,
            compileTo: function(to_elem, cb) {
              return compile(master_element.clone(), to_elem.$qix, function(_q_elem) {
                Array.prototype.slice.call(_q_elem.childNodes)
                  .forEach(function(ch) {
                    to_elem.appendChild(ch);
                  });
                cb(_q_elem);
              });
            },
            compile: function(parent_qix, cb) {
              return compile(master_element.clone(), parent_qix, cb);
            }
          });
        },
        function(err) {
          console.error('qix loader err:', err);
        }
      );
    },
    bootstrap: function(elem, cb) {
      this.compile(elem, rootScope, function(qel) {
        if (cb)
          cb(qel);
      });
    }
  };
});