define([

], function() {
  var _compilers = [];
  return {
    precompile: function(master_element) {
      var registered_compilers = [];
      _compilers
        .forEach(function(compiler) {
          compiler.precompile(master_element, function() {
            registered_compilers.push(compiler);
          });
        });
      master_element.$compilers = function() {
        return registered_compilers;
      };
    },
    compile: function(master_element, ctx) {
      if (!('$compilers' in master_element))
        this.precompile(master_element);

      var registered_compilers = master_element.$compilers();

      var compiled_elem = master_element.cloneNode(true);

      registered_compilers
        .forEach(function(compiler) {
          compiler.compile(compiled_elem, ctx);
        });
      return compiled_elem;
    },
    register: function(compiler) {
      _compilers
        .push(compiler);
      _compilers
        .sort(function(a, b) {
          return ('pri' in a ? a.pri : 100) > ('pri' in b ? b.pri : 100);
        });
    }
  };
});