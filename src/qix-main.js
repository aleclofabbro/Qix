define('qix', function () {
  var qix_module = {
    load: function load(name, localrequire, done) {
      localrequire(['qix-seed!' + name], make_qix_component.bind(null, done));
    }
  };
  return qix_module;
});