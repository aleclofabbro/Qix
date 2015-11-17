function get_controller_by_component_definition(local_require, def) {
  var _module = local_require(def.module);
  return def.module_prop ? _module[def.module_prop] : _module;
}

function get_component_definition_from_string(str) {
  var toks = str.split(':');
  var ctrl_name = toks[0];
  var toks_module = toks[1].split('#');
  var module = toks_module[0];
  var module_prop = toks_module[1];
  return {
    module: module,
    module_prop: module_prop,
    name: ctrl_name
  };
}

function get_qix_elem_ctrl_def(qix_elem) {
  return get_component_definition_from_string(qix_elem.getAttribute('comp'));
}

function get_qix_elem_attr_ctrl_defs(qix_elem) {
  return qix_elem.getAttribute('qix')
    .split('|')
    .map(get_component_definition_from_string);
}

function get_one_qix_component_element(ancestor) {
  return ancestor.querySelector('qix');
}

function get_all_qix_component_elements(ancestor) {
  return as_array(ancestor.querySelectorAll('qix'));
}

function get_qix_controlled_elements(ancestor) {
  return as_array(ancestor.querySelectorAll('[qix]'));
}

function require_deps(comp, callback) {
  var deps = get_all_qix_component_elements(comp.master)
    .map(get_qix_elem_ctrl_def)
    .concat(flatten(get_qix_controlled_elements(comp.master)
      .map(get_qix_elem_attr_ctrl_defs)))
    .map(prop.bind(null, 'module'));
  comp.require(deps, callback.bind(null, comp));
}

function seed_to_component(seed) {
  var comp = Object.create(seed);
  comp.spawn = spawn_component.bind(null, comp);
  return comp;
}

function make_qix_component(callback, seed) {
  var comp = seed_to_component(seed);
  require_deps(comp, callback);
}