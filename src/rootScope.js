define(['rx'],
  function(Rx) {
    "use strict";
    var _scope_count = 0;
    var _root_scope;
    var _Scope_init = function(parent) {
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
    var _Scope_proto = {
      $spawn: function(isolate) {
        var _sub_scope = Object.create(isolate ? _Scope_proto : this);
        _Scope_init.call(_sub_scope, this);
        return _sub_scope;
      },
      $isRoot: function() {
        return this === _root_scope;
      },
      $emit: function(v) {
        this.$emitter.onNext(v);
      },
      $broadcast: function(v) {
        this.$broadcaster.onNext(v);
      },
      $root: function() {
        return _root_scope;
      }
    };
    var _tmp_root = Object.create(_Scope_proto);
    _Scope_init.call(_tmp_root);
    _root_scope = _tmp_root;
    return _root_scope;
  });