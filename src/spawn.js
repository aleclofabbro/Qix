function spawn_seed(seed, scope, target, where) {
  var master_clone = clone_node(true, seed.master);
  var control_result = control_content_of(master_clone, scope);
  insert_child_nodes(master_clone, target, where);
  control_result.inject();
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
  component.$message('destroy');
  remove_elements(component.$content.concat(component.$controlled_nodes));
  component.$content = [];
  component.$controlled_nodes = [];
}

function control_content_of(holder, scope) {
  var _injectors = [];
  var component = {
    $controlled_nodes: []
  };
  component.$message = component_sink_event.bind(null, component);
  component.$destroy = destroy_component.bind(null, component);
  component.$content = as_array(holder.childNodes);

  get_qix_hooked_elements(holder)
    .forEach(function(_compiler_placeholder) {
      var hooker_def = get_qix_hook_def_compile_placeholder(_compiler_placeholder);
      var placeholder = document.createComment('qix-hooker ' + hooker_def.scope_name + ':' + hooker_def.hooker_def.name);
      replace_node(_compiler_placeholder, placeholder);
      var hooker_ctl = component[hooker_def.scope_name] = hooker_def.hook(placeholder, scope);
      _injectors = _injectors.concat(
        hooker_def.injectors
        .map(function(injector) {
          return injector.bind(null, hooker_ctl);
        }));
      component.$controlled_nodes.unshift(placeholder);
    });


  get_qix_controlled_elements(holder)
    .forEach(function(elem) {
      elem_indexed_ctrl_binders(elem)
        .forEach(function(binder_def) {
          var controller = component[binder_def.scope_name] = binder_def.control(elem);
          component['$' + binder_def.scope_name] = elem;
          _injectors = _injectors.concat(
            binder_def.injectors
            .map(function(injector) {
              return injector.bind(null, controller);
            }));
          component.$controlled_nodes.unshift(elem);
        });
    });


  return {
    inject: function() {
      _injectors.forEach(function(inj) {
        inj(scope, component);
      });
    },
    component: component
  };
}


// function hook_one(elem, local_require) {
//   var hook_elem = select_has_attr(attr_name, elem);
//   if (!hook_elem)
//     return null;
//   var attr_val = remove_attribute(attr_name, hook_elem);
//   var placeholder = document.createComment('qix-hooker:' + name);
//   replace_node(hook_elem, placeholder);
//   var holder = document.createElement('div');
//   holder.appendChild(hook_elem);
//   var hooker_seed = make_template_seed(holder, local_require);

//   return {
//     factory: hooker.bind(null, placeholder, hooker_seed),
//     scope_name: attr_val,
//     elem: hook_elem,
//     placeholder: placeholder
//   };
// }