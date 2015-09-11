define([], function() {
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
  var _interpolator = function(textNode, ctx) {
    if (textNode.textContent.trim() === '*') {
      textNode.textContent = '';
      ctx.subscribe(function(v, ctx) {
        textNode.textContent = 'interpolated:' + v;
      });
    }
  };

  var _compile = function(elem, _ctx, compiled_callback) {

    // CTRL CONTEXTS
    var _qix_binder_defs_array =
      _arr_slice(elem.attributes)
      .map(function(_attr) { // mappa gli attributi matchati con delle definizioni di binder_provider oppure false 
        var match = _attr.name.match(_qix_regexp);
        if (!match)
          return false;
        else {
          var _binder_ns = match[0] === 'qix' ? 'qix/core' : match[0];
          var _binder_name = _attr.name.split(':')[1];
          var _binder_path = [_binder_ns, _binder_name].join('/');

          var _ctrl_prop_name = _attr.value;
          var binder_def = {
            attr: _attr,
            ns: _binder_ns,
            name: _binder_name,
            path: _binder_path,
            ctx_prop: _ctrl_prop_name
          };
          return binder_def;
        }
      })
      .filter(function(binder_def) {
        // filtra quelli non  qix (matchati -> binder_def !== false)
        return binder_def !== false;
      });
    // ^ CTRL CONTEXTS

    // REQUIRE BINDERS & BIND ALL
    var _qix_binders_paths_array =
      _qix_binder_defs_array
      .map(function(binder_def) { // mappa i binder_def con i path 
        return binder_def.path;
      });

    require(_qix_binders_paths_array, function( /*arguments : binders*/ ) {
      var _when_elem_done_fns = [],
        _n_pending = arguments.length;
      if (!_n_pending)
        _continue();
      else
        _arr_slice(arguments)
        .forEach(function(binder, binder_index) {
          var _binder_def = _qix_binder_defs_array[binder_index];
          var _stop_compile = false;
          var _done = function(_ctrl, _stop) {
            _stop_compile = _stop || _stop_compile;
            setTimeout(function() {
              _ctx[_binder_def.ctx_prop] = _ctrl;
              _n_pending--;
              if (!_n_pending)
                _continue(_when_elem_done_fns, _stop_compile);
            });
          };
          var when_all_done = binder.control(_done, elem, _ctx[_binder_def.ctx_prop], _ctx, _binder_def);
          _when_elem_done_fns.push(when_all_done);
        });
    });
    // ^ REQUIRE BINDERS & BIND ALL

    var _continue = function(_when_elem_done_fns, _stop_compile) {
      //////////////////////////
      var _resolve = function() {
        _when_elem_done_fns && _when_elem_done_fns
          .forEach(function(fn) {
            fn && fn();
          });
        compiled_callback(elem);
      };

      // FILTER CHILDNODES -> CHILD ELEMENTS [TEXTNODES -> INTERPOLATE]
      // var _children_ctxs = [];
      // ORA PREPARA I NODI FIGLI PER IL PROSSIMO GIRO DI COMPILE 
      var _childNodes_to_compile_array = _arr_slice(elem.childNodes)
        .filter(function(_child) {
          // se è un TEXT_NODE allora dallo a INTERPOLATOR e filtralo
          if (_child.nodeType === 3) {
            _interpolator(_child, _ctx);
            return false;
          }
          // se è un ELEMENT_NODE allora va in _childNodes_to_compile_array
          return _child.nodeType === 1;
        });
      // ^ FILTER CHILDNODES -> CHILD ELEMENTS [TEXTNODES -> INTERPOLATE]
      if (_stop_compile)
        _resolve();
      else {

        //////////////////////////

        // COMPILE CHILDNODES 
        var _childNodes_wait_compile_left = _childNodes_to_compile_array.length; // async count dei compile dei figli 
        if (!_childNodes_wait_compile_left) // se non ci sono childNodes da compilare allora abbiamo finito 
          _resolve();
        else
          _childNodes_to_compile_array
          .forEach(function(_child, index) {
            _compile(_child, _ctx, function(_sub_elem) {
              _childNodes_wait_compile_left--;
              if (!_childNodes_wait_compile_left) // se non ci sono childNodes da attendeere allora abbiamo finito 
                _resolve();
            });
          });
        // COMPILE CHILDNODES 
        //////////////////////////
      }
    };
  };

  return _compile;
});