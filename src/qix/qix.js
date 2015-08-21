define('qix', [
  './rootScope',
  './compiler',
  './JsonSubject',
  'require',
], function(rootScope, cpl, JsonSubject, _local_require) {
  "use strict";
  return {
    compile: cpl,
    JsonSubject: JsonSubject,
    bootstrap: function(elem, cb) {
      this.compile(elem, rootScope, function(qel) {
        if (cb)
          cb(qel);
      });
    }
  };
});