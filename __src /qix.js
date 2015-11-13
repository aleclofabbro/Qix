(function() {
  'use strict';
  var is_qix_attr = is_attr_namespaced.bind(null, 'qix');

  function noop() {}

  function invoke(fn) {
    return fn();
  }

  function normalize_hyphens(name) {
    return name.replace(/-/g, '_');
  }

  function denormalize_hyphens(name) {
    return name.replace(/_/g, '-');
  }

  function is_array_like(obj) {
    return ('length' in obj) && ('number' === typeof obj.length);
  }

  function as_array(obj) {
    return is_array_like(obj) ? Array.prototype.slice.call(obj) : [obj];
  }

  function is_attr_namespaced(prefix, attr) {
    return split_attr_ns_name(attr)[0] === prefix;
  }

  function split_attr_ns_name(attr) {
    return attr.name.split(':');
  }

  function make_master_template_element_from_text(text) {
    var templ_el = document.createElement('div');
    templ_el.innerHTML = text;
    return templ_el;
  }

  function make_ctrl_def(attr) {
    var name = split_attr_ns_name(attr)[1];
    var val_split = attr.value.split('#');
    return {
      name: normalize_hyphens(name),
      module_path: val_split[0],
      module_prop: val_split[1]
    };
  }

  function get_elem_ctrl_defs(elem) {
    return as_array(elem.attributes)
      .filter(is_qix_attr)
      .map(make_ctrl_def)
      .map(function(ctrl_def) {
        ctrl_def.master_element = elem;
        return ctrl_def;
      });
  }


  function attach_all_qix_to_child_nodes(element, deps_accum) {
    deps_accum = deps_accum || [];
    return as_array(element.childNodes)
      .reduce(function(_accum, curr_node) {
        // ? forse le if nodeType dentro a  get_elem_ctrl_defs (-> get_node_ctrl_defs)
        var node_ctrl_defs;
        if (curr_node.nodeType === Node.ELEMENT_NODE) {
          node_ctrl_defs = get_elem_ctrl_defs(curr_node);
          _accum = _accum.concat(node_ctrl_defs);
          attach_all_qix_to_child_nodes(curr_node, _accum);
          // attach_qix_to_elem(curr_node, node_ctrl_defs);
        }
        // else if (curr_node.nodeType === Node.TEXT_NODE){}
        // else if (curr_node.nodeType === Node.COMMENT_NODE){}
        if (node_ctrl_defs && node_ctrl_defs.length)
          curr_node.$qix = {
            ctrl_defs: node_ctrl_defs
          };
        return _accum;
      }, deps_accum);
  }

  function make_qix_component(callback, seed) {
    var master_template_element = make_master_template_element_from_text(seed.text);
    var all_ctrl_defs = attach_all_qix_to_child_nodes(master_template_element);
    var all_requires = all_ctrl_defs.map(function(ctrl_def) {
      return ctrl_def.module_path;
    });

    var component = {
      seed: seed,
      spawn: spawn_component.bind(null, master_template_element)
    };
    seed.require(all_requires, function() {
      all_ctrl_defs.forEach(function(ctrl_def) {
        var _module = seed.require(ctrl_def.module_path);
        var factory = ctrl_def.module_prop ? _module[ctrl_def.module_prop] : _module;
        if (!factory)
          throw new Error('No Factory for ctrl_def:\n' + JSON.stringify(ctrl_def, null, 4));

        // if ('function' === typeof factory)
        //   ctrl_def.factory = {
        //     capture: noop,
        //     bind: factory
        //   };
        // else
        ctrl_def.factory = factory;

      });
      callback(component);
    });
  }


  function spawn_component(master_template_element, ctrl_inits, into_elem, where, ref_elem) {
    where = where || 'append';
    var captured = capture_component(master_template_element, ctrl_inits);
    var _component_child_nodes = as_array(captured.component.childNodes);

    //after / before / append / prepend ?
    if (where === 'append' || (where === 'after' && !ref_elem.nextSibling)) {
      _component_child_nodes
        .forEach(into_elem.appendChild.bind(into_elem));
    } else {
      var ref_elem_next = ref_elem; // case 'before'
      if (where === 'prepend')
        ref_elem_next = into_elem.firstChild;
      else if (where === 'after')
        ref_elem_next = ref_elem.nextSibling;
      _component_child_nodes
        .forEach(function(_elem) {
          into_elem.insertBefore(_elem, ref_elem_next);
        });
    }
    return captured.binders.reduce(function(ctrls, binder) {
      binder(elem, ctrl_init, ctrls);
      return ctrls;
    }, {});
  }

  function capture_component(master, ctrl_inits) {
    var _clone_template = document.createElement('div'),
      binders = capture_children(master, _clone_template, ctrl_inits);
    return {
      component: _clone_template,
      binders: binders.reverse()
    };
  }

  function capture_children(master, target, ctrl_inits) {
    var binders = [];
    for (var i = 0; i < master.childNodes.length; i++) {
      var curr_master_node = master.childNodes[i];
      var node_binders = capture_node(target, curr_master_node, ctrl_inits);
      binders = binders.concat(node_binders);
    }
    return binders;
  }

  function get_capture_placeholder(ctrl_def) {
    document.createComment('qix placeholder for: ' + JSON.stringify(ctrl_def.name));
  }

  function binder_invoker(captured_node, ctrl_init, ctrls) {
    var ctrl_link = make_ctrl_link(_curr_ctrl_def, captured_node),
      ctrl = _curr_binder(captured_node, ctrl_init, control_link);
    ctrls[_curr_ctrl_def.name] = ctrl;
    return ctrl;
  }

  function make_ctrl_link(ctrl_def, elem) {
    var name = ctrl_def.name;
    var _ctrl_link = Object.create(ctrl_def);
    _ctrl_link.get_attrs = get_ctrl_attributes.bind(null, name, elem);
    _ctrl_link.set_attr = set_ctrl_attribute.bind(null, name, elem);
    _ctrl_link.elem = elem;
    return _ctrl_link;
  }

  function set_ctrl_attribute(ctrl_name, elem, name, val) {
    var denorm_ns_attr_name = denormalize_hyphens(ctrl_name) + ':' + denormalize_hyphens(name);
    if (val === null)
      elem.removeAttribute(denorm_ns_attr_name, val);
    else {
      val = (val === void(0) ? '' : val)
      elem.setAttribute(denorm_ns_attr_name, val);
    }
    return val;
  }

  function get_ctrl_attributes(ctrl_name, elem) {
    var _denomalized_name = denormalize_hyphens(ctrl_name);
    return as_array(elem.attributes)
      .filter(is_attr_namespaced.bind(null, _denomalized_name))
      .reduce(function(ctrl_attrs, attr) {
        var normalized_attr_name = normalize_hyphens(split_attr_ns_name(attr)[1]);
        ctrl_attrs[normalized_attr_name] = attr.value;
        return ctrl_attrs;
      }, {});
  }

  function capture_node(target, master_node, ctrl_inits) {
    var captured_node,
      binders = [];
    if (master_node.$qix) {
      var _ctrl_defs = master_node.$qix.ctrl_defs;
      for (var i = 0; i < _ctrl_defs.length; i++) {
        var _curr_ctrl_def = _ctrl_defs[i],
          _curr_binder = _curr_ctrl_def.factory(master_node, ctrl_inits,
            function capture_node() {
              captured_node = get_capture_placeholder(_curr_ctrl_def);
              return captured_node;
            });

        if (_curr_binder) {
          var _invoker = binder_invoker.bind(null, captured_node, ctrl_inits);
          binders.push(_invoker);
        }
        if (captured_node) {
          if (i > 0)
            console.warn('WARNING: Qix#capture_node Captured :',
              _curr_ctrl_def, 'at index', i, 'all:', _ctrl_defs);
          break;
        }
      }
    }
    if (!captured_node)
      captured_node = clone_node(master_node);

    target.appendChild(captured_node);
    if (captured_node.nodeType === Node.ELEMENT_NODE) {
      var _children_binders = capture_children(master_node, captured_node, ctrl_inits);
      binders = binders.concat(_children_binders);
    }
    return binders;
  }

  function clone_node(node, deep) {
    return node.cloneNode(deep);
  }

  function load(name, localrequire, done) {
    localrequire(['qix-seed!' + name], make_qix_component.bind(null, done));
  };


  var Qix = {
    load: load
  };

  define('qix', Qix);







  /*
   * qix-seed loader
   **/
  define('qix-seed', function() {

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
      localrequire(['text!' + name], function(text) {
        var component_seed = {
          text: text,
          require: function(deps) {
            if (Array.prototype.isPrototypeOf(deps)) {
              var args = as_array(arguments);
              args[0] = args[0].map(path_resolver);
              return require.apply(null, args);
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


  /*
   * text loader
   **/
  define('text', function() {
    function load(name, localrequire, onload, config) {
      var url = localrequire.toUrl(name);
      get_remote_text(url, onload);
    }
    return {
      load: load
    };
  });

  function get_remote_text(url, callback) {
    var xhr = createXMLHTTPObject();
    if (!xhr)
      throw new Error('NO XHR!');
    xhr.responseType = 'text';
    xhr.open('GET', url, true);
    // xhr.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4)
        return;
      if (xhr.status != 200 && xhr.status != 304) {
        throw new Error('get_remote_text HTTP error for [' + url + '] : ' + xhr.status);
      }
      callback(xhr.responseText);
    }
    if (xhr.readyState == 4)
      return;
    xhr.send();
  }

  var XMLHttpFactories = [
    function() {
      return new XMLHttpRequest()
    },
    function() {
      return new ActiveXObject('Msxml2.XMLHTTP')
    },
    function() {
      return new ActiveXObject('Msxml3.XMLHTTP')
    },
    function() {
      return new ActiveXObject('Microsoft.XMLHTTP')
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
}());