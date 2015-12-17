var get_all_qix_controlled_element = select_has_attr_all.bind(null, 'qix');
var QIX_INDEXED_ATTR_NAME = 'qix-ctl-indexes';
var get_one_qix_indexed_element = select_has_attr.bind(null, QIX_INDEXED_ATTR_NAME);
var _indexed_ctrls = [];

function push_indexed_ctrl(def) {
  def.index = _indexed_ctrls.push(def) - 1;
  return def;
}

function make_template_seed(master, seed_require) {
  var deps = flatten(get_all_qix_controlled_element(master)
    .map(index_elem_ctrls));

  var seed = {
    master: master,
    require: seed_require,
    deps: deps
  };
  seed.spawn = function (model, into, where, cb) {
    if (seed.resolved)
      (cb || noop)(spawn_seed(seed, model, into, where));
    else
      seed.require(seed.deps, function () {
        seed.resolved = true;
        (cb || noop)(spawn_seed(seed, model, into, where));
      });
  };
  return seed;
}

function index_elem_ctrls(elem) {
  var elem_ctrl_defs = attr('qix', elem)
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

function spawn_seed(seed, model, into, where) {
  var master_clone = clone_node(true, seed.master);
  crawl_indexed_elements(master_clone, seed, model);
  var child_nodes = insert_child_nodes(master_clone, into, where);
  return {
    destroy: function () {
      model.lens('$$.destroy').set(1);
    },
    child_nodes: child_nodes
  };
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
    var _seed;
    return {
      spawn: function (model) {
        if (!_seed)
          _seed = make_template_seed(holder, seed.require);
        _seed.spawn(model, placeholder, 'before');
      }
    };
  }
  if (ctrl_def.prop)
    factory = factory[ctrl_def.prop];
  var ctrl_ubind = factory(elem, model.lens(ctrl_def.io), model, _strip);
  if (ctrl_ubind)
    model
    .lens('$$.destroy')
    .skip(1)
    .take(1)
    .onValue(function () {
      ctrl_ubind();
    });
  return _stripped;
}