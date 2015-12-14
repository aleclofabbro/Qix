var _indexed_hook_binders = [];

function add_hook_compiler(def) {
  return _indexed_hook_binders.push(def) - 1;
}

function crunch_hooks(seed) {
  var _all_deps = flatten(global_hookers
    .map(function(hooker_def) {
      var hook_attr_name = hooker_def.attr_name;
      return flatten(select_has_attr_all(hook_attr_name, seed.master)
        .map(function(hook_elem) {
          var hook_val = attr(hook_attr_name, hook_elem).split(':')[1];
          return hooker_def.get_deps(hook_val);
        }));
    }));


  global_hookers
    .forEach(function(hooker_def) {
      var hook_attr_name = hooker_def.attr_name;
      var hook_elem = null;
      while ((hook_elem = select_has_attr(hook_attr_name, seed.master))) {
        var _compiler_placeholder = document.createElement('i');
        replace_node(hook_elem, _compiler_placeholder);
        var hooker_elem_master = document.createElement('div');
        var hooker_elem_master_content = clone_node(true, hook_elem);
        hooker_elem_master.appendChild(hooker_elem_master_content);
        remove_attribute(hook_attr_name, hooker_elem_master_content);
        var _hooker_seed = make_template_seed(hooker_elem_master, seed.require);
        _all_deps = _all_deps.concat(_hooker_seed.deps);
        var hook_attr_arr = attr(hook_attr_name, hook_elem).split(':');
        var hook_scope_name = hook_attr_arr[0];
        var hook_val = hook_attr_arr[1];
        var injectors = get_injectors(hook_elem, hook_scope_name);
        var index = add_hook_compiler({
          hook: hooker_def.hooker.bind(null, _hooker_seed, hook_val),
          scope_name: hook_scope_name,
          hooker_def: hooker_def,
          injectors: injectors
        });

        attr_set('qix-hooked', index, _compiler_placeholder);
      }
    });

  return _all_deps;
}

var get_qix_hooked_elements = select_has_attr_all.bind(null, 'qix-hooked');

function get_qix_hook_def_compile_placeholder(elem) {
  var hook_binder_index = attr('qix-hooked', elem);
  return _indexed_hook_binders[hook_binder_index];
}