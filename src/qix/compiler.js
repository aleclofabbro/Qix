define([
  'require',
  'rx',
  './rootScope',
  'rx.async',
  'rx.experimental',
  'rx.aggregates'
], function(local_require, Rx, rootScope) {
  "use strict";
  var _scope_regexp = /^qix(?:-*).*(?=:)/;
  var _interpolator = function(textNode, scope) {
    if (textNode.textContent.trim() === '*')
      scope.$broadcaster.subscribe(function(v, scope) {
        textNode.textContent = 'interpolated:' + v;
      });
  };

  var _compile = function(elem, parent_scope, cb) {
    // compila elem
    // se !parent_scope allora è root 
    // se elem.$scope allora è già compilato 
    if (elem.$scope)
      throw new Error({
        msg: 'scope : elem already compiled',
        elem: elem
      });

    // array di attr
    var _attr_list = Array.prototype.slice.call(elem.attributes);

    // 'scopes-sloe:asdsa'.match(/^qix(?:-*).*(?=:)/)
    // ["scopes-sloe"]
    // 'qix:asdsa'.match(/^qix(?:-*).*(?=:)/)
    // ["qix"]
    // 'qix-sloe:asdsa'.match(/^qix(?:-*).*(?=:)/)
    // ["qix-sloe"]
    var _filtered_attr_defs =
      _attr_list
      .map(function(_attr) { // mappa gli attributi con delle def di binder_provider oppure false 
        var match = _attr.name.match(_scope_regexp);
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
      .filter(function(binder_def) { // filtra quelli non  qix
        return binder_def !== false;
      });

    // IL SCOPE

    if (!parent_scope) // se non c'è parent è root
      parent_scope = rootScope;

    var _current_scope; // il scope
    if (_filtered_attr_defs.length) // se ci sono scope allora spawn
      _current_scope = parent_scope.$spawn();
    else
      _current_scope = parent_scope // se non ci sono allora il scope è il parent
      // -- IL SCOPE
    elem.$qix = _current_scope;

    var _binders_paths =
      _filtered_attr_defs
      .map(function(binder_def) { // mappa i binder_def con binders  
        return binder_def.path;
      });
    local_require(_binders_paths, function() {
      var _binders = Array.prototype.slice.call(arguments);
      _binders.forEach(function(binder, index) {
        binder.bind(elem, _filtered_attr_defs[index]);
      });
      _continue_crawl();
    });



    var _child_nodes_arr = Array.prototype.slice.call(elem.childNodes);
    var _childNodes_to_compile_array =
      _child_nodes_arr
      .filter(function(_child) {
        if (_child.nodeType === 3) {
          _interpolator(_child, _current_scope)
          return false;
        }
        return _child.nodeType === 1;
      });

    var _childNodes_to_compile_async_number = _childNodes_to_compile_array.length;
    // var _children_scopes = [];
    var _continue_crawl = function() {
      if (!_childNodes_to_compile_async_number)
        cb(_current_scope);
      else
        _childNodes_to_compile_array
        .forEach(function(_child, index) {
          return _compile(_child, _current_scope, function(_child_scope) {
            // _children_scopes[index] = _child_scope;
            if (!--_childNodes_to_compile_async_number)
              cb(_current_scope);
          });
        });
    };
  };

  return function(elem, parent_scope, cb) {
    return _compile(elem, parent_scope, function(scope) {
      cb(elem);
    });
  };
});