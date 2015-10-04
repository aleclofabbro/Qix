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

  function compile(_nodes, _ctx) {
    var compile_result = {};
    var nodes;
    if ('number' === typeof _nodes.length)
      nodes = _arr_slice(_nodes);
    else
      nodes = [_nodes];

    var nodes_promises = nodes
      .map(function(curr_node) {
        var node_compilers_promises = compile.compilers
          .map(function(compiler) {
            var _compiler_stack_elem = {
              compiler: compiler,
              node: curr_node
            };
            var compiler_promise = Plite(function(resolve, reject) {
                compiler(curr_node, _ctx, resolve, reject);
              })
              .then(function(result) {
                compile_result[compiler.name] = result;
              });
            return compiler_promise
              .then(function(comp_res) {
                return comp_res;
              });;
          });
        return Plite.all(node_compilers_promises)
          .then(function(results) {
            return compile(curr_node.childNodes, _ctx)
              // .then(function(subs) {
              //   return results.push(subs);
              // });
          });
      });

    return Plite
      .all(nodes_promises)
      .timeout(compile.TIMEOUT, 'Qix Compile timeout ms:' + compile.TIMEOUT)
      .catch(function(err) {
        console.error('Qix compile error:', err);
        return err;
      });

  };

  return compile;
});