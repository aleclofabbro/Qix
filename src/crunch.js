function make_template_seed(master, seed_require, require_cb) {
  var seed = {
    master: master,
    require: seed_require
  };
  seed.spawn = spawn_seed.bind(null, seed);
  compile(seed, function() {
    (require_cb || noop)(seed);
  });
  return seed;
}

function compile(seed, cb) {
  var hooks_deps = crunch_hooks(seed);
  var ctrls_defs = crunch_controllers(seed);
  var ctrl_deps = ctrls_defs.map(prop.bind(null, 'module'));
  seed.deps = ctrl_deps.concat(hooks_deps);
  seed.require(seed.deps, cb);
}


function get_injectors(elem, scope_name) {
  return as_array(elem.attributes)
    .filter(function(attr) {
      return attr.name.startsWith(scope_name + ':');
    })
    .map(function(attr) {
      var attr_name_arr = attr.name.split(':');
      var inj_fn = get_injector_function(attr.value, attr_name_arr[1]);
      return inj_fn;
    });
}

function get_injector_function(signature_and_assign_string, _ctrl_fn_prop) {
  var dbg = signature_and_assign_string[0] === '!';
  signature_and_assign_string = dbg ? signature_and_assign_string.substring(1) : signature_and_assign_string;

  var signature_and_assign_string_arr = signature_and_assign_string.split('>');
  var signature_string = signature_and_assign_string_arr[0];
  var assign_string = (signature_and_assign_string_arr[1] || '').trim();
  var body = (dbg ? 'debugger;' : '') + 'return [' + signature_string + '];';
  var injector_arguments_get = Function.apply(null, ['$', '_'].concat(body));
  return function(controller, scope, component) {
    var funct = _ctrl_fn_prop === '-' ? controller : controller[_ctrl_fn_prop];
    var _inj_arguments = injector_arguments_get(scope, component, controller);
    var _injection_returns = funct.apply(null, _inj_arguments);
    if (assign_string)
      component[assign_string] = _injection_returns;
  };
}