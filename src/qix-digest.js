function get_controller_by_definition(local_require, def) {
  var _module = local_require(def.module);
  return def.module_prop ? _module[def.module_prop] : _module;
}

function get_component_definition_from_string(str) {
  var toks = str.trim().split(':');
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

function get_qix_attr_ctrl_defs_of(qix_elem) {
  return attr('qix-ctl', qix_elem)
    .split('|')
    .map(get_component_definition_from_string);
}

var get_qix_controlled_elements = selectAll.bind(null, '[qix-ctl]');

function require_deps(seed, callback) {
  var deps =
    flatten(get_qix_controlled_elements(seed.master)
      .map(get_qix_attr_ctrl_defs_of))
    .map(prop.bind(null, 'module'));
  seed.require(deps.concat(get_globs_deps()), callback.bind(null, seed));
}