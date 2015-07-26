define(['com/aleclofabbro/dom/cpl/compiler'], function(compiler) {
  compiler.register('[cpl\\:bind]', function(elem, ctx, root) {
    var attr = elem.getAttribute('cpl:bind');
    elem.innerHTML = ctx[attr];
  });
});