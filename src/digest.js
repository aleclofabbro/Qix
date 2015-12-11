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


function get_qix_attr_ctrl_defs_of(qix_elem) {
  return attr('qix-ctl', qix_elem)
    .split('|')
    .map(get_controller_definition_from_string);
}

var get_qix_controlled_elements = selectAll.bind(null, '[qix-ctl]');

function require_deps(seed, callback) {
  var deps =
    flatten(get_qix_controlled_elements(seed.master)
      .map(get_qix_attr_ctrl_defs_of))
    .map(prop.bind(null, 'module'));
  seed.require(deps/*.concat(get_globs_deps())*/, callback.bind(null, seed));
}


function get_injectors(elem, controller, scope_name, component) {
  return function (_scope_keys, _scope_vals) {
    as_array(elem.attributes)
      .filter(function (attr) {
        return attr.name.startsWith(scope_name + ':');
      })
      .map(function (attr) {
        var attr_name_arr = attr.name.split(':');
        var inj_fn = get_injector_function(attr.value, attr_name_arr[1], component);
        inj_fn(controller, _scope_keys, _scope_vals);
      });
  };
}

function get_injector_function(signature_and_assign_string, _ctrl_fn_prop, assigner) {
  var dbg = signature_and_assign_string[0] === '!';
  signature_and_assign_string = dbg ? signature_and_assign_string.substring(1) : signature_and_assign_string;

  var signature_and_assign_string_arr = signature_and_assign_string.split('>');
  var signature_string = signature_and_assign_string_arr[0];
  var assign_string = (signature_and_assign_string_arr[1] || '').trim();
  var body = (dbg ? 'debugger;' : '') + 'return [' + signature_string + '];';
  return function (controller, scope_keys, scope_vals) {
    var funct = _ctrl_fn_prop === '-' ? controller : controller[_ctrl_fn_prop];
    var _arg_fn = Function.apply(null, scope_keys.concat(body));
    var _inj_arguments = _arg_fn.apply(null, scope_vals);
    var _injection_returns = funct.apply(null, _inj_arguments);
    if (assign_string)
      assigner[assign_string] = _injection_returns;
  };
}