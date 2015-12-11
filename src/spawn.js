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
  var control_result = control_content_of(master_clone, seed.require, scope);
  insert_child_nodes(master_clone, target, where);
  control_result.inject();
  control_result.inject = noop;
  return control_result.component;
}

function component_sink_event(component, name, detail) {
  component.$controlled_nodes
    .forEach(function sink_event(node) {
      var event = new CustomEvent(name, {
        detail: detail,
        bubbles: false
      });
      node.dispatchEvent(event);
    });
}


function destroy_component(component) {
  __log('DESTROY COMPONENT', component);
  component.$message('destroy');
  remove_elements(component.$content);
  component.$content = [];
  component.$controlled_nodes = [];
}

function control_content_of(holder, local_require, scope) {
  var component = {
    $controlled_nodes: []
  };
  var _injects = [];
  global_hookers.forEach(function(hooker_def) {
    var hook;
    while ((hook = hooker_def.hook_one(holder, local_require)) !== null) {
      var controller = component[hook.scope_name] = hook.factory(scope);
      _injects = _injects.concat(get_injectors(hook.elem, controller, hook.scope_name, component));
      component.$controlled_nodes.unshift(hook.placeholder);
    }
  });
  component.$message = component_sink_event.bind(null, component);
  component.$destroy = destroy_component.bind(null, component);
  component.$content = as_array(holder.childNodes);

  get_qix_controlled_elements(holder)
    .map(function(elem) {
      get_qix_attr_ctrl_defs_of(elem)
        .forEach(function(def) {
          var ctrl_factory = get_controller_factory_by_definition(local_require, def);
          var controller = component[def.name] = ctrl_factory(elem);
          component['$' + def.name] = elem;
          _injects = _injects.concat(get_injectors(elem, controller, def.name, component));
          component.$controlled_nodes.unshift(elem);
        });
    });
  // var _scope_keys = Object.keys(scope);
  // var _scope_vals = _scope_keys
  //   .map(function(k) {
  //     return scope[k];
  //   });
  var _scope_keys = [];
  var _scope_vals = [];
  for (var _k in scope) {
    _scope_keys.push(_k);
    _scope_vals.push(scope[_k]);
  }
  _scope_keys.push('$');
  _scope_vals.push(component);
  return {
    component: component,
    inject: function() {
      _injects.forEach(function(inj) {
        inj(_scope_keys, _scope_vals);
      });
    }
  };
}