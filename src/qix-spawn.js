function insert_child(child_node, into_elem, where, ref_elem) {
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


function cycle_over_attr_ctrls(ctrls, elem, ctrl_inits) {
  if (ctrls.length) {
    var _remaining_ctrls = ctrls.slice(1);
    var ctrl = ctrls[0];
    ctrl.factory(elem, ctrl_inits, {});
    cycle_over_attr_ctrls(_remaining_ctrls, elem, ctrl_inits);
  }
}

function spawn_branch_content(of_branch, ctrl_inits, parent_elem, where, ref_elem) {
  if (of_branch.length) {
    var continue_branch_spawn = function () {
      var branch = of_branch[0];
      var _remaining_branches = of_branch.slice(1);
      _remaining_branches.$qix = branch.$qix;
      spawn_branch_content(_remaining_branches, ctrl_inits, parent_elem);
    };
    var branch = of_branch[0];
    var node_factory = branch.$qix.node_ctrl_def.factory;
    var instance_node = node_factory(branch.$qix.master_node, ctrl_inits);
    if (instance_node) {
      insert_child(instance_node, parent_elem, where, ref_elem);
      if (instance_node.nodeType === Node.ELEMENT_NODE) {
        // var attr_ctrls = branch.$qix.attr_ctrl_defs.map(function (attr_ctrl_def) {
        //   return attr_ctrl_def.factory;
        // });
        // cycle_over_attr_ctrls(attr_ctrls, instance_node, ctrl_inits);
        cycle_over_attr_ctrls(branch.$qix.attr_ctrl_defs, instance_node, ctrl_inits);
      }
      spawn_branch_content(branch, ctrl_inits, instance_node);
    }
    continue_branch_spawn();
  }

  return {}; // return control
}
/*
function spawn_branch_content(branch, ctrl_inits, parent_elem, where, ref_elem) {
  var node_factory = get_factory(branch.$qix.node_ctrl_def, branch.$qix.require);
  var instance_node = node_factory(branch.$qix.master_node, ctrl_inits);
  if (instance_node) {
    insert_child(instance_node, parent_elem, where, ref_elem);
    if (instance_node.nodeType === Node.ELEMENT_NODE) {
      var attr_ctrls = branch.$qix.attr_ctrl_defs.map(function (attr_ctrl_def) {
        return get_factory(attr_ctrl_def, branch.$qix.require);
      });
      cycle_over_attr_ctrls(attr_ctrls, instance_node, ctrl_inits);
    }
  }

  branch.map(function (sub_branch) { // forse reduce .. per popolare control 
    return spawn_branch_content(sub_branch, ctrl_inits, instance_node);
  });

  return {}; // return control
}*/