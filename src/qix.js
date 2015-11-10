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
    var templ_el = document.createElement('template');
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
        ctrl_def.master_element = master_elem;
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
          attach_qix_to_elem(curr_node, node_ctrl_defs);
        }
        // else if (curr_node.nodeType === Node.TEXT_NODE){}
        // else if (curr_node.nodeType === Node.COMMENT_NODE){}
        if (node_ctrl_defs.length)
          curr_node.$qix = {
            ctrl_defs: node_ctrl_defs
          };
        return _accum;
      }, deps_accum);
  }

  function make_qix_component(callback, seed) {
    var master_template_element = make_master_template_element_from_text(seed.text),
      all_ctrl_defs = attach_all_qix_to_child_nodes(master_template_element),
      all_requires = all_ctrl_defs.map(function(ctrl_def) {
        return ctrl_def.module_path;
      });

    var component = {
      seed: seed,
      spawn: spawn_component.bind(null, master_template_element)
    };
    seed.require(all_requires, function() {
      all_ctrl_defs.forEach(function(ctrl_def) {
        var module = seed.require(ctrl_def.module_path);
        var factory = ctrl_def.module_prop ? _module[ctrl_def.module_prop] : _module;
        if (!factory)
          throw new Error('No Factory for ctrl_def:\n' + JSON.stringify(ctrl_def, null, 4));

        if ('function' === typeof factory)
          ctrl_def.factory = {
            capture: noop,
            bind: factory
          };
        else
          ctrl_def.factory = factory;

      });
      callback(component);
    });
  }


  function spawn_component(master_template_element, ctrl_inits, into_elem, where, ref_elem) {
    where = where || 'append';
    var component = capture_component(master_template_element, ctrl_inits),
      _component_child_nodes = as_array(component.childNodes);
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

    component.binders.forEach(invoke);

    return ctrls;
  }

  function capture_component(master, ctrl_inits) {
    var _clone_template = document.createElement('template');
    capture_children(master, _clone_template, ctrl_inits);
    return _clone_template;
  }

  function capture_children(master, target, ctrl_inits) {
    for (var i = 0; i < master.childNodes.length; i++) {
      var curr_master_node = master.childNodes[i];
      var captured_node = capture_node(curr_master_node, ctrl_inits);
      target.appendChild(captured_node);
    }
  }

  function get_capture_placeholder(ctrl_def) {
    document.createComment('qix placeholder for: ' + JSON.stringify(ctrl_def.name));
  }

  function capture_node(master_node, ctrl_inits) {
    var captured_node;
    if (master_node.$qix) {
      var _ctrl_defs = master_node.$qix.ctrl_defs;
      for (var i = 0; i < _ctrl_defs.length; i++) {
        var _curr_ctrl_def = _ctrl_defs[i];
        _curr_ctrl_def.capture(master_node, ctrl_inits, function capture_node() {
          captured_node = get_capture_placeholder(_curr_ctrl_def);
          return captured_node;
        });
        if (captured_node) {
          if (i > 0)
            console.warn('WARNING: Qix#capture_node Captured :', _curr_ctrl_def, 'at index', i, 'all:', _ctrl_defs);
          break;
        }
      }
    } else {
      captured_node = clone_node(master_node);
    }
    if(captured_node.nodeType === Node.ELEMENT_NODE)
      capture_children(master_node, captured_node, ctrl_inits);
    return captured_node;
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


}());