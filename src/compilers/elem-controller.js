define([
  '../plite'
], function(P) {
  "use strict";

  function _arr_slice(_arr_like) {
    return Array.prototype.slice.call(_arr_like);
  }


  function ns_attrs_getter(elem, ctx_prop) {
    return _arr_slice(elem.attributes)
      .filter(function(att) {
        return att.name.split(':')[0] === ctx_prop;
      })
      .reduce(function(args_obj, att) {
        args_obj[att.name.split(':')[1]] = att.value;
        return args_obj;
      }, {});
  }


  function nsctx_getter(ns_ctx) {
    if ('function' === typeof ns_ctx) {
      return ns_ctx();
    } else
      return ns_ctx;
  }


  function opts_getter(my_ns_attrs_getter, my_nsctx_getter) {
    var opts = Object.create(my_ns_attrs_getter() || null);
    var nsctx = my_nsctx_getter();
    if (nsctx)
      for (var k in nsctx)
        opts[k] = nsctx[k];
    return opts;
  }




  function _make_ctrl_defs_list(elem, ctx) {
    return _arr_slice(elem.attributes)
      .filter(function(attr) {
        return attr.name.startsWith('qix:');
      })
      .map(function(_attr) {
        var ctx_prop = _attr.name.split(':')[1];
        var ns_ctx = ctx[ctx_prop];
        var path = _attr.value;
        var my_nsctx_getter = nsctx_getter.bind(null, ns_ctx);
        var my_ns_attrs_getter = ns_attrs_getter.bind(null, elem, ctx_prop);
        var my_opts_getter = opts_getter.bind(null, my_ns_attrs_getter, my_nsctx_getter);
        return {
          attr: _attr,
          nsctx: my_nsctx_getter,
          opts: my_opts_getter,
          prop: ctx_prop,
          attrs: my_ns_attrs_getter,
          path: path,
          elem: elem,
          ctx: ctx
        };
      });
  }

  function retrieve_controller(ctrl, ctrl_def, resolve_controller, reject_controller, node_all_ctrls_promise) {
    var ctrl_args = [ctrl_def, resolve_controller, reject_controller, node_all_ctrls_promise];
    if ('function' === typeof ctrl && ctrl.name === '$qix') {
      ctrl.apply(null, ctrl_args);
    } else if (ctrl && 'function' === typeof ctrl.$qix) {
      ctrl.$qix.apply(ctrl, ctrl_args);
    } else {
      var module_result = {
        def: ctrl_def,
        ctrl: ctrl
      };
      resolve_controller(module_result);
    }
  }

  function ctrls(node, _ctx, resolve_elem_compile, reject_elem_compile) {
    if (node.nodeType !== 1)
      return resolve_elem_compile();
    var ctrl_defs = _make_ctrl_defs_list(node, _ctx);
    if (!ctrl_defs.length) {
      resolve_elem_compile();
    } else {
      var controllers_defs_promises = ctrl_defs
        .map(function(ctrl_def) {
          return P(function(resolve_controller, reject_controller) {
              require([ctrl_def.path], function(ctrl){
                retrieve_controller(ctrl, ctrl_def, resolve_controller, reject_controller, node_all_ctrls_promise);
              }, reject_controller);
            })
            .then(function(controller) {
              _ctx[ctrl_def.prop] = controller;
              return ctrl_def;
            });
        });

      var node_all_ctrls_promise = P.all(controllers_defs_promises);
      node_all_ctrls_promise
        .then(resolve_elem_compile);
    }
  };

  return ctrls;
});