define('qix', [
  './rootScope',
  './compile',
  './JsonSubject',
  'require',
], function(rootScope, compile, JsonSubject, _local_require) {
  "use strict";
  return {
    compile: compile,
    JsonSubject: JsonSubject,
    bootstrap: function(elem, cb) {
      this.compile(elem, rootScope, function(qel) {
        if (cb)
          cb(qel);
      });
    }
  };
});