define([
    'rx',
    'rx/rx.binding',
    'rx-dom'
  ],
  function(Rx) {
    "use strict";
    return {
      control: function foo(def, spawn) {
        var receiver = def.receiver();
        var emitter = def.emitter();
        def.ctx.subscribe(function(v){
          console.log('*****',v);
        });
        receiver.pluck('val')
          .subscribe(function(val) {
            el.html = val;

          });
        receiver.pluck('class')
          .subscribe(function(cls) {
            el.class = cls;
          });

        var move_disp = Rx.DOM.fromEvent(def.elem, 'onmouseover')
          .map('mouse-over')
          .subscribe(emitter);

        receiver.subscribe(undefined, move_disp.dispose, move_disp.dispose);
      }

    };
  });

// signal('vai', {}) {
//   signal: 'pippo>vai',
//   payload: {}
// }