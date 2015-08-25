define(function() {
  var _event_proto = {};
  var makeEvent = function(scope, channel, payload) {
    var ev;
    if (_event_proto.isPrototypeOf(channel)) {
      var _from_event = channel;
      ev = Object.create(_from_event);
      ev.from = _from_event;
    } else {
      ev = Object.create(_event_proto);
      ev.channel = channel;
      ev.payload = payload;
    }
    ev.target = scope;
    return ev;
  };
  return makeEvent;
});