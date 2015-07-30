define([

], function() {
  var _compilers = [];
  var _tmp_elem_cont = document.createElement('div');
  return {
    precompile: function(master_element) {
      _tmp_elem_cont.appendChild(master_element);
      var registered_compilers = [];
      _compilers
        .forEach(function(compiler) {
          compiler.precompile(_tmp_elem_cont, function() {
            registered_compilers.push(compiler);
          });
        });
      master_element.$compilers = function() {
        return registered_compilers;
      };
      _tmp_elem_cont.remove(master_element);
    },
    compile: function(master_element, ctx) {
      var registered_compilers = master_element.$compilers ? master_element.$compilers() : _compilers;
      var compiled_elem = master_element.cloneNode(true);
      _tmp_elem_cont.appendChild(compiled_elem);
      registered_compilers
        .forEach(function(compiler) {
          compiler.compile(_tmp_elem_cont, ctx);
        });
      _tmp_elem_cont.remove(compiled_elem);
      return compiled_elem;
    },
    register: function(compiler) {
      _compilers.push(compiler);
      _compilers
        .sort(function(a, b) {
          return ('pri' in a ? a.pri : 100) > ('pri' in b ? b.pri : 100);
        });
    }
  };
});