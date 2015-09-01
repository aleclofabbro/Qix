define([
    'qix!templ.html'
  ],
  function(templ) {
    "use strict";
    return {
      control: function(ctx, spawn) {
        var subctx = spawn();
        var _inn = ctx.elem.innerHTML;
        ctx.elem.innerHTML = '';
        templ.compileTo(ctx.elem, subctx, function(sub_elem) {
          //debugger;
          ctx.myReceiver()
            .pluck('load')
            .subscribe(subctx.emitter('', 'ctlx'));

          ctx.downstream
            .subscribe(subctx.emitter('', 'col'));
        });
      }
    };
  });