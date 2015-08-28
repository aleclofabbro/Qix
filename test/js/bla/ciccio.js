define([
    'qix!templ.html'
  ],
  function(templ) {
    "use strict";
    return {
      control: function(ctx, spawn) {
        //var subctx = spawn();
        var _inn = ctx.elem.innerHTML;
        ctx.elem.innerHTML = '';
        templ.compileTo(ctx.elem, ctx, function(sub_elem) {

        });
      }
    };
  });