function qix_hook_map(placeholder, seed, main_scope) {
  var _current_components = [];
  var _destroyed = false;

  placeholder.addEventListener('destroy', _destroy);

  function _destroy() {
    _destroyed = true;
    _current_components
      .map(prop.bind(null, '$content'))
      .forEach(remove_elements);
    _current_components = [];
    placeholder.removeEventListener('destroy', _destroy);
  }


  function _map(scopes) {
    _current_components.forEach(function(_sub_component) {
      _sub_component.$destroy();
    });
    _current_components = scopes.map(function(scope, index) {
      var _use_scope = typeof scope === 'object' ? scope : main_scope;
      var _sub_scope = Object.create(_use_scope);
      _sub_scope.$index = index;
      return seed.spawn(_sub_scope, placeholder, 'before');
    });
    return _current_components;
  }
  return _map;
}
define_glob_hooker('map', qix_hook_map, 900);

// define_glob_hooker('ctx', 'qix-hook-ctx', 800);
// define_glob_hooker('cmp', 'qix-hook-cmp', 700);
// define_glob_hooker('tpl', 'qix-hook-tpl', 600);