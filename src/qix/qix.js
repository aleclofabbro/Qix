define('qix', [
  './compiler',
  './loaders/qix-loader',
  './JsonSubject'
], function(cpl, loader, JsonSubject) {
  return {
    compile: cpl,
    load: loader.load,
    JsonSubject: JsonSubject,
    bootstrap: function(elem, cb) {
      this.compile(elem, null, function(qel) {
        // elem.parentNode.insertBefore(qel, elem);
        // elem.remove();
        cb && cb(qel);
      });
    }
  };
});