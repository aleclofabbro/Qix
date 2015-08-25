define([
    'event',
    'rx'
  ],
  function(_event, Rx) {
    "use strict";
    var _scope_count = 0;
    var _root_scope;
    var _filter_up = function(ev) {
      return ev.channel.startsWith('<');
    };
    var _filter_down = function(ev) {
      return ev.channel.startsWith('>');
    };

    var _init = function(_scope) {
      Rx.Subject.call(_scope);
      _scope.id = _scope_count++;
      this.upstream = _scope.filter(_filter_up);
      this.downstream = _scope.filter(_filter_down);
      return _scope;
    };

    var _proto = Object.create(Rx.Subject.prototype);
    _proto.spawn = function() {
      var _sub_scope = Object.create(_proto);
      _sub_scope.parent = this;
      _init(_sub_scope);

      this.downstream
        .map(_event.bind(null, _sub_scope))
        .subscribe(_sub_scope);

      _sub_scope.upstream
        .map(_event.bind(null, this))
        .subscribe(this);

      return _sub_scope;
    };

    _proto.push = function(channel, payload) {
      this.onNext(_event(this, channel, payload));
    };

    _proto.isRoot = function() {
      return this === _root_scope;
    };

    _proto.root = function() {
      return _root_scope;
    };

    var _root_scope = _init(Object.create(_proto));

    return _root_scope;
  });