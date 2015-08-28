define([
    './signal',
    'rx'
  ],
  function(_signal, Rx) {
    "use strict";
    var _ctx_count = 0;
    var _root_ctx;
    var _filter_up = function(ev) {
      return ev.receiver === '@upstream';
    };
    var _filter_down = function(ev) {
      return ev.receiver === '@downstream';
    };

    var _signal_bouncer = function(ctx,ev){
      return ev.bounce(ctx);
    };
    var _init = function(_ctx) {
      Rx.Subject.call(_ctx);
      _ctx.id = _ctx_count++;
      _ctx.upstream = _ctx.filter(_filter_up);
      _ctx.downstream = _ctx.filter(_filter_down);
      _ctx.signalBouncer = _signal_bouncer.bind(null,this);
      return _ctx;
    };
    var _proto = Object.create(Rx.Subject.prototype);
    _proto.spawn = function() {
      var _sub_ctx = Object.create(_proto); // or this?
      _sub_ctx.parent = this;
      _init(_sub_ctx);
      this.downstream
        .map(this.signalBouncer)
        .subscribe(_sub_ctx);

      _sub_ctx.upstream
        .map(this.signalBouncer)
        .subscribe(this);

      return _sub_ctx;
    };

    _proto.emit = function(emitter_ch, receiver_ch, load) {
      this.onNext(_signal(this, emitter_ch, receiver_ch, load));
    };

    _proto.emitter = function(emitter_ch, receiver_ch) {
      emitter_ch = emitter_ch || '';
      receiver_ch = receiver_ch || '';
      return this.emit.bind(this, emitter_ch, receiver_ch);
    };

    _proto.receiver = function(receiver_ch, emitter_ch) {
      receiver_ch = receiver_ch || false;
      emitter_ch = emitter_ch || false;
      return this
        .filter(function(sign) {
          return (emitter_ch === false || emitter_ch === sign.emitter) && (receiver_ch === false || receiver_ch === sign.receiver);
        });
    };

    _proto.downstreamer = function(emitter_ch) {
      emitter_ch = emitter_ch || '';
      return this.emit.bind(this, emitter_ch, '@downstream');
    };

    _proto.upstreamer = function(emitter_ch) {
      emitter_ch = emitter_ch || '';
      return this.emit.bind(this, emitter_ch, '@upstream');
    };


    _proto.isRoot = function() {
      return this === _root_ctx;
    };

    _proto.root = function() {
      return _root_ctx;
    };

    var _root_ctx = _init(Object.create(_proto));

    return _root_ctx;
  });