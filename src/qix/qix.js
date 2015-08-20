define('qix', [
  './compiler',
  './loaders/qix-loader',
  './JsonSubject'
], function(cpl, loader, JsonSubject) {
  "use strict";
  return {
    compile: cpl,
    load: loader.load,
    JsonSubject: JsonSubject,
    bootstrap: function(elem, cb) {
      this.compile(elem, null, function(qel) {
        cb && cb(qel);
      });
    }
  };
});