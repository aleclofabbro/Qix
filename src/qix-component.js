function make_master_template_element_from_text(text) {
  var templ_el = document.createElement('div');
  templ_el.innerHTML = text;
  return templ_el;
}

function is_qix_attr(attr) {
  return 'qix' === attr.name.split(':')[0];
}

function make_node_qix(branch, node, seed_require) {
  var spawn = spawn_branch_content.bind(null, branch);
  spawn.master_node = node;
  spawn.require = seed_require;
  return spawn;
}

function set_factory(comp_require, ctrl_def) {
  var module_name = ctrl_def.module_name;
  var module_prop = ctrl_def.module_prop;
  var _module = comp_require(module_name);
  ctrl_def.factory = module_prop ? _module[module_prop] : _module;
  return ctrl_def;
}

function make_component_tree(seed_require, node) {
  var branch = as_array(node.childNodes).map(make_component_tree.bind(null, seed_require));
  branch.$qix = make_node_qix(branch, node, seed_require);
  branch.$qix.node_ctrl_def = qix_node_compilers[node.nodeType](node);
  set_factory(seed_require, branch.$qix.node_ctrl_def);
  if (node.nodeType === Node.ELEMENT_NODE) {
    branch.$qix.attr_ctrl_defs = as_array(node.attributes)
      .filter(is_qix_attr)
      .map(qix_node_compilers[Node.ATTRIBUTE_NODE])
      .map(set_factory.bind(null, seed_require));
  }
  return branch;
}

function collect_deps(branch) {
  return as_array(branch.$qix.attr_ctrl_defs)
    .concat(branch.$qix.node_ctrl_def)
    .map(function (ctrl) {
      return ctrl.module_name;
    })
    .concat(branch.map(collect_deps).reduce(function (accum, sub_deps) {
      return accum.concat(sub_deps);
    }, []));
}

function make_qix_component(callback, seed) {
  var master_template_element = make_master_template_element_from_text(seed.text);
  var component_tree = make_component_tree(seed.require, master_template_element, seed);
  var deps = collect_deps(component_tree);
  seed.require(deps, function () {
    callback(component_tree);
  });
}