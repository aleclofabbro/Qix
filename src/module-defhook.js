// qix-defhook!path/to/hook:name#1000
define('qix-defhook', function() {
  function load(name, localrequire, onload /*, config*/ ) {
    var path_and_args = name.split(':');
    var path = path_and_args[0];
    var args = path_and_args[1].split('#');
    var hook_name = args[0];
    var hook_priority = Number(args[1]);
    localrequire([path], function(hook) {
      define_glob_hooker(hook_name, hook, hook_priority);
      onload(hook);
    });
  }
  return {
    load: load
  };
});