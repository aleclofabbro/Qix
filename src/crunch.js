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