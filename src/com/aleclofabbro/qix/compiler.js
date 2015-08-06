define([
  'rx'
], function(Rx) {
  var _master_elements = new Rx.Subject();
  var _to_compile_elems = new Rx.Subject();
  return {
    masterElements: _master_elements
      .map(function(elem) {
        return {
          element: elem,
          instantiate:
        };
      }),
    compileElements: _to_compile_elems
  };
});