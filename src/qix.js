(function() {
  'use strict';
  define('qix', function() {
    var _qix_attr_placeholder = 'qix-element';
    var is_qix_attr = is_attr_namespaced.bind(null, 'qix');

    function is_array_like(obj) {
      return ('length' in obj) && ('number' === typeof obj.length);
    }

    function as_array(obj) {
      return is_array_like(obj) ? Array.prototype.slice.call(obj) : [obj];
    }

    function master_elem_array_from_text(text) {
      var div = document.createElement('div');
      div.innerHTML = text;
      return as_array(div.children);
    };

    function get_master_elem_array(master_elem_array_or_text) {
      if ('string' === typeof master_elem_array_or_text) {
        return master_elem_array_from_text(master_elem_array_or_text);
      } else return as_array(master_elem_array_or_text);

    }

    function is_attr_namespaced(prefix, attr) {
      return split_attr_ns_name(attr)[0] === prefix;
    }

    function split_attr_ns_name(attr) {
      return attr.name.split(':');
    }

    function get_ctrl_attributes(ctrl_name, elem) {
      return as_array(elem.attributes)
        .reduce(function(ctrl_attrs, attr) {
          if (is_attr_namespaced(denormalize_hyphens(ctrl_name), attr)) {
            var normalized_attr_name = normalize_hyphens(split_attr_ns_name(attr)[1]);
            ctrl_attrs[normalized_attr_name] = attr.value;
          }
          return ctrl_attrs;
        }, {});
    }

    function make_ctrl_def(master_elem, attr) {
      var name = split_attr_ns_name(attr)[1];
      var val_split = attr.value.split('#');
      return {
        name: normalize_hyphens(name),
        module_path: val_split[0],
        module_prop: val_split[1]
          // master_elem: master_elem
      };
    }

    function make_ctrl_defs(master_elem) {
      return as_array(master_elem.attributes)
        .filter(is_qix_attr)
        .map(make_ctrl_def.bind(null, master_elem));
    }

    function merge_objs(target, obj) {
      for (var k in obj)
        target[k] = obj[k];
      return target;
    }

    function mark_qix_elem(master_elem, _ctrl_defs) {
      var _elems_ctrl_names = _ctrl_defs.map(prop_get.bind(null, 'name'));
      master_elem.setAttribute(_qix_attr_placeholder, _elems_ctrl_names.join(','));
    }

    function get_all_ctrl_defs(master_elem_array) {
      return master_elem_array
        .reduce(function(all_defs, master_elem) {
          var _ctrl_defs = make_ctrl_defs(master_elem);
          if (_ctrl_defs.length) {
            mark_qix_elem(master_elem, _ctrl_defs);
            _ctrl_defs.forEach(function(_ctrl_def) {
              all_defs[_ctrl_def.name] = _ctrl_def;
            });
          }
          return merge_objs(get_all_ctrl_defs(as_array(master_elem.children)), all_defs);
        }, {});
    }

    function prop_get(prop, obj) {
      return obj ? obj[prop] : void(0);
    }

    function get_prop(obj, prop) {
      return prop_get(prop, obj);
    }


    function make_qix(callback, errback, master_elem_array_or_text) {
      var master_elem_array = get_master_elem_array(master_elem_array_or_text);
      var all_ctrl_defs = get_all_ctrl_defs(master_elem_array);
      var all_module_arr = Object.keys(get_all_ctrl_defs(master_elem_array))
        .map(get_prop.bind(null, all_ctrl_defs))
        .map(prop_get.bind(null, 'module_path'));

      require(all_module_arr,
        function( /* all_modules */ ) {
          var qix_obj = Object.create(qix_proto);
          qix_obj._all_ctrl_defs = all_ctrl_defs;
          qix_obj._master_elem_array = master_elem_array;
          callback(qix_obj);
        }, errback);
    }

    function make_clone(master_elem) {
      return master_elem.cloneNode(true);
    };

    function normalize_hyphens(name) {
      return name.replace(/-/g, '_');
    }

    function denormalize_hyphens(name) {
      return name.replace(/_/g, '-');
    }

    function populate_controllers(_the_qix, binders, ctrls, elem_clone) {

      var _qix_elems = as_array(elem_clone.querySelectorAll('[' + _qix_attr_placeholder + ']'));
      if (elem_clone.hasAttribute(_qix_attr_placeholder))
        _qix_elems.unshift(elem_clone);
      _qix_elems
        .forEach(function(qix_elem) {
          var qix_attr_value = qix_elem.getAttribute(_qix_attr_placeholder);
          var elem_ctrl_names = qix_attr_value.split(',');
          elem_ctrl_names
            .forEach(function(name) {
              var ctrl_def = _the_qix._all_ctrl_defs[name];
              var _module = require(ctrl_def.module_path);
              var factory = ctrl_def.module_prop ? _module[ctrl_def.module_prop] : _module;
              if (!factory)
                throw new Error('No Factory for ctrl_def' + JSON.stringify(ctrl_def, null, 4));
              var _ctrl_link = Object.create(ctrl_def);
              _ctrl_link.attrs = get_ctrl_attributes.bind(null, name, qix_elem);
              _ctrl_link.elem = qix_elem;
              ctrls[name] = factory(qix_elem, binders[name], _ctrl_link);
              ctrls['$' + name] = _ctrl_link;
              //qix_elem.addEventListener();
            });
        });
      return ctrls;
    }

    var qix_proto = {
      spawn: function(binders) {
        var _the_qix = this;
        var _root_elems = _the_qix._master_elem_array
          .map(make_clone);
        return _root_elems
          .reduce(populate_controllers.bind(null, _the_qix, binders), {
            $root_elems: _root_elems
          });
      },
      spawn_into: function(binders, into_elem) {
        var ctrls = this.spawn(binders);
        ctrls
          .$root_elems
          .forEach(into_elem.appendChild.bind(into_elem));
        return ctrls;
      }
    };

    var noop = function() {};

    return {
      load: function(name, localrequire, done) {
        localrequire(['text!' + name], make_qix.bind(null, done, noop));
      }
    };
  });

  /*
   * text loader
   **/
  define('text', function() {
    function sendRequest(url, callback) {
      var xhr = createXMLHTTPObject();
      if (!xhr)
        throw new Error('NO XHR!');
      xhr.responseType = "text";
      xhr.open('GET', url, true);
      // xhr.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4)
          return;
        if (xhr.status != 200 && xhr.status != 304) {
          //          alert('HTTP error ' + xhr.status);
          return;
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
        return new ActiveXObject("Msxml2.XMLHTTP")
      },
      function() {
        return new ActiveXObject("Msxml3.XMLHTTP")
      },
      function() {
        return new ActiveXObject("Microsoft.XMLHTTP")
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

    function load(name, parentRequire, onload, config) {
      var url = parentRequire.toUrl(name);
      sendRequest(url, onload);
    }

    return {
      load: load
    };
  });
}());