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