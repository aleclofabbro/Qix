define([
    'com/aleclofabbro/qix/cpl/compiler',
    'rx',
    'ramda',
    '_'
  ],
  function(compiler, Rx, R) {
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g,
      evaluate: /\|\|([\s\S]+?)\|\|/g,
      escape: /\|\|\*([\s\S]+?)\|\|/g
    };
    _string_compilers = {};
    var _attr_name = 'ctl:bind-html';
    var _selector = '[' + _attr_name.replace(':', '\\:') + ']';
    var _get_string_compiler = function(_html) {
      if (_string_compilers[_html])
        return _string_compilers[_html];
      else
        return (_string_compilers[_html] = _.template(_html, {
          variable: '$value'
        }));
    };
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