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

var qix_comps = {
  if: function (comp, opts) {
    // console.log('if', arguments);
    comp.spawn({}, document.body);
  },
  map: function (comp, opts) {
    // console.log('map', arguments);
    comp.spawn({}, document.body);
  },
  expose: function (comp, opts) {
      // console.log('expose', arguments);
      comp.spawn({}, document.body);
    } //to context
};

function spawn_component(comp, options, target) {
  var master_clone = comp.master.cloneNode(true);
  var _comp_elem;
  while ((_comp_elem = get_one_qix_component_element(master_clone)) !== null) {
    _comp_elem.remove();
    var ctrl = qix_comps[_comp_elem.attributes[0].name];
    var _sub_comp = seed_to_component({
      require: comp.require,
      master: _comp_elem
    });
    ctrl(_sub_comp, options);
  }
  get_qix_controlled_elements(master_clone)
    .map(function (elem) {
      get_qix_attr_ctrl_defs_of(elem)
        .forEach(function (def) {
          var ctrl = get_controller_by_component_definition(comp.require, def);
          ctrl(elem, options);
        });
    });
  insert_children(master_clone, target);
}