define([
  './plite',
  './compilers/elem-controller'
], function(Plite, elemCtrlComp) {
  "use strict";
  compile.TIMEOUT = 5000;
  compile.compilers = [elemCtrlComp];

  var _arr_slice = function(_arr_like) {
    return Array.prototype.slice.call(_arr_like);
  };

  function is_array_like(o) {
    return !!o && 'number' === typeof o.length;
  };

  function compile(_nodes, _ctx) {
    var compile_result = {};
    var nodes;
    if (is_array_like(_nodes))
      nodes = _arr_slice(_nodes);
    else
      nodes = [_nodes];

    var nodes_promises = nodes
      .map(function(curr_node) {
        var node_compilers_promises = compile.compilers
          .map(function(compiler) {
            var compiler_result = compile_result[compiler.name] = {};

            // var _compiler_stack_elem = {
            //   compiler: compiler,
            //   node: curr_node
            // };
            return Plite(function(resolve, reject) {
                compiler(curr_node, _ctx, resolve, reject);
              })
              .then(function(comp_result) {
                compile_result[compiler.name] = comp_result;
                return comp_result;
              });
          });
        return Plite.all(node_compilers_promises)
          .then(function(comp_results_array) {
            return compile(curr_node.childNodes,compile_result);
          });
      });

    return Plite
      .all(nodes_promises)
      //.timeout(compile.TIMEOUT, 'Qix Compile timeout ms:' + compile.TIMEOUT)
      .catch(function(err) {
        console.error('Qix compile error:', err);
        return err;
      })
      .then(function() { //return now is an Array of Arrays of undefineds
        return compile_result;
      });

  };

  return compile;
});