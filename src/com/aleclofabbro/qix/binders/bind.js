define([
    'com/aleclofabbro/qix/compiler',
    'com/aleclofabbro/qix/ctrls/elem/bind-html',
    'rx'
  ],
  function(compiler, bind, Rx) {
    var _attr_name = 'qix:bind';
    var _selector = '[' + _attr_name.replace(':', '\\:') + ']';
    var _instantiate = function(element) {
      var binder = bind(element);
      (binder.r_value);
    };
    compiler.masterElements
      .subscribe(function(master) {
        if (!master.element.querySelector(_selector))
          return;
        master.instantiate
          .subscribe(_instantiate);
      });


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
            var _orig_html = elem.innerHTML.trim();
            var _compiler = _get_string_compiler(_orig_html || '{{$value}}');
            elem.innerHTML = '';
            var subscr = ctx
              .map(function(ctxob) {
                var attr = elem.getAttribute(_attr_name);
                var attr_path = attr ? attr.split('.') : [];
                return R.path(attr_path, ctxob);
              })
              .subscribe(
                function(ctx) {
                  elem.innerHTML = _compiler(ctx);
                },
                function(err) {

                },
                function() {

                });
          });
      }
    });


  });