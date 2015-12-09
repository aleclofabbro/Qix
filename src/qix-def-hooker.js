define('qix-hook-if', function () {
  return function (placeholder, seed, main_scope) {
    var current = null;
    return function (cond, scope) {
      if (cond) {
        if (!current)
          current = seed.spawn(scope || main_scope, placeholder, 'before');
        return current;
      } else {
        if (current) {
          current.$message('unbind');
          remove(current.$content);
          current = null;
        }
      }
    };
  };
});

var global_hookers = [];

function define_glob_hooker(name, hooker_path, priority) {
  var attr_name = 'qix-' + name;
  require([hooker_path], function (hooker) {
    global_hookers.push({
      hooker_path: hooker_path,
      name: name,
      hooker: hooker,
      priority: Number(priority || 500),
      hook_one: function (elem, local_require) {
        var hook_elem = select_has_attr(attr_name, elem);
        if (!hook_elem)
          return null;
        var attr_val = remove_attribute(attr_name, hook_elem);
        var placeholder = document.createComment('qix-hooker:' + name);
        replace_node(hook_elem, placeholder);
        var holder = document.createElement('div');
        holder.appendChild(hook_elem);
        var hooker_seed = make_template_seed(holder, local_require);

        return {
          factory: hooker.bind(null, placeholder, hooker_seed),
          scope_name: attr_val
        };
      }
    });
    global_hookers.sort(function (a, b) {
      return a.priority < b.priority;
    });
  });
}

define_glob_hooker('if', 'qix-hook-if', 1000);
// define_glob_hooker('map', 'qix-hook-map', 900);
// define_glob_hooker('ctx', 'qix-hook-ctx', 800);
// define_glob_hooker('cmp', 'qix-hook-cmp', 700);
// define_glob_hooker('tpl', 'qix-hook-tpl', 600);

function get_globs_deps() {
  return global_hookers
    .map(prop.bind(null, 'hooker_path'));
}