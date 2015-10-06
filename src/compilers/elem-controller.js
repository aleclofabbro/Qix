define([
  '../plite'
], function(Plite) {
  "use strict";
  var _arr_slice = function(_arr_like) {
    return Array.prototype.slice.call(_arr_like);
  };
  var _make_ctrl_defs_list = function(elem, _ctx) {
    return _arr_slice(elem.attributes)
      .filter(function(attr) {
        return attr.name.startsWith('qix:');
      })
      .map(function(_attr) {
        var ctx_prop = _attr.name.split(':')[1];
        var path = _attr.value;
        var ns_attrs_getter = function() {
          return _arr_slice(elem.attributes)
            .filter(function(att) {
              return att.name.split(':')[0] === ctx_prop;
            })
            .reduce(function(args_obj, att) {
              args_obj[att.name.split(':')[1]] = att.value;
              return args_obj;
            }, {});
        };
        var _ns_ctx = _ctx[ctx_prop];
        var nsctx_getter = function() {
          if ('function' === typeof _ns_ctx) {
            return _ns_ctx();
          } else
            return _ns_ctx;
        };
        var opts_getter = function() {
          var opts = Object.create(ns_attrs_getter() || null);
          var nsctx = nsctx_getter();
          if (nsctx)
            Object.keys(nsctx)
            .reduce(function(acc, k) {
              acc[k] = nsctx[k];
            }, opts);
          return opts;
        };
        return {
          attr: _attr,
          nsctx: nsctx_getter,
          opts: opts_getter,
          prop: ctx_prop,
          attrs: ns_attrs_getter,
          path: path,
          elem: elem,
          ctx: _ctx
        };
      });
  };

  function retrieve_controller(ctrl_def, resolve_controller, reject_controller) {
    return function(ctrl) {
      var ctrl_args = [ctrl_def, resolve_controller, reject_controller];
      if ('function' === typeof ctrl && ctrl.name === '$qix') {
        ctrl.apply(null, ctrl_args);
      } else if (ctrl && 'function' === typeof ctrl.$qix) {
        ctrl.$qix.apply(ctrl, ctrl_args);
      } else
        resolve_controller(ctrl);
    };
  }

  ctrls.TIMEOUT = 3000;

  function ctrls(node, _ctx, resolve_elem_compile, reject_elem_compile) {
    if (node.nodeType !== 1)
      return resolve_elem_compile();
    var ctrl_defs = _make_ctrl_defs_list(node, _ctx);
    if (!ctrl_defs.length) {
      resolve_elem_compile();
    } else {
      var controllers_defs_promises = ctrl_defs
        .map(function(ctrl_def) {
          return Plite(function(resolve_controller, reject_controller) {
              require([ctrl_def.path], retrieve_controller(ctrl_def, resolve_controller, reject_controller), reject_controller);
            })
            .then(function(controller) {
              // ctrl_def.controller = controller;
              // _ctx[ctrl_def.prop] = ctrl_def;
              // return ctrl_def;
              _ctx[ctrl_def.prop] = controller;
              return controller;
            })
            /*.timeout(ctrls.TIMEOUT, {
              msg: 'Qix elem controller timeout ms:' + ctrls.TIMEOUT,
              ctrl: ctrl_def
            })*/
          ;
        });

      Plite.all(controllers_defs_promises)
        .then(resolve_elem_compile)
        .catch(function(err) {
          console.error('Qix elem controller error:', err);
          reject_elem_compile(err);
          return err;
        });
    }
  };

  return ctrls;
});