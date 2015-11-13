(function () {
    "use strict";
function invoke(fn) {
  return fn();
}

function as_bool(v) {
  return !!v;
}

function neg_bool(v) {
  return !v;
}

function noop() {}

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

function is_array_like(obj) {
  return ('length' in obj) && ('number' === typeof obj.length);
}

function is_undefined(o) {
  return o === void(0);
}

function as_array(obj) {
  if (is_undefined(obj))
    return [];
  return is_array_like(obj) ? Array.prototype.slice.call(obj) : [obj];
}

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
      return get_compiler_definition(STATIC_COMPILER);
      // var toks = attr.name.split(':');
      // var ctx_name = toks[1];
      // var factory = attr.value.split('#');
      // var module_name = factory[0];
      // var module_prop = factory[1];
      // return get_compiler_definition(module_name, module_prop, ctx_name);
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
  when.$qix = {
    spawn: true
  };

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
  function make_master_template_element_from_text(text) {
    var templ_el = document.createElement('div');
    templ_el.innerHTML = text;
    return templ_el;
  }

  function is_qix_attr(attr) {
    return 'qix' === attr.name.split(':')[0];
  }

  function insert_child(child, into_elem, where, ref_elem) {
    where = where || 'append';
    //after / before / append / prepend ?
    if (where === 'append' || (where === 'after' && !ref_elem.nextSibling)) {
      into_elem.appendChild(child);
    } else {
      var ref_elem_next = ref_elem; // case 'before'
      if (where === 'prepend')
        ref_elem_next = into_elem.firstChild;
      else if (where === 'after')
        ref_elem_next = ref_elem.nextSibling;
      into_elem.insertBefore(child, ref_elem_next);
    }

  }

  function get_factory($qix) {
    var comp_require = $qix.require;
    var module_name = $qix.node_ctrl_def.module_name;
    var module_prop = $qix.node_ctrl_def.module_prop;
    var _module = comp_require(module_name);
    var factory = module_prop ? _module[module_prop] : _module;
    return factory;
  }

  function spawn_branch(branch, ctrl_inits, into_elem, where, ref_elem) {
    var factory = get_factory(branch.$qix);
    var child = factory(branch.$qix.node, ctrl_inits);
    insert_child(child, into_elem, where, ref_elem);
    branch.map(function (sub_branch) {
      return spawn_branch(sub_branch, ctrl_inits, child);
    });

    return {};
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
  var qix_module = {
    load: function load(name, localrequire, done) {
      localrequire(['qix-seed!' + name], make_qix_component.bind(null, done));
    }
  };
  return qix_module;
});
define('qix-seed', function () {

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
      var component_seed = {
        text: text,
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
  define('text', function () {
    function load(name, localrequire, onload, config) {
      var url = localrequire.toUrl(name);
      get_remote_text(url, onload);
    }
    return {
      load: load
    };
  });
}());
//# sourceMappingURL=qix.js.map