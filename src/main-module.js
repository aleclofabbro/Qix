define('qix', function() {
  var qix_module = {
    load: function load(name, localrequire, done) {
      localrequire(['qix-seed!' + name], done);
    }
  };
  return qix_module;
});