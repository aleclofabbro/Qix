define(['rx'],
  function(Rx) {
    "use strict";
    var _scope_count = 0;
    var _root_scope;
    var Scope = function(parent) {
      if (!!_root_scope && !parent)
        throw new Error('No parent for non-root scope');
      this.$id = _scope_count++;
      this.$broadcaster = new Rx.Subject();
      this.$emitter = new Rx.Subject();
      if (!!_root_scope) {
        parent.$broadcaster
          .map(function(ev) {
            return ev;
          })
          .subscribe(this.$broadcaster);
        this.$emitter
          .map(function(ev) {
            return ev;
          })
          .subscribe(parent.$emitter);
        this.parent = parent;
      }
    };
    Scope.prototype = {
      $spawn: function() {
        var _sub_scope = new Scope(this);
        return _sub_scope;
      },
      $isRoot: function() {
        return this === _root_scope;
      }
    };
    _root_scope = Scope.prototype.$rootScope = Scope.rootScope = new Scope();
    return _root_scope;
  });