  var STATIC_COMPILER = 'qix-static-node-ctrl';
  var qix_node_compilers = (function () {
    function hyphens2underscore(name) {
      return name && name.replace(/-/g, '_');
    }

    function underscore2hyphens(name) {
      return name && name.replace(/_/g, '-');
    }
    var compilers = {};
    compilers[Node.ATTRIBUTE_NODE] = function (attr) {
      return get_compiler_definition(STATIC_COMPILER);
      // var toks = attr.name.split(':');
      // var ctx_name = toks[1];
      // var factory = attr.value.split('#');
      // var module_name = factory[0];
      // var module_prop = factory[1];
      // return get_compiler_definition(module_name, module_prop, ctx_name);
    };

    function get_compiler_definition(module_name, module_prop, ctx_name) {
      return {
        name: hyphens2underscore(ctx_name),
        module_name: module_name,
        module_prop: module_prop
      };
    }

    function static_compiler(node) {
      return get_compiler_definition(STATIC_COMPILER);
    }
    compilers[Node.ELEMENT_NODE] = static_compiler;
    compilers[Node.COMMENT_NODE] = static_compiler;
    compilers[Node.TEXT_NODE] = static_compiler;
    return compilers;
  }());
  define(STATIC_COMPILER, function () {
    return function (node, ctrl_inits, link) {
      return node.cloneNode();
    };
  });