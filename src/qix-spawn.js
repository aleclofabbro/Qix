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