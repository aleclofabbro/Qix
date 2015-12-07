function make_template_seed(master, seed_require, require_cb) {
  var seed = {
    master: master,
    require: seed_require
  };
  seed.spawn = spawn_seed.bind(null, seed);
  require_deps(seed, require_cb);
  return seed;
}

function spawn_seed(seed, scope, target, where) {
  var master_clone = clone_node(true, seed.master);
  var component = control_content_of(master_clone, seed.require, scope);
  var content_elems = as_array(master_clone.childNodes);
  insert_child_nodes(master_clone, target, where);
  component.$ = {
    content: content_elems,
    message: noop
  };
  return component;

}

function control_content_of(holder, local_require, scope) {
  var component = {};
  global_stripper.forEach(function(stripper_def) {
    var stripper;
    while ((stripper = stripper_def.strip_one(holder, local_require)) !== null) {
      component[stripper.scope_name] = stripper.factory(scope);
    }
  });

  get_qix_controlled_elements(holder)
    .map(function(elem) {
      get_qix_attr_ctrl_defs_of(elem)
        .forEach(function(def) {
          var ctrl = get_controller_by_definition(local_require, def);
          component[def.name] = ctrl(elem);
        });
    });
  return component;
}