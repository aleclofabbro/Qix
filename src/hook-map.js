function qix_hook_map(seed, value, placeholder, main_scope) {
  var _current_components = [];
  var _destroyed = false;

  placeholder.addEventListener('destroy', _destroy);

  function _destroy() {
    _destroy_components();
    _destroyed = true;
    _current_components
      .map(prop.bind(null, '$content'))
      .forEach(remove_elements);
    _current_components = [];
    placeholder.removeEventListener('destroy', _destroy);
  }

  function _destroy_components() {
    _current_components.forEach(function (_component) {
      _component.$destroy();
    });
  }

  function _map(scopes) {
    _destroy_components();
    if ('number' === typeof scopes)
      scopes = Array.apply(null, new Array(scopes));
    _current_components = scopes.map(function (scope, index) {
      var _use_scope = typeof scope === 'object' ? scope : main_scope;
      var _sub_scope = Object.create(_use_scope);
      _sub_scope.$index = index;
      return seed.spawn(_sub_scope, placeholder, 'before');
    });
    _map.cmps = _current_components;
    return _current_components;
  }
  return _map;
}
define_glob_hooker('map', qix_hook_map, 900);