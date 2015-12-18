(function () {
    "use strict";
var QIX_INDEXED_ATTR_NAME = 'qix-ctl-indexes';
var QIX_MARKED_ATTR_NAME = 'qix';
var get_all_qix_controlled_element = select_has_attr_all.bind(null, QIX_MARKED_ATTR_NAME);
var get_one_qix_indexed_element = select_has_attr.bind(null, QIX_INDEXED_ATTR_NAME);
var _indexed_ctrls = [];

function push_indexed_ctrl(def) {
  def.index = _indexed_ctrls.push(def) - 1;
  return def;
}
var _qix_id = 0;



function make_template_seed(master, seed_require, resolved) {
  var deps = flatten(get_all_qix_controlled_element(master)
    .map(index_elem_ctrls));

  var seed = {
    master: master,
    require: seed_require,
    deps: deps,
    resolved: resolved
  };
  seed.spawn = function (model, into, where) {
    if (seed.resolved)
      spawn_seed(seed, model, into, where);
    else
      seed.require(seed.deps, function () {
        seed.resolved = true;
        spawn_seed(seed, model, into, where);
      });
  };
  return seed;
}



function index_elem_ctrls(elem) {
  var elem_ctrl_defs = attr(QIX_MARKED_ATTR_NAME, elem)
    .split('|')
    .map(function (def_string) {
      var io__name = def_string.trim().split(':');
      var name__prop = io__name[1].split('#');
      var module = name__prop[0];
      var prop = name__prop[1];
      var io = io__name[0];
      return push_indexed_ctrl({
        io: io,
        module: module,
        prop: prop
      });
    });

  var elem_deps = elem_ctrl_defs
    .map(prop.bind(null, 'module'));
  var elem_indexes = elem_ctrl_defs
    .map(prop.bind(null, 'index'));
  attr_rm('qix', elem);
  attr_set(QIX_INDEXED_ATTR_NAME, elem_indexes.join(','), elem);
  return elem_deps;
}

function qix_model(model, parent) {
  if (!model.$qix) {
    var msg = model.lens('$$');
    var destroy_stream = msg.filter(eq.bind(null, true, 'destroy')).take(1);
    var destroy_event = destroy_stream.onValue.bind(destroy_stream);
    var destroy = msg.set.bind(msg, 'destroy');
    model.$qix = {
      id: _qix_id++,
      on_destroy: destroy_event,
      destroy: destroy,
      msg: msg,
      bound: [],
      child_nodes: []
    };
    model.$qix.on_destroy(do_destroy_stream.bind(null, model));
  }
  if (parent)
    parent.$qix.on_destroy(model.$qix.destroy);
}

function do_destroy_stream(model) {
  // model.$qix.bound.forEach(function (unbind) {
  //   unbind();
  // });
  if (!model.$qix)
    return;
  model.$qix.bound = [];
  remove_elements(model.$qix.child_nodes);
  model.$qix.child_nodes = [];
  model.$qix = void(0);
  model.doEnd();
  model.set(void(0));
  // model.dispatcher.unsubSrc();
  // model.dispatcher.unsubscribeFromSource();
  // model.dispatcher.subscriptions.forEach(function (subscription) {
  //   model.dispatcher.removeSub(subscription);
  // });
}

function spawn_seed(seed, model, into, where) {
  qix_model(model);
  var master_clone = clone_node(true, seed.master);
  crawl_indexed_elements(master_clone, seed, model);
  var child_nodes = insert_child_nodes(master_clone, into, where);
  model.$qix.child_nodes = model.$qix.child_nodes.concat(child_nodes);
  // model.$qix.on_destroy(function () {
  //   remove_elements(child_nodes);
  //   model.$qix = void(0);
  //   model.set(void(0));
  // });
}


function crawl_indexed_elements(master_clone, seed, model) {
  var indexed_elem = get_one_qix_indexed_element(master_clone);
  if (!indexed_elem)
    return;
  crawl_indexes(indexed_elem, seed, model);
  attr_rm(QIX_INDEXED_ATTR_NAME, indexed_elem);
  crawl_indexed_elements(master_clone, seed, model);
}

function crawl_indexes(indexed_elem, seed, model) {
  var indexes_attr = attr(QIX_INDEXED_ATTR_NAME, indexed_elem);
  if (!indexes_attr) {
    return;
  }
  var indexes = indexes_attr.split(',');
  var _next_ctrl_index = indexes.shift();
  var _next_ctrl_def = _indexed_ctrls[_next_ctrl_index];
  attr_set(QIX_INDEXED_ATTR_NAME, indexes.join(','), indexed_elem);
  var stripped = control(indexed_elem, model, seed, _next_ctrl_def);
  if (!stripped)
    crawl_indexes(indexed_elem, seed, model);
}



function control(elem, model, seed, ctrl_def) {
  var factory = ctrl_def.factory;
  if (!factory)
    ctrl_def.factory = factory = seed.require(ctrl_def.module);
  var _stripped = false;

  function _strip() {
    _stripped = true;
    var placeholder = document.createComment('strip');
    replace_node(elem, placeholder);
    var holder = document.createElement('div');
    holder.appendChild(clone_node(true, elem));
    return {
      spawn: function (sub_model) {
        qix_model(sub_model, model);
        if (!ctrl_def.sub_seed)
          ctrl_def.sub_seed = make_template_seed(holder, seed.require, true);
        ctrl_def.sub_seed.spawn(sub_model, placeholder, 'before');
      },
      placeholder: placeholder,
      seed: seed
    };
  }
  if (ctrl_def.prop)
    factory = factory[ctrl_def.prop];
  var ctrl_model;
  if (ctrl_def.io) {
    ctrl_model = model.lens(ctrl_def.io);
    qix_model(ctrl_model, model);
  } else
    ctrl_model = model;
  var ctrl_ubind = factory(elem, ctrl_model, model, _strip, ctrl_def);
  if (ctrl_ubind) {
    //model.$qix.bound.push(ctrl_ubind);
    ctrl_model.$qix.on_destroy(ctrl_ubind);
  }
  return _stripped;
}
define('qix-if',
  function () {
    return function (elem, model, mainmodel, strip) {
      var seeder = strip();
      var _current = null;
      var _switch = false;
      var unsub = model.onValue(function (val) {
        if (_switch)
          return;
        _switch = true;
        if (!_current && val) {
          _current = model.lens('');
          seeder.spawn(_current, seeder.placeholder, 'before');
        } else if (_current && !val) {
          destroy_sub();
          _current = null;
        }
        _switch = false;
      });

      // mainmodel.$qix.on_destroy(destroy);

      function destroy_sub() {
        if (_current && _current.$qix) {
          console.log('IF DESTROY SUB');
          _current.$qix.destroy();
        }
        _current = null;

      }

      function destroy() {
        console.log('IF DESTROY');
        destroy_sub();
        unsub();
      }
      return destroy;
    };
  });
define('qix-map',
  function () {
    return function (elem, model, mainmodel, strip) {
      var seeder = strip();
      var currents = [];
      var _switch = false;
      var unsub = model.onValue(function (arr) {
        if (_switch)
          return;
        _switch = true;
        arr = as_array(arr);
        var delta = arr.length - currents.length;
        if (delta < 0)
          destroy_subs(delta);
        else if (delta > 0)
          add_subs(delta);
        _switch = false;
      });

      function add_subs(delta) {
        var to_spawn = [];
        var _l = currents.length;
        for (var i = _l; i < (delta + _l); i++) {
          var sub_model = model.lens('' + i);
          currents.push(sub_model);
          to_spawn.push(sub_model);
        }
        // setTimeout(function () {
        to_spawn.forEach(function (sub_model) {
          seeder.spawn(sub_model, seeder.placeholder, 'before');
        });
        // });
      }

      function destroy_subs(delta) {
        var to_destroy = currents.splice(delta);
        // setTimeout(function () {
        console.log('MAP DESTROY ', to_destroy.length);
        to_destroy.forEach(function (sub_model) {
          sub_model.$qix.destroy();
        });
        // });
      }
      // mainmodel.$qix.on_destroy(destroy);

      function destroy() {
        unsub();
        destroy_subs(-currents.length);
        model.set(void(0));
        console.log('MAP DESTROY', currents, model.get());
      }
      return destroy;
    };
  });
define('qix-tpl',
  function () {
    return function (elem, model, mainmodel, strip, ctrl_def) {
      var tpl_path = attr('qix-tpl', elem);
      var stripper = strip();
      if (!ctrl_def._my_seed)
        stripper.seed.require(['qix!' + tpl_path], function (seed) {
          ctrl_def._my_seed = seed;
          seed.spawn(model, stripper.placeholder, 'before');
        });
      else
        ctrl_def._my_seed.spawn(model, stripper.placeholder, 'before');

      // mainmodel.$qix.on_destroy(destroy);

      function destroy() {
        console.log('TPL DESTROY');
        if (model.$qix)
          model.$qix.destroy();
      }
      return destroy;
    };
  });
function flatten(a) {
  return a.reduce(function (acc, arr_el) {
    return acc.concat(arr_el);
  }, []);
}

function prop(prp, obj) {
  return obj ? obj[prp] : void(0);
}

// function prop_of(obj, prp) {
//   return obj ? obj[prp] : void(0);
// }

function is_array_like(obj) { // TODO: improve ?
  return !!obj && ('length' in obj) && ('number' === typeof obj.length);
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

function eq(strict, a, b) {
  if (strict)
    return a === b;
  else
    return a == b;
}

function attr_rm(attr_name, elem) {
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

// function invoke(name, args, obj) {
//   return obj[name].apply(obj, args);
// }

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

// function noop() {}
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
define('qix', function() {
  var qix_module = {
    load: function load(name, localrequire, done) {
      localrequire(['qix-seed!' + name], done);
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

  function load(name, localrequire, onload /*, config*/ ) {
    var seed_require = require.s.contexts._.makeRequire({
      name: name
    }, {
      enableBuildCallback: true
    });
    localrequire(['qix-text!' + name + '.html' /*, name*/ ], function (text /*, def*/ ) {
      var master = make_master_element_from_text(text);
      var seed = make_template_seed(master, seed_require);
      onload(seed);
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
}());
//# sourceMappingURL=qix.js.map