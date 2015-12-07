define('qix-strip-if', function() {
  return function(placeholder, seed, main_scope) {
    var current = null;
    return function(cond, scope) {
      if (cond) {
        if (!current)
          current = seed.spawn(scope || main_scope, placeholder, 'before');
        return current;
      } else {
        if (current) {
          current.$.message('unbind');
          remove(current.$.content);
          current = null;
        }
      }
    };
  };
});

var global_stripper = [];

function define_glob_stripper(name, stripper_path, priority) {
  var attr_name = 'qix-' + name;
  require([stripper_path], function(stripper) {
    global_stripper.push({
      name: name,
      stripper: stripper,
      priority: Number(priority || 500),
      strip_one: function(elem, local_require) {
        var strip_elem = select_has_attr(attr_name, elem);
        if (!strip_elem)
          return null;
        var attr_val = remove_attribute(attr_name, strip_elem);
        var placeholder = document.createComment('qix-stripper:' + name);
        replace_node(strip_elem, placeholder);
        var holder = document.createElement('div');
        holder.appendChild(strip_elem);
        var stripper_seed = make_template_seed(holder, local_require);

        return {
          factory: stripper.bind(null, placeholder, stripper_seed),
          scope_name: attr_val
        };
      }
    });
    global_stripper.sort(function(a, b) {
      return a.priority < b.priority;
    });
  });
}

define_glob_stripper('if', 'qix-strip-if', 1000);
// define_glob_stripper('map', 'qix-strip-map', 900);
// define_glob_stripper('ctx', 'qix-strip-ctx', 800);
// define_glob_stripper('cmp', 'qix-strip-cmp', 700);
// define_glob_stripper('tpl', 'qix-strip-tpl', 600);