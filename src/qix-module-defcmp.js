define('qix-defcmp', function() {
  function load(name, localrequire, onload, config) {
    var path_and_args = name.split(':');
    var path = path_and_args[0];
    var args = path_and_args[1].split('#');
    var cmp_name = args[0];
    var cmp_priority = args[1];
    localrequire([path], function(cmp) {
      define_glob_stripper(cmp_name, cmp, cmp_priority);
      onload(cmp);
    });
  }
  return {
    load: load
  };
});