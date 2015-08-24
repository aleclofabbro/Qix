define([
  'require'
], function(local_require) {
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

  // _.templateSettings = {
  //   interpolate: /\{\{(.+?)\}\}/g,
  //   evaluate: /\|\|([\s\S]+?)\|\|/g,
  //   escape: /\|\|\*([\s\S]+?)\|\|/g
  // };
  var _interpolator = function(textNode, scope) {
    if (textNode.textContent.trim() === '*') {
      textNode.textContent = '';
      scope.$broadcaster.subscribe(function(v, scope) {
        textNode.textContent = 'interpolated:' + v;
      });
    }
  };

  var _compile = function(elem, _scope, compiled_callback) {
    // compila elem
    // se elem.$qix allora è già compilato 

    // forse si può compilare con elem.$qix come parent, e eventualmente clonando l'interno?
    // o forse se già compilato skippare?
    if (elem.$qix)
      throw new Error({
        msg: 'qix : elem already compiled',
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
          var _binder_ns = match[0] === 'qix' ? './binders' : match[0];
          var _binder_name = _attr.name.split(':')[1];
          var _binder_path = [_binder_ns, _binder_name].join('/');

          // qix-ns:attr='frctl:prp#ctlname'
          var _attr_val_arr = _attr.value.split('#');
          var _ctrlname = _attr_val_arr[1];
          var _deps = _attr_val_arr[0].split(':');
          return {
            ns: _binder_ns,
            name: _binder_name,
            path: _binder_path,
            ctrlname: _ctrlname,
            deps: _deps,
            attr: _attr
          };
        }
      })
      .filter(function(binder_def) {
        // filtra quelli non  qix (matchati -> binder_def !== false)
        return binder_def !== false;
      });


    var _current_scope; // il scope

    if (_qix_binder_defs_array.length) // se ci sono binders allora spawn
      _current_scope = _scope.$spawn();
    else
      _current_scope = _scope; // se non ci sono allora il _current_scope è il _scope

    elem.$qix = _scope;


    // REQUIRE BINDERS & BIND ALL
    var _qix_binders_paths_array =
      _qix_binder_defs_array
      .map(function(binder_def) { // mappa i binder_def con i path 
        return binder_def.path;
      });
    local_require(_qix_binders_paths_array, function( /*arguments : binders*/ ) {
      _arr_slice(arguments)
        // .sort(functon(binder){}) // can be sorted before call
        .forEach(function(binder, index) {
          var _def = _qix_binder_defs_array[index];
          var _ctrl = binder.control(elem, _def);
          _def.attr.$qix = _ctrl;
          _current_scope[_def.ctrlname] = _ctrl;
        });

      // var _children_scopes = [];
      // ORA PREPARA I NODI FIGLI PER IL PROSSIMO GIRO DI COMPILE 
      var _childNodes_to_compile_array = _arr_slice(elem.childNodes)
        .filter(function(_child) {
          // se è un TEXT_NODE allora dallo a INTERPOLATOR e filtralo
          if (_child.nodeType === 3) {
            _interpolator(_child, _current_scope);
            return false;
          }
          // se è un ELEMENT_NODE allora va in _childNodes_to_compile_array
          return _child.nodeType === 1;
        });

      var _childNodes_wait_compile_left = _childNodes_to_compile_array.length; // async count dei compile dei figli 
      if (!_childNodes_wait_compile_left) // se non ci sono childNodes da compilare allora abbiamo finito 
        compiled_callback(elem);
      else
        _childNodes_to_compile_array.forEach(function(_child, index) {
          return _compile(_child, _current_scope, function(_child_scope) {
            // _children_scopes[index] = _child_scope;
            _childNodes_wait_compile_left--;
            if (!_childNodes_wait_compile_left) // se non ci sono childNodes da attendeere allora abbiamo finito 
              compiled_callback(elem);
          });
        });
    });

  };

  return _compile;
});