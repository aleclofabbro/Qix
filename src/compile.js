define([
  'signal'
  'require'
], function(_signal, local_require) {
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
    // compila elem
    // se elem.$qix allora è già compilato 

    // forse si può compilare con elem.$qix come parent, e signalualmente clonando l'interno?
    // o forse se già compilato skippare?
    if (elem.$qix)
      throw new Error({
        msg: 'qix : elem already compiled',
        elem: elem
      });


    // BINDERS DEFS
    var _qix_ctrl_defs_array =
      _arr_slice(elem.attributes)
      .map(function(_attr) { // mappa gli attributi matchati con delle definizioni di binder_provider oppure false 
        var match = _attr.name.match(_qix_regexp);
        if (!match)
          return false;
        else {
          var _binder_ns = match[0] === 'qix' ? './binders' : match[0];
          var _binder_name = _attr.name.split(':')[1];
          var _binder_path = [_binder_ns, _binder_name].join('/');

          var _ctrl_ch_name = _attr.value;
          var _emitter_getter = _ctx.emitter.bind(_ctx, _ctrl_ch_name);
          var _receiver_getter = _ctx.receiver.bind(_ctx, _ctrl_ch_name);

          var _def = {
            binder: {
              ns: _binder_ns,
              name: _binder_name,
              path: _binder_path
            },

            channel: _ctrl_ch_name,
            emitter: _emitter_getter,
            receiver: _receiver_getter,

            attr: _attr,
            ctx: _ctx
          };
          _attr.$qix = _def;
          return _def;
        }
      })
      .filter(function(ctrl_def) {
        // filtra quelli non  qix (matchati -> binder_def !== false)
        return ctrl_def !== false;
      });
    // ^ BINDERS DEFS

    //////////////////////////

    // SCOPE
    // var _current_ctx; // il ctx

    // if (_qix_ctrl_defs_array.length) // se ci sono binders allora spawn
    //   _current_ctx = _ctx.spawn();
    // else
    //   _current_ctx = _ctx; // se non ci sono allora il _current_ctx è il _ctx

    // elem.$qix = _current_ctx;
    // ^ SCOPE

    //////////////////////////

    // REQUIRE BINDERS & BIND ALL
    var _qix_binders_paths_array =
      _qix_ctrl_defs_array
      .map(function(_def) { // mappa i binder_def con i path 
        return _def.binder.path;
      });

    var _next_sub_ctx = _ctx;
    var _spawn_ctx = function() {
      if (_next_sub_ctx === _ctx)
        _next_sub_ctx = _sc.spawn();
      // else throw ?
      return _next_sub_ctx;
    };

    local_require(_qix_binders_paths_array, function( /*arguments : binders*/ ) {
      _arr_slice(arguments)
        .forEach(function(binder, index) {
          var _def = _qix_ctrl_defs_array[index];
          binder.control(_def, _spawn_ctx);
        });
      // ^ REQUIRE BINDERS & BIND ALL

      //////////////////////////

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

      //////////////////////////

      // COMPILE CHILDNODES 
      var _childNodes_wait_compile_left = _childNodes_to_compile_array.length; // async count dei compile dei figli 
      if (!_childNodes_wait_compile_left) // se non ci sono childNodes da compilare allora abbiamo finito 
        compiled_callback(elem);
      else
        _childNodes_to_compile_array
        .forEach(function(_child, index) {
          _compile(_child, _next_sub_ctx, function(_sub_elem) {
            _childNodes_wait_compile_left--;
            if (!_childNodes_wait_compile_left) // se non ci sono childNodes da attendeere allora abbiamo finito 
              compiled_callback(_sub_elem);
          });
        });
      // COMPILE CHILDNODES 
      //////////////////////////
    });
  };

  return _compile;
});