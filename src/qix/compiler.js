define([
  'require',
  'rx',
  './rootScope',
  'rx.async',
  'rx.experimental',
  'rx.aggregates'
], function(local_require, Rx, rootScope) {
  "use strict";
  var _arr_slice = function(_arr_like) {
    return Array.prototype.slice.call(_arr_like);
  };

  var _qix_regexp = /^qix(?:-*).*(?=:)/;
  // 'qix-sloe:asdsa'.match(_qix_regexp)
  // ["qix-sloe"]
  // 'qix:asdsa'.match(_qix_regexp)
  // ["qix"]
  // 'qix-sloe:asdsa'.match(_qix_regexp)
  // ["qix-sloe"]        

  var _interpolator = function(textNode, scope) {
    if (textNode.textContent.trim() === '*'){
      textNode.textContent = '';
      scope.$broadcaster.subscribe(function(v, scope) {
        textNode.textContent = 'interpolated:' + v;
      });
    }
  };

  var _compile = function(elem, parent_scope, compiled_callback) {
    // compila elem
    // se !parent_scope allora è root 
    // se elem.$scope allora è già compilato 
    if (elem.$scope)
      throw new Error({
        msg: 'scope : elem already compiled',
        elem: elem
      });


    // BINDERS DEFS
    var _qix_binder_defs_array =
      _arr_slice(elem.attributes)
      .map(function(_attr) { // mappa gli attributi matchati con delle definizioni di binder_provider oppure false 
        var match = _attr.name.match(_qix_regexp);
        if (!match)
          return false;
        else {
          var _binder_ns = match[0] === 'qix' ? './binders/' : match[0];
          var _binder_name = _attr.name.split(':')[1];
          var _binder_path = [_binder_ns, _binder_name].join('/');
          return {
            ns: _binder_ns,
            name: _binder_name,
            path: _binder_path,
            attr: _attr
          }
        }
      })
      .filter(function(binder_def) {
        // filtra quelli non  qix (matchati -> binder_def !== false)
        return binder_def !== false;
      });


    // SCOPE
    if (!parent_scope) // se non c'è parent_scope allora parent_scope è root
      parent_scope = rootScope;

    var _current_scope; // il scope

    if (_qix_binder_defs_array.length) // se ci sono binders allora spawn
      _current_scope = parent_scope.$spawn();
    else
      _current_scope = parent_scope // se non ci sono allora il _current_scope è il parent_scope

    elem.$qix = _current_scope;


    // REQUIRE BINDERS & BIND ALL
    var _qix_binders_paths_array =
      _qix_binder_defs_array
      .map(function(binder_def) { // mappa i binder_def con i path 
        return binder_def.path;
      });
    local_require(_qix_binders_paths_array, function( /*arguments*/ ) { // argomenti : binders
      _arr_slice(arguments)
        .forEach(function(binder, index) {
          binder.bind(elem, _qix_binder_defs_array[index]);
        });

      // var _children_scopes = [];
      // ORA PREPARA I NODI FIGLI PER IL PROSSIMO GIRO DI COMPILE 
      var _childNodes_to_compile_array =
        _arr_slice(elem.childNodes)
        .filter(function(_child) {
          // se è un TEXT_NODE allora dallo a INTERPOLATOR e filtralo
          if (_child.nodeType === 3) {
            _interpolator(_child, _current_scope)
            return false;
          }
          // se è un ELEMENT_NODE allora va in _childNodes_to_compile_array
          return _child.nodeType === 1;
        });

      var _childNodes_wait_compile_left = _childNodes_to_compile_array.length; // async count dei compile dei figli 
      if (!_childNodes_wait_compile_left) // se non ci sono childNodes da compilare allora abbiamo finito 
        compiled_callback(_current_scope);
      else
        _childNodes_to_compile_array
        .forEach(function(_child, index) {
          return _compile(_child, _current_scope, function(_child_scope) {
            // _children_scopes[index] = _child_scope;
            _childNodes_wait_compile_left--;
            if (!_childNodes_wait_compile_left) // se non ci sono childNodes da attendeere allora abbiamo finito 
              compiled_callback(_current_scope);
          });
        });
    });

  };

  return function(elem, parent_scope, cb) {
    _compile(elem, parent_scope, function(scope) {
      cb(elem);
    });
  };
});