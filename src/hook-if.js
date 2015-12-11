function qix_hook_if(placeholder, seed, main_scope) {
  var _current_component = null;
  var _destroyed = false;

  function _spawn(scope) {
    var _use_scope = typeof scope === 'object' ? scope : main_scope;
    _current_component = seed.spawn(_use_scope, placeholder, 'before');
  }

  placeholder.addEventListener('destroy', _destroy);

  function _destroy() {
    _destroyed = true;
    placeholder.removeEventListener('destroy', _destroy);
    _current_component.$destroy();
  }

  function _if(scope) {
    if (_destroyed)
      return;
    if (!!scope && !_current_component) {
      _spawn(scope);
    } else if (!scope && _current_component) {
      _current_component.$destroy();
      _current_component = null;
    }
    return _current_component;
  }
  return _if;
}
define_glob_hooker('if', qix_hook_if, 1000);