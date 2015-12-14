var global_hookers = [];

function define_glob_hooker(name, hooker, priority) {
  var attr_name = 'qix-' + name;
  var _priority = arguments.length === 3 ? priority : 500;
  global_hookers.push({
    name: name,
    hooker: hooker,
    priority: _priority,
    attr_name: attr_name,
    get_deps: hooker.get_deps || function() {
      return [];
    }
  });
  global_hookers.sort(function(a, b) {
    return a.priority < b.priority;
  });
}