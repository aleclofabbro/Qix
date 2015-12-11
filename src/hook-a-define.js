var global_hookers = [];

function define_glob_hooker(name, hooker, priority) {
  var attr_name = 'qix-' + name;
  var _priority = arguments.length === 3 ? priority : 500;
  global_hookers.push({
    name: name,
    hooker: hooker,
    priority: _priority,
    hook_one: function(elem, local_require) {
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
        scope_name: attr_val,
        elem: hook_elem,
        placeholder: placeholder
      };
    }
  });
  global_hookers.sort(function(a, b) {
    return a.priority < b.priority;
  });
}