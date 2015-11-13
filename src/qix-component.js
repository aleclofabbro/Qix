function make_master_template_element_from_text(text) {
  var templ_el = document.createElement('div');
  templ_el.innerHTML = text;
  return templ_el;
}

function is_qix_attr(attr) {
  return 'qix' === attr.name.split(':')[0];
}

function make_node_qix(branch, node, seed_require) {
  return {
    spawn: spawn_branch.bind(null, branch),
    node: node,
    require: seed_require
  };
}

function make_component_tree(seed_require, node) {
  var branch = as_array(node.childNodes).map(make_component_tree.bind(null, seed_require));
  branch.$qix = make_node_qix(branch, node, seed_require);
  branch.spawn = branch.$qix.spawn;
  branch.$qix.attr_ctrl_defs = as_array(node.attributes)
    .filter(is_qix_attr)
    .map(qix_node_compilers[Node.ATTRIBUTE_NODE]);
  branch.$qix.node_ctrl_def = qix_node_compilers[node.nodeType](node);
  return branch;
}

function collect_deps(branch) {
  return branch.$qix.attr_ctrl_defs.concat(branch.$qix.node_ctrl_def)
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