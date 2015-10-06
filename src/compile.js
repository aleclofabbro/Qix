define([
  './plite',
  './compilers/elem-controller'
], function(Plite, elemCtrlComp) {
  "use strict";
  compile.TIMEOUT = 5000;
  compile.compilers = [elemCtrlComp];

  function _arr_slice(_arr_like) {
    return Array.prototype.slice.call(_arr_like);
  }

  function is_array_like(o) {
    return !!o && 'number' === typeof o.length;
  }

  function compile(_nodes, _ctx) {
    var nodes = _arr_slice(_nodes);
    var nodes_promises = nodes
      .map(function(curr_node) {
        var node_compilers_promises = compile.compilers
          .map(function(compiler) { // var _compiler_stack_elem = {
            //   compiler: compiler,
            //   node: curr_node
            // };
            return Plite(function(resolve, reject) {
              compiler(curr_node, _ctx, resolve, reject);
            });
          });
        return Plite.all(node_compilers_promises)
          .then(function(comp_results_array) {
            if (curr_node.childNodes.length)
              return compile(curr_node.childNodes, _ctx);
            else
              return _ctx;
          });
      });

    return Plite
      .all(nodes_promises)
      //.timeout(compile.TIMEOUT, 'Qix Compile timeout ms:' + compile.TIMEOUT)
      .catch(function(err) {
        console.error('Qix compile error:', err);
        return err;
      })
      .then(function() {
        return _ctx;
      });

  }

  return function(_nodes, ctx) {
    var nodes = _nodes;
    if (!is_array_like(_nodes))
      nodes = [_nodes];
    return compile(nodes, ctx)
      .then(function(ctx) {
        return ctx;
      });
  };
});