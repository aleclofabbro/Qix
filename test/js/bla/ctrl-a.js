define([
    'rx',
    'rx/rx.binding',
    'rx-dom'
  ],
  function(Rx) {
    "use strict";
    return {
      control: function foo(_ctx, spawn) {
        var upstreamer = _ctx.myUpstreamer();
        var receiver = _ctx.myReceiver();
        // var emitter = _ctx.myEmitter();
        
        _ctx.downstream
          .pluck('load')
          .subscribe(function(v) {
            _ctx.elem.innerHTML = v;
          });
        
        var move_disp = Rx.DOM.fromEvent(_ctx.elem, 'mouseover')
          .map('mouse-over')
          .subscribe(upstreamer);

        return move_disp.dispose;
      }

    };
  });

