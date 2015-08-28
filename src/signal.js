define(function() {
  var _signal_proto = {
    bounce: function(to_ctx) {
      var _sign = Object.create(this);
      _sign.target = to_ctx;
      _sign.from = this;
      return _sign;
    }
  };
  var makeSignal = function(ctx, emitter_ch, receiver_ch, load) {
    var signal = Object.create(_signal_proto);
    signal.receiver = receiver_ch;
    signal.emitter = emitter_ch;
    signal.load = load;
    signal.root = signal;
    signal.target = ctx;
    return signal;
  };
  return makeSignal;
});