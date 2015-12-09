(function () {
    "use strict";
function flatten(a) {
  return a.reduce(function(acc, arr_el) {
    return acc.concat(arr_el);
  }, []);
}

function prop(prp, obj) {
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

function query(elem, _query) {
  return elem.querySelector(_query);
}

function queryAll(elem, _query) {
  return as_array(elem.querySelectorAll(_query));
}

function select(_query, elem) {
  return query(elem, _query);
}

function select_has_attr(attr, elem) {
  return select('[' + attr + ']', elem);
}

function selectAll(_query, elem) {
  return queryAll(elem, _query);
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
  target.remove();
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

function remove(els) {
  return as_array(els)
    .map(function(el) {
      el.remove();
      return el;
    });
}

function noop() {}
/*


function attr_of(elem, attr_name) {
  return attr(attr_name, elem);
}
function invoke(fn) {
  return fn();
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
define('qix-hook-if', function () {
  return function (placeholder, seed, main_scope) {
    var current = null;
    return function (cond, scope) {
      if (cond) {
        if (!current)
          current = seed.spawn(scope || main_scope, placeholder, 'before');
        return current;
      } else {
        if (current) {
          current.$message('unbind');
          remove(current.$content);
          current = null;
        }
      }
    };
  };
});

var global_hookers = [];

function define_glob_hooker(name, hooker_path, priority) {
  var attr_name = 'qix-' + name;
  require([hooker_path], function (hooker) {
    global_hookers.push({
      hooker_path: hooker_path,
      name: name,
      hooker: hooker,
      priority: Number(priority || 500),
      hook_one: function (elem, local_require) {
        var hook_elem = select_has_attr(attr_name, elem);
        if (!hook_elem)
          return null;
        var attr_val = remove_attribute(attr_name, hook_elem);
        var placeholder = document.createComment('qix-hooker:' + name);
        replace_node(hook_elem, placeholder);
        var holder = document.createElement('div');
        holder.appendChild(hook_elem);
        var hooker_seed = make_template_seed(holder, local_require);

        return {
          factory: hooker.bind(null, placeholder, hooker_seed),
          scope_name: attr_val
        };
      }
    });
    global_hookers.sort(function (a, b) {
      return a.priority < b.priority;
    });
  });
}

define_glob_hooker('if', 'qix-hook-if', 1000);
// define_glob_hooker('map', 'qix-hook-map', 900);
// define_glob_hooker('ctx', 'qix-hook-ctx', 800);
// define_glob_hooker('cmp', 'qix-hook-cmp', 700);
// define_glob_hooker('tpl', 'qix-hook-tpl', 600);

function get_globs_deps() {
  return global_hookers
    .map(prop.bind(null, 'hooker_path'));
}
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
define('qix-defhook', function () {
  function load(name, localrequire, onload, config) {
    var path_and_args = name.split(':');
    var path = path_and_args[0];
    var args = path_and_args[1].split('#');
    var hook_name = args[0];
    var hook_priority = args[1];
    localrequire([path], function (hook) {
      define_glob_hooker(hook_name, hook, hook_priority);
      onload(hook);
    });
  }
  return {
    load: load
  };
});
define('qix-seed', function() {
  function make_master_element_from_text(text) {
    var master_el = document.createElement('div');
    // master_el.setAttribute('qix-tpl');
    master_el.innerHTML = text;
    return master_el;
  }

  function path_relative_to(baseurl, path) {
    if (path.startsWith('.'))
      return baseurl + path;
    else
      return path;
  }

  function load(name, localrequire, onload, config) {
    var baseurl = name.substring(0, name.lastIndexOf('/') + 1);
    var path_resolver = path_relative_to.bind(null, baseurl);
    localrequire(['qix-text!' + name], function(text) {
      var master = make_master_element_from_text(text);
      var seed_require = function(deps, cb, eb) {
        if (Array.prototype.isPrototypeOf(deps)) {
          deps = deps.map(path_resolver);
          return require(deps, cb, eb);
        } else {
          var _local_path = path_resolver(deps);
          return require(_local_path);
        }
      };
      make_template_seed(master, seed_require, onload);
      // onload(component_seed);
    });
  }
  return {
    load: load
  };
});
define('qix-text', function () {
  function load(name, localrequire, onload, config) {
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
define('qix', function() {
  var qix_module = {
    load: function load(name, localrequire, done) {
      localrequire(['qix-seed!' + name], done);
    }
  };
  return qix_module;
});
function make_template_seed(master, seed_require, require_cb) {
  var seed = {
    master: master,
    require: seed_require
  };
  seed.spawn = spawn_seed.bind(null, seed);
  require_deps(seed, (require_cb || noop));
  return seed;
}

function spawn_seed(seed, scope, target, where) {
  var master_clone = clone_node(true, seed.master);
  var component = control_content_of(master_clone, seed.require, scope);
  insert_child_nodes(master_clone, target, where);
  return component;

}

function control_content_of(holder, local_require, scope) {
  var component = {
    $message: noop
  };
  global_hookers.forEach(function (hooker_def) {
    var hook;
    while ((hook = hooker_def.hook_one(holder, local_require)) !== null) {
      component[hook.scope_name] = hook.factory(scope);
    }
  });
  component.$content = as_array(holder.children); //as_array(holder.childNodes);

  get_qix_controlled_elements(holder)
    .map(function (elem) {
      get_qix_attr_ctrl_defs_of(elem)
        .forEach(function (def) {
          var ctrl = get_controller_by_definition(local_require, def);
          component[def.name] = ctrl(elem);
          component['$' + def.name] = elem;
        });
    });
  return component;
}
}());
//# sourceMappingURL=qix.js.map