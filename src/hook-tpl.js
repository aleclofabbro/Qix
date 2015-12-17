function qix_hook_tpl(seed, value, placeholder, main_scope) {
  var tpl_seed = seed.require('qix-seed!' + value);
  var _destroyed = false;
  as_array(tpl_seed.master.childNodes)
    .forEach(function (node) {
      seed.master.children[0].appendChild(node);
    });
  return function _tpl(scope) {
    if (_destroyed)
      return;
    scope = scope || main_scope;
    var _component = seed.spawn(main_scope, placeholder, 'before');

    placeholder.addEventListener('destroy', _destroy);

    function _destroy() {
      _destroyed = true;
      placeholder.removeEventListener('destroy', _destroy);
      _component.$destroy();
      _component = null;
    }
    _tpl.cmp = _component;
    return _component;
  };
}
qix_hook_tpl.get_deps = function (val) {
  return 'qix-seed!' + val;
};
define_glob_hooker('tpl', qix_hook_tpl, 600);

// function qix_hook_tpl(seed, value, placeholder, main_scope) {
//   var tpl_seed = seed.require('qix-seed!' + value);
//   var _destroyed = false;
//   return function _tpl(scope) {
//     if (_destroyed)
//       return;
//     scope = scope || main_scope;
//     var _parent_cmp = seed.spawn(main_scope, placeholder, 'before');
//     var _container = _parent_cmp.$content[0];
//     var _component = tpl_seed.spawn(scope, _container);
//     placeholder.addEventListener('destroy', _destroy);

//     function _destroy() {
//       _destroyed = true;
//       placeholder.removeEventListener('destroy', _destroy);
//       _component.$destroy();
//       _parent_cmp.$destroy();
//       _parent_cmp = null;
//       _component = null;
//     }
//     _tpl.cmp = _component;
//     return _component;
//   };
// }
// define_glob_hooker('ctx', 'qix-hook-ctx', 800);
// define_glob_hooker('cmp', 'qix-hook-cmp', 700);