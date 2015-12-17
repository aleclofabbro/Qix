(function () {
    "use strict";
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
var _indexed_hook_binders = [];

function add_hook_compiler(def) {
  return _indexed_hook_binders.push(def) - 1;
}

function crunch_hooks(seed) {
  var _all_deps = flatten(global_hookers
    .map(function(hooker_def) {
      var hook_attr_name = hooker_def.attr_name;
      return flatten(select_has_attr_all(hook_attr_name, seed.master)
        .map(function(hook_elem) {
          var hook_val = attr(hook_attr_name, hook_elem).split(':')[1];
          return hooker_def.get_deps(hook_val);
        }));
    }));


  global_hookers
    .forEach(function(hooker_def) {
      var hook_attr_name = hooker_def.attr_name;
      var hook_elem = null;
      while ((hook_elem = select_has_attr(hook_attr_name, seed.master))) {
        var _compiler_placeholder = document.createElement('i');
        replace_node(hook_elem, _compiler_placeholder);
        var hooker_elem_master = document.createElement('div');
        var hooker_elem_master_content = clone_node(true, hook_elem);
        hooker_elem_master.appendChild(hooker_elem_master_content);
        remove_attribute(hook_attr_name, hooker_elem_master_content);
        var _hooker_seed = make_template_seed(hooker_elem_master, seed.require);
        _all_deps = _all_deps.concat(_hooker_seed.deps);
        var hook_attr_arr = attr(hook_attr_name, hook_elem).split(':');
        var hook_scope_name = hook_attr_arr[0];
        var hook_val = hook_attr_arr[1];
        var injectors = get_injectors(hook_elem, hook_scope_name);
        var index = add_hook_compiler({
          hook: hooker_def.hooker.bind(null, _hooker_seed, hook_val),
          scope_name: hook_scope_name,
          hooker_def: hooker_def,
          injectors: injectors
        });

        attr_set('qix-hooked', index, _compiler_placeholder);
      }
    });

  return _all_deps;
}

var get_qix_hooked_elements = select_has_attr_all.bind(null, 'qix-hooked');

function get_qix_hook_def_compile_placeholder(elem) {
  var hook_binder_index = attr('qix-hooked', elem);
  return _indexed_hook_binders[hook_binder_index];
}
function make_template_seed(master, seed_require, require_cb) {
  var seed = {
    master: master,
    require: seed_require
  };
  seed.spawn = spawn_seed.bind(null, seed);
  compile(seed, function () {
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
    .filter(function (attr) {
      return attr.name.startsWith(scope_name.replace(/_/g, '-') + ':');
    })
    .map(function (attr) {
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
  return function (controller, scope, component) {
    var funct = _ctrl_fn_prop === '-' ? controller : controller[_ctrl_fn_prop];
    var _inj_arguments = injector_arguments_get(scope, component, controller);
    var _injection_returns = funct.apply(null, _inj_arguments);
    if (assign_string)
      component[assign_string] = _injection_returns;
  };
}
function flatten(a) {
  return a.reduce(function (acc, arr_el) {
    return acc.concat(arr_el);
  }, []);
}

function prop(prp, obj) {
  return obj ? obj[prp] : void(0);
}

function prop_of(obj, prp) {
  return obj ? obj[prp] : void(0);
}

function is_array_like(obj) { // TODO: improve ?
  return ('length' in obj) && ('number' === typeof obj.length);
}

function is_undefined(o) {
  return o === void(0);
}

function as_array(obj, strict) {
  if (!strict && is_undefined(obj))
    return [];
  return is_array_like(obj) ? Array.prototype.slice.call(obj) : [obj];
}

function clone_node(deep, node) {
  return node.cloneNode(deep);
}

function select(_query, elem) {
  return elem.querySelector(_query);
}

function select_all(_query, elem) {
  return as_array(elem.querySelectorAll(_query));
}

function select_has_attr(attr, elem) {
  return select('[' + attr + ']', elem);
}

function select_has_attr_all(attr, elem) {
  return select_all('[' + attr + ']', elem);
}

function remove_attribute(attr_name, elem) {
  var val = elem.getAttribute(attr_name);
  elem.removeAttribute(attr_name);
  return val;
}


function insert_child_nodes(elem_holder, ref_elem, where) {
  return insert_child_nodes_map(ref_elem, where, elem_holder);
}

function insert_child_nodes_map(ref_elem, where, elem_holder) {
  return as_array(elem_holder.childNodes)
    .map(insert_child_map.bind(null, ref_elem, where));
}

function replace_node(target, by) {
  insert_child(by, target, 'before');
  remove_elements(target);
  return by;
}

function insert_child_map(ref_elem, where, child_node) {
  where = where || 'append';
  //after / before / append / prepend ?
  if (where === 'append' || (where === 'after' && !ref_elem.nextSibling)) { //case 'after' but no nextSibling === case 'append'
    ref_elem.appendChild(child_node);
  } else {
    // case 'before'  ref_elem stands
    var into_elem = ref_elem.parentNode;
    if (where === 'prepend')
      ref_elem = into_elem.firstChild;
    else if (where === 'after')
      ref_elem = ref_elem.nextSibling;
    into_elem.insertBefore(child_node, ref_elem);
  }
  return child_node;
}

function insert_child(child_node, ref_elem, where) {
  return insert_child_map(ref_elem, where, child_node);
}

function attr(attr_name, elem) {
  return elem.getAttribute(attr_name);
}

function attr_set(attr_name, val, elem) {
  return elem.setAttribute(attr_name, val);
}

function remove_elements(els) {
  return as_array(els)
    .map(function (el) {
      el.remove();
      return el;
    });
}

function noop() {}
/*


function attr_of(elem, attr_name) {
  return attr(attr_name, elem);
}

function is_element(elem) {
  return elem.nodeType === Node.ELEMENT_NODE;
}
function has_attr(elem, attr_name) {
  return elem.hasAttribute(attr_name);
}


function compose(fn1, fn2) {
  return function() {
    return fn1(fn2.apply(null, arguments));
  };
}

function as_bool(v) {
  return !!v;
}

function neg_bool(v) {
  return !v;
}



function get_attribute(name, elem) {
  return elem.getAttribute(name);
}

function id(v) {
  return v;
}

function safe_string(str) {
  return (str === null || str === void(0)) ? '' : String(str);
}

function prop_setter(prop, obj, val) {
  return (obj[prop] = val);
}


function safe_string_prop_setter(prop, obj, str) {
  return (obj[prop] = safe_string(str));
}


*/
var global_hookers = [];

function define_glob_hooker(name, hooker, priority) {
  var attr_name = 'qix-' + name;
  var _priority = arguments.length === 3 ? priority : 500;
  global_hookers.push({
    name: name,
    hooker: hooker,
    priority: _priority,
    attr_name: attr_name,
    get_deps: hooker.get_deps || function() {
      return [];
    }
  });
  global_hookers.sort(function(a, b) {
    return a.priority < b.priority;
  });
}
function qix_hook_if(seed, value, placeholder, main_scope) {
  var _current_component = null;
  var _current_component_scope = null;
  var _destroyed = false;


  placeholder.addEventListener('destroy', _destroy);

  function _destroy() {
    _destroyed = true;
    placeholder.removeEventListener('destroy', _destroy);
    _current_component.$destroy();
    _current_component = null;
    _current_component_scope = null;
  }

  function _if(scope) {
    if (_destroyed)
      return;
    if (!!scope && !_current_component) {
      _current_component_scope = typeof scope === 'object' ? scope : main_scope;
      _current_component = seed.spawn(_current_component_scope, placeholder, 'before');
    } else if (!scope && _current_component) {
      _current_component.$destroy();
      _current_component = null;
      _current_component_scope = null;
    }
    _if.scope = _current_component_scope;
    _if.cmp = _current_component;
    return _current_component;
  }
  if (value === 'true')
    _if(main_scope);
  return _if;
}

define_glob_hooker('if', qix_hook_if, 1000);
function qix_hook_map(seed, value, placeholder, main_scope) {
  var _current_components = [];
  var _destroyed = false;

  placeholder.addEventListener('destroy', _destroy);

  function _destroy() {
    _destroy_components();
    _destroyed = true;
    _current_components
      .map(prop.bind(null, '$content'))
      .forEach(remove_elements);
    _current_components = [];
    placeholder.removeEventListener('destroy', _destroy);
  }

  function _destroy_components() {
    _current_components.forEach(function (_component) {
      _component.$destroy();
    });
  }

  function _map(scopes) {
    _destroy_components();
    if ('number' === typeof scopes)
      scopes = Array.apply(null, new Array(scopes));
    _current_components = scopes.map(function (scope, index) {
      var _use_scope = typeof scope === 'object' ? scope : main_scope;
      var _sub_scope = Object.create(_use_scope);
      _sub_scope.$index = index;
      return seed.spawn(_sub_scope, placeholder, 'before');
    });
    _map.cmps = _current_components;
    return _current_components;
  }
  return _map;
}
define_glob_hooker('map', qix_hook_map, 900);
function qix_hook_tpl(seed, value, placeholder, main_scope) {
  var tpl_seed = seed.require('qix-seed!' + value);
  var _destroyed = false;
  as_array(tpl_seed.master.childNodes)
    .forEach(function (node) {
      seed.master.children[0].appendChild(node);
    });
  return function _tpl(scope) {
    if (_destroyed)
      return;
    scope = scope || main_scope;
    var _component = seed.spawn(main_scope, placeholder, 'before');

    placeholder.addEventListener('destroy', _destroy);

    function _destroy() {
      _destroyed = true;
      placeholder.removeEventListener('destroy', _destroy);
      _component.$destroy();
      _component = null;
    }
    _tpl.cmp = _component;
    return _component;
  };
}
qix_hook_tpl.get_deps = function (val) {
  return 'qix-seed!' + val;
};
define_glob_hooker('tpl', qix_hook_tpl, 600);

// function qix_hook_tpl(seed, value, placeholder, main_scope) {
//   var tpl_seed = seed.require('qix-seed!' + value);
//   var _destroyed = false;
//   return function _tpl(scope) {
//     if (_destroyed)
//       return;
//     scope = scope || main_scope;
//     var _parent_cmp = seed.spawn(main_scope, placeholder, 'before');
//     var _container = _parent_cmp.$content[0];
//     var _component = tpl_seed.spawn(scope, _container);
//     placeholder.addEventListener('destroy', _destroy);

//     function _destroy() {
//       _destroyed = true;
//       placeholder.removeEventListener('destroy', _destroy);
//       _component.$destroy();
//       _parent_cmp.$destroy();
//       _parent_cmp = null;
//       _component = null;
//     }
//     _tpl.cmp = _component;
//     return _component;
//   };
// }
// define_glob_hooker('ctx', 'qix-hook-ctx', 800);
// define_glob_hooker('cmp', 'qix-hook-cmp', 700);
define('qix', function() {
  var qix_module = {
    load: function load(name, localrequire, done) {
      localrequire(['qix-seed!' + name], done);
    }
  };
  return qix_module;
});
// qix-defhook!path/to/hook:name#1000
define('qix-defhook', function() {
  function load(name, localrequire, onload /*, config*/ ) {
    var path_and_args = name.split(':');
    var path = path_and_args[0];
    var args = path_and_args[1].split('#');
    var hook_name = args[0];
    var hook_priority = Number(args[1]);
    localrequire([path], function(hook) {
      define_glob_hooker(hook_name, hook, hook_priority);
      onload(hook);
    });
  }
  return {
    load: load
  };
});
define('qix-seed', function () {
  function make_master_element_from_text(text) {
    var master_el = document.createElement('div');
    // master_el.setAttribute('qix-tpl');
    master_el.innerHTML = text;
    return master_el;
  }

  // function path_relative_to(baseurl, path) {
  //   if (path.startsWith('.') && !path.startsWith('/'))
  //     return baseurl + path;
  //   else
  //     return path;
  // }
  var req_ctx = 0;
  var glob_conf_skip = ['deps'];

  function load(name, localrequire, onload /*, config*/ ) {
    // var path_resolver = path_relative_to.bind(null, baseurl);
    var resolved_name = localrequire.toUrl(name);
    var baseurl = resolved_name.substring(0, resolved_name.lastIndexOf('/') + 1);
    localrequire(['qix-text!' + name], function (text) {
      var master = make_master_element_from_text(text);
      // var seed_require = function (deps, cb, eb) {
      //   if (Array.prototype.isPrototypeOf(deps)) {
      //     deps = deps.map(path_resolver);
      //     return require(deps, cb, eb);
      //   } else {
      //     var _local_path = path_resolver(deps);
      //     return require(_local_path);
      //   }
      // };
      var glob_conf = require.s.contexts._.config;
      var req_config = Object.keys(glob_conf)
        .reduce(function (cnf, k) {
          if (glob_conf_skip.indexOf(k) === -1)
            cnf[k] = glob_conf[k];
          return cnf;
        }, {});
      req_config.baseUrl = baseurl;
      req_config.context = req_ctx++;
      var seed_require = require.config(req_config);
      make_template_seed(master, seed_require, onload);
      // onload(component_seed);
    });
  }
  return {
    load: load
  };
});
define('qix-text', function () {
  function load(name, localrequire, onload /*, config*/ ) {
    var url = localrequire.toUrl(name);
    get_remote_text(url, onload);
  }
  return {
    load: load
  };
});
var get_remote_text = (function () {
  function get_remote_text(url, callback) {
    var xhr = createXMLHTTPObject();
    if (!xhr)
      throw new Error('NO XHR!');
    xhr.responseType = 'text';
    xhr.open('GET', url, true);
    // xhr.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4)
        return;
      if (xhr.status != 200 && xhr.status != 304) {
        throw new Error('get_remote_text HTTP error for [' + url + '] : ' + xhr.status);
      }
      callback(xhr.responseText);
    };
    if (xhr.readyState == 4)
      return;
    xhr.send();
  }

  var XMLHttpFactories = [
    function () {
      return new XMLHttpRequest();
    },
    function () {
      return new ActiveXObject('Msxml2.XMLHTTP');
    },
    function () {
      return new ActiveXObject('Msxml3.XMLHTTP');
    },
    function () {
      return new ActiveXObject('Microsoft.XMLHTTP');
    }
  ];

  function createXMLHTTPObject() {
    var xmlhttp = false;
    for (var i = 0; i < XMLHttpFactories.length; i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      } catch (e) {
        continue;
      }
      break;
    }
    return xmlhttp;
  }
  return get_remote_text;
})();
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

function warn_duplicate_component_prop_name(scope_name, component) {
  if (scope_name in component)
    console.warn('component prop already taken will be overridden:', scope_name, component[scope_name], component);
}

function control_content_of(holder, scope) {
  var _injectors = [];
  var component = {
    $controlled_nodes: []
  };
  component.$message = component_sink_event.bind(null, component);
  component.$destroy = destroy_component.bind(null, component);
  component.$content = as_array(holder.childNodes);


  get_qix_controlled_elements(holder)
    .forEach(function (elem) {
      elem_indexed_ctrl_binders(elem)
        .forEach(function (binder_def) {
          warn_duplicate_component_prop_name(binder_def.scope_name, component);
          var controller = component[binder_def.scope_name] = binder_def.control(elem);
          component['$' + binder_def.scope_name] = elem;
          _injectors = _injectors.concat(binder_def.injectors
            .map(function (injector) {
              return injector.bind(null, controller);
            }));
          component.$controlled_nodes.unshift(elem);
        });
    });

  get_qix_hooked_elements(holder)
    .forEach(function (_compiler_placeholder) {
      var hooker_def = get_qix_hook_def_compile_placeholder(_compiler_placeholder);
      component.$content.splice(component.$content.indexOf(_compiler_placeholder), 1);
      var placeholder = document.createComment('qix-hooker ' + hooker_def.scope_name + ':' + hooker_def.hooker_def.name);
      replace_node(_compiler_placeholder, placeholder);
      warn_duplicate_component_prop_name(hooker_def.scope_name, component);
      var hooker_ctl =
        component[hooker_def.scope_name] = hooker_def.hook(placeholder, scope);
      _injectors = _injectors
        .concat(hooker_def.injectors
          .map(function (injector) {
            return injector.bind(null, hooker_ctl);
          }));
      component.$controlled_nodes.unshift(placeholder);
    });



  return {
    inject: function () {
      _injectors.forEach(function (inj) {
        inj(scope, component);
      });
    },
    component: component
  };
}
}());
//# sourceMappingURL=qix.js.map