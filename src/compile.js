define(['bluebird'], function(Promise) {
  "use strict";
  var _TIMEOUT_MS = 5000;
  var _arr_slice = function(_arr_like) {
    return Array.prototype.slice.call(_arr_like);
  };
  //var _qix_regexp = /^qix-.*(?=:)/;  
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
  /* var _interpolator = function(textNode, ctx) {
     if (textNode.textContent.trim() === '*') {
       textNode.textContent = '';
       ctx.subscribe(function(v, ctx) {
         textNode.textContent = 'interpolated:' + v;
       });
     }
   };*/

  var _compile = function(elem, _ctx, compiled_callback) {
    var _ELEMENT_STACK = [];
    return new Promise(function(compile_resolve, compile_reject) {

        // CTRL CONTEXTS
        var _qix_binder_defs_array =
          _arr_slice(elem.attributes)
          .map(function(_attr) { // mappa gli attributi matchati con delle definizioni di binder_provider oppure false 
            var match = _attr.name.match(_qix_regexp);
            if (!match)
              return false;
            else {
              var _binder_ns = match[0].replace('qix-', '').replace(/-/g, '/');
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

        var all_bound_promise;
        if (_qix_binders_paths_array.length)
          all_bound_promise = new Promise(function(all_bound_resolve, all_bound_reject) {
            require(_qix_binders_paths_array, function( /*arguments : binders*/ ) {
              var all_binders_promises = _arr_slice(arguments)
                .map(function(binder, binder_index) {
                  return new Promise(function(binder_resolve, binder_reject) {
                    var _binder_def = _qix_binder_defs_array[binder_index];
                    binder(
                      function(ctrl) {
                        _ctx[_binder_def.ctx_prop] = ctrl;
                        binder_resolve(ctrl);
                      },
                      binder_reject,
                      _ctx[_binder_def.ctx_prop],
                      elem,
                      all_bound_promise,
                      _ctx,
                      _binder_def);
                  });
                });
              Promise.all(all_binders_promises)
                .then(all_bound_resolve, all_bound_reject);
            });
          }, compile_reject);
        else
          all_bound_promise = Promise.resolve([]);

        _ELEMENT_STACK.push(elem);
        // ^ REQUIRE BINDERS & BIND ALL
        all_bound_promise
          .then(function(ctrls) {

            _ELEMENT_STACK.splice(_ELEMENT_STACK.indexOf(elem), 1);

            /* SEZIONE SOSTITUITA CON I SOLI CHILDREN NON CALCOLO I TEXT NODE FINO A PROSSIMO ORDINE !!

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
                      */

            var _childNodes_to_compile_array = _arr_slice(elem.children);

            // COMPILE CHILDNODES 
            var children_compile_promise_array =
              _childNodes_to_compile_array
              .map(function(_child, index) {
                return _compile(_child, _ctx);
              });
            Promise.all(children_compile_promise_array)
              .then(function() {
                compile_resolve(elem);
              }, compile_reject);
            // COMPILE CHILDNODES 
            //////////////////////////
          }, compile_reject);
      })
      .timeout(_TIMEOUT_MS, 'Qix Compile timeout ms:' + _TIMEOUT_MS)
      .catch(function() {
        window.Qix_elemet_stack = _ELEMENT_STACK;
        console.error('Qix compile ELEMENT_STACK:', _ELEMENT_STACK);
      });

  };

  return _compile;
});