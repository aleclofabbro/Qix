define([
    'com/aleclofabbro/reflux/cpl/compiler',
    'rx',
    'ramda',
    '_'
  ],
  function(compiler, Rx, R) {
    var _attr_name = 'ctl:bind-html';
    var _selector = '[' + _attr_name.replace(':', '\\:') + ']';
    compiler.register({
      precompile: function(master_element, register) {
        if (master_element.querySelector(_selector))
          register();
      },
      compile: function(root_elem, ctx, root) {
        var elem_list = root_elem.querySelectorAll(_selector);
        Rx.Observable
          .from(elem_list)
          .subscribe(function(elem) {
            var compiled = _.template(elem.innerText);
            elem.innerHTML = '';
            var subscr = ctx
              .map(function(ctxob) {
                var attr = elem.getAttribute(_attr_name);
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
      }
    });
  });