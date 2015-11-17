function insert_children(holder_node, into_elem, where, ref_elem) {
  insert_children_map(into_elem, where, ref_elem, holder_node);
}

function insert_children_map(into_elem, where, ref_elem, holder_node) {
  as_array(holder_node.children)
    .forEach(insert_child_map.bind(null, into_elem, where, ref_elem));
}

function insert_child_map(into_elem, where, ref_elem, child_node) {
  where = where || 'append';
  //after / before / append / prepend ?
  if (where === 'append' || (where === 'after' && !ref_elem.nextSibling)) { //case 'after' but no nextSibling === case 'append'
    into_elem.appendChild(child_node);
  } else {
    var ref_elem_next = ref_elem; // case 'before'
    if (where === 'prepend')
      ref_elem_next = into_elem.firstChild;
    else if (where === 'after')
      ref_elem_next = ref_elem.nextSibling;
    into_elem.insertBefore(child_node, ref_elem_next);
  }
}

function insert_child(child_node, into_elem, where, ref_elem) {
  return insert_child_map(into_elem, where, ref_elem, child_node);
}

function spawn_component(comp, options, target) {
  var _comp_elem;
  while ((_comp_elem = get_one_qix_component_element(comp.master)) !== null) {
    _comp_elem.remove();
    var ctrl_def = get_qix_elem_ctrl_def(_comp_elem);
    var ctrl = get_controller_by_component_definition(ctrl_def);
    var _sub_comp = Object.create(comp);
    _sub_comp.master = _comp_elem;
    ctrl(_sub_comp, options);
  }
  get_qix_controlled_elements(comp.master)
    .map(function (elem) {
      get_qix_elem_attr_ctrl_defs(elem)
        .map(function (def) {
          var ctrl = get_controller_by_component_definition(comp.require, def);
          ctrl(elem, options);
        });
    });
  insert_children(comp.master, target);
}