(function() {
  'use strict';

  function is_array_like(obj) {
    return ('length' in obj) && ('number' === typeof obj.length);
  }

  function as_array(obj) {
    return is_array_like(obj) ? Array.prototype.slice.call(obj) : [obj];
  }
  define('qix', function() {
    var _qix_attr_placeholder = 'qix-element-placeholder';
    var is_qix_attr = is_attr_namespaced.bind(null, 'qix');

    function master_elem_array_from_text(text) {
      var div = document.createElement('div');
      div.innerHTML = text;
      return as_array(div.children);
    };

    function is_attr_namespaced(prefix, attr) {
      return split_attr_ns_name(attr)[0] === prefix;
    }

    function split_attr_ns_name(attr) {
      return attr.name.split(':');
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

    function make_ctrl_def(attr) {
      var name = split_attr_ns_name(attr)[1];
      var val_split = attr.value.split('#');
      return {
        name: normalize_hyphens(name),
        module_path: val_split[0],
        module_prop: val_split[1]
      };
    }

    function make_ctrl_defs_for_elem(master_elem) {
      return as_array(master_elem.attributes)
        .filter(is_qix_attr)
        .map(make_ctrl_def)
        .map(function(ctrl_def) {
          ctrl_def.master_element = master_elem;
          return ctrl_def;
        });
    }

    function merge_objs(target, obj) {
      for (var k in obj)
        target[k] = obj[k];
      return target;
    }

    function mark_as_qix_elem(master_elem, _ctrl_defs) {
      if (_ctrl_defs.length) {
        var _elems_ctrl_names = _ctrl_defs.map(prop_get.bind(null, 'name'));
        master_elem.setAttribute(_qix_attr_placeholder, _elems_ctrl_names.join(','));
      }
    }

    function get_all_ctrl_defs(master_elem_array) {
      return master_elem_array
        .reduce(function(all_defs, master_elem) {
          var _ctrl_defs = make_ctrl_defs_for_elem(master_elem);
          mark_as_qix_elem(master_elem, _ctrl_defs);
          _ctrl_defs
            .forEach(function(_ctrl_def) {
              all_defs[_ctrl_def.name] = _ctrl_def;
            });
          return merge_objs(get_all_ctrl_defs(as_array(master_elem.children)), all_defs);
        }, {});
    }

    function prop_get(prop, obj) {
      return obj ? obj[prop] : void(0);
    }

    function get_prop(obj, prop) {
      return prop_get(prop, obj);
    }

    /** @function make_qix 
     *    generates a qix component facctory from a component seed
     */
    function make_qix(callback, errback, component_seed) {
      // TODO hook text 
      var master_elem_array = master_elem_array_from_text(component_seed.text);
      // TODO hook elems
      var all_ctrl_defs = get_all_ctrl_defs(master_elem_array);
      var all_defs_keys =
        Object.keys(all_ctrl_defs);

      var all_module_arr =
        all_defs_keys
        .map(get_prop.bind(null, all_ctrl_defs))
        .map(prop_get.bind(null, 'module_path'));

      component_seed.require(all_module_arr,
        function( /* all_modules */ ) {
          all_defs_keys.forEach(function(def_key, index) {
            var ctrl_def = all_ctrl_defs[def_key];
            var _module = component_seed.require(ctrl_def.module_path);
            var factory = ctrl_def.module_prop ? _module[ctrl_def.module_prop] : _module;
            if (!factory)
              throw new Error('No Factory for ctrl_def:\n' + JSON.stringify(ctrl_def, null, 4));
            ctrl_def.factory = factory;
            ctrl_def.component_seed = component_seed;
            if (ctrl_def.factory.$qix) {
              var _opts = ctrl_def.factory.$qix;
              if (_opts.spawn) {
                var _my_strip_clone = ctrl_def.master_element.cloneNode(true);
                _my_strip_clone.removeAttribute('qix:' + ctrl_def.name);
                _my_strip_clone.setAttribute(_qix_attr_placeholder, _my_strip_clone.getAttribute(_qix_attr_placeholder).split(',').filter(function(tok) {
                  return tok !== ctrl_def.name;
                }).join(','));
                ctrl_def.spawn = spawn.bind(null, [_my_strip_clone], all_ctrl_defs);
                // ctrl_def.spawn_into = spawn_into.bind(null, [_my_strip_clone], all_ctrl_defs)

              }
            }
          });
          var qix_obj = {
            component_seed: component_seed,
            spawn: spawn.bind(null, master_elem_array, all_ctrl_defs)
              // spawn_into: spawn_into.bind(null, master_elem_array, all_ctrl_defs)
          };
          callback(qix_obj);
        }, errback);
    }

    function spawn(master_elem_array, all_ctrl_defs, ctrl_inits, into_elem, where, ref_elem) {
      where = where || 'append';
      var _cloned_elems = master_elem_array
        .map(make_clone);

      //after / before / append / prepend ?
      if (where === 'append' || (where === 'after' && !ref_elem.nextSibling) ) {
        _cloned_elems
          .forEach(into_elem.appendChild.bind(into_elem));
      } else {
        var ref_elem_next = ref_elem; // case 'before'
        if (where === 'prepend')
          ref_elem_next = into_elem.firstChild;
        else if (where === 'after')
          ref_elem_next = ref_elem.nextSibling;
        _cloned_elems
          .forEach(function(_elem) {
            into_elem.insertBefore(_elem, ref_elem_next);
          });
      }

      // TODO hook
      // var _tmp_container = document.createElement('div');
      // _cloned_elems.forEach(_tmp_container.appendChild.bind(_tmp_container));
      var ctrls = _cloned_elems
        .reduce(function(ctrls, elem_clone) {
          return bind_controllers(all_ctrl_defs, ctrl_inits, ctrls, elem_clone);
        }, {
          $root_elems: _cloned_elems,
          $factories: []
        });
      // ctrls.bind_all = [].forEach.bind(ctrls.$factories, invoke);
      ctrls.$factories
        .forEach(invoke);
      return ctrls;
    }

    function invoke(fn) {
      return fn();
    }

    // function spawn_into(master_elem_array, all_ctrl_defs, ctrl_inits, into_elem) {
    //   var ctrls = spawn(master_elem_array, all_ctrl_defs, ctrl_inits);
    //   ctrls
    //     .$root_elems
    //     .forEach(into_elem.appendChild.bind(into_elem));
    //   ctrls.bind_all();
    //   return ctrls;
    // }

    function make_clone(master_elem) {
      return master_elem.cloneNode(true);
    };

    function normalize_hyphens(name) {
      return name.replace(/-/g, '_');
    }

    function denormalize_hyphens(name) {
      return name.replace(/_/g, '-');
    }

    function make_ctrl_link(ctrl_def, elem) {
      var name = ctrl_def.name;
      var _ctrl_link = Object.create(ctrl_def);
      _ctrl_link.get_attrs = get_ctrl_attributes.bind(null, name, elem);
      _ctrl_link.set_attr = set_ctrl_attribute.bind(null, name, elem);
      _ctrl_link.elem = elem;
      return _ctrl_link;
    }

    function bind_controller(ctrl_def, ctrl_inits, elem, ctrls) {
      var name = ctrl_def.name;
      // if (ctrls[name])
      //   throw new Error('QIX#bind_controller: duplicate ctrl name:' + name);
      var _ctrl_link = make_ctrl_link(ctrl_def, elem);
      // TODO hook
      ctrls.$factories.unshift(function() {
        ctrls[name] = ctrl_def.factory(elem, ctrl_inits[name], _ctrl_link);
      });
      ctrls['$' + name] = _ctrl_link;
      return ctrls;
    }

    function qix_control(factory, name, elem, ctrl_init) {
      // DONT mark as qix
      var control_link = make_ctrl_link({
        name: name,
        factory: factory,
      }, elem);
      var ctrl = {};
      ctrl['$' + name] = control_link;
      ctrl[name] = factory(elem, ctrl_init, control_link);
      return ctrl;
    }

    function bind_controllers_elem(_all_ctrl_defs, ctrl_inits, ctrls, elem) {
      var qix_attr_value = elem.getAttribute(_qix_attr_placeholder);
      var elem_ctrl_names = qix_attr_value.split(',');
      return elem_ctrl_names
        .reduce(function(ctrls, name) {
          return bind_controller(_all_ctrl_defs[name], ctrl_inits, elem, ctrls);
        }, ctrls);
    }

    function is_qix_elem(elem) {
      return !!elem.getAttribute(_qix_attr_placeholder);
    }

    function get_qix_children_elems_array(elem) {
      return as_array(elem.querySelectorAll('[' + _qix_attr_placeholder + ']'))
    }

    function get_all_qix_elems_array(elem) {
      var _qix_elems = get_qix_children_elems_array(elem);
      if (is_qix_elem(elem))
        _qix_elems.unshift(elem);
      return _qix_elems;
    }

    function bind_controllers(_all_ctrl_defs, ctrl_inits, ctrls, elem) {
      return get_all_qix_elems_array(elem)
        .reduce(bind_controllers_elem.bind(null, _all_ctrl_defs, ctrl_inits), ctrls);
    }
    // function get_all_qix_elems_array(elem) {
    //   return as_array(elem.children).filter(is_qix_elem);
    // }

    // function bind_controllers(_all_ctrl_defs, ctrl_inits, ctrls, elem) {
    //   ctrls = get_all_qix_elems_array(elem)
    //     .reduce(bind_controllers_elem.bind(null, _all_ctrl_defs, ctrl_inits), ctrls);
    //   ctrls = as_array(elem.children).reduce(bind_controllers.bind(null, _all_ctrl_defs, ctrl_inits), ctrls);
    //   return ctrls;
    // }

    function noop() {};

    /** @function load 
     *   the requirejs plugin load method
     *   load
     */
    function load(name, localrequire, done) {
      localrequire(['qix-seed!' + name], make_qix.bind(null, done, noop));
    };

    /** @function make 
     *   a make_qix rearranged for users
     */
    function make(component_seed, callback, errback) {
      return make_qix(callback, errback, component_seed);
    }
    return {
      load: load,
      make: make,
      control: qix_control
    };
  });

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