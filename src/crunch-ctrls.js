var _indexed_ctrl_binders = [];

function add_ctrl_compiler(def) {
  return _indexed_ctrl_binders.push(def) - 1;
}

function crunch_controllers(seed) {
  return flatten(get_qix_controlled_elements(seed.master)
    .map(get_qix_attr_ctrl_defs_of.bind(null, seed)));
}


function controller_binder(seed, module, module_prop) {
  var _controller_factory;
  return function(elem) {
    if (!_controller_factory) {
      _controller_factory = seed.require(module);
      _controller_factory = module_prop ? _controller_factory[module_prop] : _controller_factory;
    }
    return _controller_factory(elem);
  };
}


function add_compiler_ctrl_definition_by_string(seed, elem, str) {
  var toks = str.trim().split(':');
  var scope_name = toks[0];
  var toks_module = toks[1].split('#');
  var module = toks_module[0];
  var module_prop = toks_module[1];
  var injectors = get_injectors(elem, scope_name);
  var ctrl_def = {
    module: module,
    module_prop: module_prop,
    scope_name: scope_name,
    injectors: injectors,
    control: controller_binder(seed, module, module_prop)
  };
  make_ctrl_binder_and_mark(elem, ctrl_def);
  return ctrl_def;
}

function make_ctrl_binder_and_mark(elem, ctrl_def) {
  var compiler_index = add_ctrl_compiler(ctrl_def);
  elem_ctrl_binders_indexes_add(elem, compiler_index);
}

function elem_ctrl_binders_indexes(elem) {
  var attr_val = attr('qix-ctrls-binders', elem);
  if (!attr_val)
    return [];
  else return attr_val.split('|');
}

function elem_indexed_ctrl_binders(elem) {
  return elem_ctrl_binders_indexes(elem)
    .map(prop_of.bind(null, _indexed_ctrl_binders));
}

function elem_ctrl_binders_indexes_add(elem, to_add) {
  var arr = elem_ctrl_binders_indexes(elem).concat(to_add);
  attr_set('qix-ctrls-binders', arr.join('|'), elem);
}

function get_qix_attr_ctrl_defs_of(seed, qix_elem) {
  return attr('qix-ctl', qix_elem)
    .split('|')
    .map(add_compiler_ctrl_definition_by_string.bind(null, seed, qix_elem));
}

var get_qix_controlled_elements = select_all.bind(null, '[qix-ctl]');