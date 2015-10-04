define([
  '../plite'
], function(Plite) {
  "use strict";

  var _make_ctrl_defs_list = function(elem) {
    return _arr_slice(elem.attributes)
      .filter(function(attr) {
        return attr.name.startsWith('qix:');
      })
      .map(function(_attr) { // mappa gli attributi matchati con delle definizioni di binder_provider oppure false 
        var ctx_prop = _attr.name.split(':')[1];
        var path = _attr.value;

        return binder_def = {
          attr: _attr,
          ctx_prop: ctx_prop,
          path: path
        };
      });
  };


  compile.injectors = {};

  function compile(node, _ctx, resolve_compile, reject_compile) {
    if (node.nodeType !== 1)
      return resolve_compile();
    var ctrl_defs = _make_ctrl_defs_list(node);
    if (!ctrl_defs.length) {
      resolve_compile();
    } else {
      var node_controllers = {};
      var controllers_promises = ctrl_defs
        .map(function(ctrl_def) {
          var controller_promise = Plite(function(resolve_controller, reject_controller) {
            require([ctrl_def.path],
              function(ctrl) {
                if (ctrl && ctrl.$qix) {
                  var binder_object {
                    ctx: _ctx
                  }
                  var injectors = Object.create(compile.injectors);
                  injectors.binderObject = function() {
                    return binder_object;
                  };
                  if ('function' === typeof ctrl.$qix) {
                    ctrl.$qix(binder_object, resolve_controller, reject_controller);
                  } else if (ctrl.$qix instanceof Array) {
                    var injectable = ctrl.$qix.slice();
                    var qix_fn = injectable.pop();
                    var deps_prms = Plite.all(
                        injectable.map(function(injector_name) {
                          var injector_promise = Plite(function(resolve_injector, reject_injector) {
                            if (!(injector_name in injectors))
                              throw new Error('Qix elem controller - injector not found:' + injector_name);
                            injectors[injector_name](binder_object, resolve_injector, reject_injector);
                          });
                          return injector_promise;
                        }))
                      .then(function(deps) {
                        deps.push(resolve_controller, reject_controller);
                        qix_fn.apply(null, deps);
                      }, reject_controller);
                  }
                } else
                  resolve_controller(ctrl);
              });
          });
          return controller_promise
            .then(function(controller) {
              node_controllers[ctrl_def.ctx_prop] = controller;
            });
        });

      Plite.all(controllers_promises)
        .then(resolve_compile, reject_compile);
    }
  };

  return compile;
});