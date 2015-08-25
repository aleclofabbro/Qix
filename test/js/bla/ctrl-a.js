define(['rx'],
  function(Rx) {
    "use strict";
    return {
      control: function foo(el, i, o) {
        i.filter(R.path(['val']))
          .subscribe(function(val) {
            el.html = val;

          });
        i.filter(R.path(['class']))
          .subscribe(function(cls) {
            el.class = cls;
          });

        var move_disp = Rx.dom.fromEvent(el, 'onmouseover')
          .map('mouse-over')
          .subscribe(o);

        i.subscribe(null, move_disp.dispose, move_disp.dispose);
      }

    };
  });