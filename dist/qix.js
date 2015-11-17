(function () {
    "use strict";
function invoke(fn) {
  return fn();
}

function flatten(a) {
  return a.reduce(function (acc, arr_el) {
    return acc.concat(arr_el);
  }, []);
}

function as_bool(v) {
  return !!v;
}

function neg_bool(v) {
  return !v;
}

function noop() {}

// function compose(fn1, fn2) {
//   return function (x) {
//     return fn1(fn2(x));
//   }
// }

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

function prop(prp, obj) {
  return obj ? obj[prp] : void(0);
}

function safe_string_prop_setter(prop, obj, str) {
  return (obj[prop] = safe_string(str));
}

function is_array_like(obj) { // improve ?
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
define('text', function () {
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
  var STATIC_COMPILER = 'qix-static-node-ctrl';
  var qix_node_compilers = (function () {
    function hyphens2underscore(name) {
      return name && name.replace(/-/g, '_');
    }

    function underscore2hyphens(name) {
      return name && name.replace(/_/g, '-');
    }
    var compilers = {};
    compilers[Node.ATTRIBUTE_NODE] = function (attr) {
      // return get_compiler_definition(STATIC_COMPILER);
      var toks = attr.name.split(':');
      var ctx_name = toks[1];
      var factory = attr.value.split('#');
      var module_name = factory[0];
      var module_prop = factory[1];
      return get_compiler_definition(module_name, module_prop, ctx_name);
    };

    function get_compiler_definition(module_name, module_prop, ctx_name) {
      return {
        name: hyphens2underscore(ctx_name),
        module_name: module_name,
        module_prop: module_prop
      };
    }

    function static_compiler(node) {
      return get_compiler_definition(STATIC_COMPILER);
    }
    compilers[Node.ELEMENT_NODE] = static_compiler;
    compilers[Node.COMMENT_NODE] = static_compiler;
    compilers[Node.TEXT_NODE] = static_compiler;
    return compilers;
  }());
  define(STATIC_COMPILER, function () {
    return function (node, ctrl_inits, link) {
      return node.cloneNode();
    };
  });
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
define('qix-elem', function (require, exports, module) {
  var html_setter = safe_string_prop_setter.bind(null, 'innerHTML');
  var text_setter = safe_string_prop_setter.bind(null, 'innerText');
  //fns
  exports.html_setter = html_setter;
  exports.text_setter = text_setter;
  //ctrls
  exports.html = html;
  exports.text = text;
  exports.content = content;


  function content(elem, binders, link) {
    return function (val) {
      var _as = link.get_attrs().as;
      return exports[_as + '_setter'](elem, val);
    };
  }

  function html(elem, binders, link) {
    return html_setter.bind(null, elem);
  }

  function text(elem, binders, link) {
    return text_setter.bind(null, elem);
  }
});
define('qix-flux', function (require, exports, module) {
  //ctrls
  exports.when = when;
  function when(elem, binders, link) {
    var _placeholder = document.createComment('qix-flux#when(' + link.name + ') placeholder'),
      _controllers = true,
      _curr_elem = elem,
      _parent = elem.parentElement;
    _parent.insertBefore(_placeholder, _curr_elem);
    _when(false);

    function _when(bool, _binders) {
      if (neg_bool(bool) === neg_bool(_controllers))
        return _controllers;
      if (arguments.length === 1)
        _binders = binders;
      if (bool) {
        _controllers = link.spawn(_binders, _parent, 'after', _placeholder);
        _curr_elem = _controllers.$root_elems[0];
      } else {
        _curr_elem.remove();
        _curr_elem = null;
        _controllers = null;
        //link.destroy();
      }
      return _controllers;
    }
    return _when;
  }
});
define('qix', function () {
  var qix_module = {
    load: function load(name, localrequire, done) {
      localrequire(['qix-seed!' + name], make_qix_component.bind(null, done));
    }
  };
  return qix_module;
});
define('qix-seed', function () {
  function make_master_element_from_text(text) {
    var master_el = document.createElement('div');
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
    // var url = localrequire.toUrl(name);
    // get_remote_text(url, function(text) {
    localrequire(['text!' + name], function (text) {
      var master = make_master_element_from_text(text);
      var component_seed = {
        master: master,
        require: function (deps, cb, eb) {
          if (Array.prototype.isPrototypeOf(deps)) {
            deps = deps.map(path_resolver);
            return require(deps, cb, eb);
          } else {
            var _local_path = path_resolver(deps);
            return require(_local_path);
          }
        }
      };
      onload(component_seed);
    });
  }
  return {
    load: load
  };
});
function insert_children(holder_node, into_elem, where, ref_elem) {
  insert_children_map(into_elem, where, ref_elem, holder_node);
}

function insert_children_map(into_elem, where, ref_elem, holder_node) {
  as_array(holder_node.children)
    .forEach(insert_child_map.bind(null, into_elem, where, ref_elem));
}

function insert_child_map(into_elem, where, ref_elem, child_node) {
  where = where || 'append';
  //after / before / append / prepend ?
  if (where === 'append' || (where === 'after' && !ref_elem.nextSibling)) { //case 'after' but no nextSibling === case 'append'
    into_elem.appendChild(child_node);
  } else {
    var ref_elem_next = ref_elem; // case 'before'
    if (where === 'prepend')
      ref_elem_next = into_elem.firstChild;
    else if (where === 'after')
      ref_elem_next = ref_elem.nextSibling;
    into_elem.insertBefore(child_node, ref_elem_next);
  }
}

function insert_child(child_node, into_elem, where, ref_elem) {
  return insert_child_map(into_elem, where, ref_elem, child_node);
}

function spawn_component(comp, options, target) {
  var master_clone = comp.master.cloneNode(true);
  var _comp_elem;
  while ((_comp_elem = get_one_qix_component_element(master_clone)) !== null) {
    _comp_elem.remove();
    var ctrl_def = get_qix_elem_ctrl_def(_comp_elem);
    var ctrl = get_controller_by_component_definition(ctrl_def);
    var _sub_comp = Object.create(comp);
    _sub_comp.master = _comp_elem;
    ctrl(_sub_comp, options);
  }
  get_qix_controlled_elements(master_clone)
    .map(function (elem) {
      get_qix_elem_attr_ctrl_defs(elem)
        .map(function (def) {
          var ctrl = get_controller_by_component_definition(comp.require, def);
          ctrl(elem, options);
        });
    });
  insert_children(master_clone, target);
}
}());
//# sourceMappingURL=qix.js.map