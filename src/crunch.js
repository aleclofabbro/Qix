var QIX_INDEXED_ATTR_NAME = 'qix-ctl-indexes';
var QIX_MARKED_ATTR_NAME = 'qix';
var get_all_qix_controlled_element = select_has_attr_all.bind(null, QIX_MARKED_ATTR_NAME);
var get_one_qix_indexed_element = select_has_attr.bind(null, QIX_INDEXED_ATTR_NAME);
var _indexed_ctrls = [];

function push_indexed_ctrl(def) {
  def.index = _indexed_ctrls.push(def) - 1;
  return def;
}

function make_template_seed(master, seed_require, resolved) {
  var deps = flatten(get_all_qix_controlled_element(master)
    .map(index_elem_ctrls));

  var seed = {
    master: master,
    require: seed_require,
    deps: deps,
    resolved: resolved
  };
  seed.spawn = function (scope, into, where) {
    if (seed.resolved)
      spawn_seed(seed, scope, into, where);
    else
      seed.require(seed.deps, function () {
        seed.resolved = true;
        spawn_seed(seed, scope, into, where);
      });
  };
  return seed;
}



function index_elem_ctrls(elem) {
  var elem_ctrl_defs = attr(QIX_MARKED_ATTR_NAME, elem)
    .split('|')
    .map(function (def_string) {
      var ns__module = def_string.trim().split(':');
      var module__prop = ns__module[1].split('#');
      var module = module__prop[0];
      var prop = module__prop[1];
      var ns = ns__module[0];
      return push_indexed_ctrl({
        ns: ns,
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


function spawn_seed(seed, scope, into, where) {
  var component = {};
  var master_clone = clone_node(true, seed.master);
  crawl_indexed_elements(master_clone, seed, scope);
  insert_child_nodes(master_clone, into, where);
  return component;
}


function crawl_indexed_elements(master_clone, seed, scope) {
  var indexed_elem = get_one_qix_indexed_element(master_clone);
  if (!indexed_elem)
    return;
  crawl_indexes(indexed_elem, seed, scope);
  attr_rm(QIX_INDEXED_ATTR_NAME, indexed_elem);
  crawl_indexed_elements(master_clone, seed, scope);
}

function crawl_indexes(indexed_elem, seed, scope) {
  var indexes_attr = attr(QIX_INDEXED_ATTR_NAME, indexed_elem);
  if (!indexes_attr)
    return;
  var indexes = indexes_attr.split(',');
  var _next_ctrl_index = indexes.shift();
  var _next_ctrl_def = _indexed_ctrls[_next_ctrl_index];
  attr_set(QIX_INDEXED_ATTR_NAME, indexes.join(','), indexed_elem);
  var captured = control(indexed_elem, scope, seed, _next_ctrl_def);
  if (!captured)
    crawl_indexes(indexed_elem, seed, scope);
}



function control(elem, scope, seed, ctrl_def) {
  var factory = ctrl_def.factory;
  if (!factory) {
    factory = seed.require(ctrl_def.module);
    if (ctrl_def.prop)
      ctrl_def.factory = factory = factory[ctrl_def.prop];
  }
  var _captured = false;

  function _capture() {
    _captured = true;
    var placeholder = document.createComment('capture');
    replace_node(elem, placeholder);
    var holder = document.createElement('div');
    holder.appendChild(clone_node(true, elem));
    return {
      spawn: function (sub_scope) {
        if (!ctrl_def.sub_seed)
          ctrl_def.sub_seed = make_template_seed(holder, seed.require, true);
        ctrl_def.sub_seed.spawn(sub_scope, placeholder, 'before');
      },
      placeholder: placeholder,
      seed: seed
    };
  }
  var ctrl_ubind = factory(elem, scope, _capture, ctrl_def);
  if (ctrl_ubind) {
    // TODO ctrl_scope.$qix.on_destroy(ctrl_ubind);
  }
  return _captured;
}