function qix_hook_if(seed, value, placeholder, main_scope) {
  var _current_component = null;
  var _current_component_scope = null;
  var _destroyed = false;


  placeholder.addEventListener('destroy', _destroy);

  function _destroy() {
    _destroyed = true;
    placeholder.removeEventListener('destroy', _destroy);
    _current_component.$destroy();
    _current_component = null;
    _current_component_scope = null;
  }

  function _if(scope) {
    if (_destroyed)
      return;
    if (!!scope && !_current_component) {
      _current_component_scope = typeof scope === 'object' ? scope : main_scope;
      _current_component = seed.spawn(_current_component_scope, placeholder, 'before');
    } else if (!scope && _current_component) {
      _current_component.$destroy();
      _current_component = null;
      _current_component_scope = null;
    }
    _if.scope = _current_component_scope;
    _if.cmp = _current_component;
    return _current_component;
  }
  if (value === 'true')
    _if(main_scope);
  return _if;
}

define_glob_hooker('if', qix_hook_if, 1000);