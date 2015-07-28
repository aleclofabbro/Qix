define([
    'com/aleclofabbro/reflux/cpl/compiler',
    'ramda',
    '_'
  ],
  function(compiler, R) {
    compiler.register('[ctl\\:bind]', function(elem, ctx, root) {
      var compiled = _.template(elem.innerText);
      elem.innerHTML = '';
      var subscr = ctx
        .map(function(ctxob) {
          var attr = elem.getAttribute('ctl:bind');
          var attr_path = attr ? attr.split('.') : [];
          return R.path(attr_path, ctxob);
        })
        .subscribe(
          function(val) {
            elem.innerHTML = compiled({
              ctx: val
            });
          },
          function(err) {

          },
          function() {

          });
    });
  });