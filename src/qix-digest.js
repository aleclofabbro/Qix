function get_controller_factory_by_definition(local_require, def) {
  var _module = local_require(def.module);
  return def.module_prop ? _module[def.module_prop] : _module;
}

function get_controller_definition_from_string(str) {
  var toks = str.trim().split(':');
  var ctrl_scope_name = toks[0];
  var toks_module = toks[1].split('#');
  var module = toks_module[0];
  var module_prop = toks_module[1];
  return {
    module: module,
    module_prop: module_prop,
    name: ctrl_scope_name
  };
}

function attach_injects_to_ctrl_def(elem, def) {
  def.injects = as_array(elem.attributes)
    .filter(function (attr) {
      return attr.name.startsWith(def.name + ':');
    })
    .map(function (attr) {
      return get_injector(attr.value, attr.name.split(':')[1]);
    });
  return def;
}

function get_injector(arguments_string, _ctrl_fn_prop) {
  var dbg = arguments_string[0] === '!';
  arguments_string = dbg ? arguments_string.substring(1) : arguments_string;
  var body = (dbg ? 'debugger;' : '') + 'return [' + arguments_string + '];';
  return function (controller, scope_keys, scope_vals) {
    var funct = _ctrl_fn_prop === '-' ? controller : controller[_ctrl_fn_prop];
    var _arg_fn = Function.apply(null, scope_keys.concat(body));
    var _inj_arguments = _arg_fn.apply(null, scope_vals);
    funct.apply(null, _inj_arguments);
  };
}

function get_qix_attr_ctrl_defs_of(qix_elem) {
  return attr('qix-ctl', qix_elem)
    .split('|')
    .map(get_controller_definition_from_string)
    .map(attach_injects_to_ctrl_def.bind(null, qix_elem));
}

var get_qix_controlled_elements = selectAll.bind(null, '[qix-ctl]');

function require_deps(seed, callback) {
  var deps =
    flatten(get_qix_controlled_elements(seed.master)
      .map(get_qix_attr_ctrl_defs_of))
    .map(prop.bind(null, 'module'));
  seed.require(deps.concat(get_globs_deps()), callback.bind(null, seed));
}