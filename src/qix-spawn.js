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

function nodes_sink_event(nodes, name, detail) {
  return nodes.map(sink_event.bind(null, name, detail));
}

function sink_event(name, detail, node) {
  var event = new CustomEvent(name, {
    detail: detail
  });
  var _next_node;
  while ((_next_node = node.childNodes[0]))
    sink_event(node, detail, _next_node);
  node.dispatchEvent(event);
}

function control_content_of(holder, local_require, scope) {
  var component = {};
  var _injects = [];
  global_hookers.forEach(function (hooker_def) {
    var hook;
    while ((hook = hooker_def.hook_one(holder, local_require)) !== null) {
      component[hook.scope_name] = hook.factory(scope);
    }
  });
  component.$content = as_array(holder.children); //as_array(holder.childNodes);
  component.$message = nodes_sink_event.bind(null, component.$content);

  get_qix_controlled_elements(holder)
    .map(function (elem) {
      get_qix_attr_ctrl_defs_of(elem)
        .forEach(function (def) {
          var ctrl_factory = get_controller_factory_by_definition(local_require, def);
          var controller = component[def.name] = ctrl_factory(elem);
          component['$' + def.name] = elem;
          _injects = _injects.concat(def.injects
            .map(function (def_inject) {
              return def_inject.bind(null, controller);
            }));
        });
    });
  var _scope_keys = Object.keys(scope);
  var _scope_vals = _scope_keys
    .map(function (k) {
      return scope[k];
    });
  _scope_keys.push('$');
  _scope_vals.push(component);
  _injects.forEach(function (inj) {
    inj(_scope_keys, _scope_vals);
  });
  return component;
}