function make_template_seed(master, seed_require, require_cb) {
  var seed = {
    master: master,
    require: seed_require
  };
  seed.spawn = spawn_seed.bind(null, seed);
  require_deps(seed, (require_cb || noop));
  return seed;
}

function spawn_seed(seed, scope, target, where) {
  var master_clone = clone_node(true, seed.master);
  var component = control_content_of(master_clone, seed.require, scope);
  insert_child_nodes(master_clone, target, where);
  return component;

}

function control_content_of(holder, local_require, scope) {
  var component = {
    $message: noop
  };
  global_hookers.forEach(function (hooker_def) {
    var hook;
    while ((hook = hooker_def.hook_one(holder, local_require)) !== null) {
      component[hook.scope_name] = hook.factory(scope);
    }
  });
  component.$content = as_array(holder.children); //as_array(holder.childNodes);

  get_qix_controlled_elements(holder)
    .map(function (elem) {
      get_qix_attr_ctrl_defs_of(elem)
        .forEach(function (def) {
          var ctrl = get_controller_by_definition(local_require, def);
          component[def.name] = ctrl(elem);
          component['$' + def.name] = elem;
        });
    });
  return component;
}