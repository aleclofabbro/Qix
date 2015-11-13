function insert_child(child, into_elem, where, ref_elem) {
  where = where || 'append';
  //after / before / append / prepend ?
  if (where === 'append' || (where === 'after' && !ref_elem.nextSibling)) { //case 'after' but no nextSibling === case 'append'
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

function get_factory(ctrl_def, comp_require) {
  var module_name = ctrl_def.module_name;
  var module_prop = ctrl_def.module_prop;
  var _module = comp_require(module_name);
  var factory = module_prop ? _module[module_prop] : _module;
  return factory;
}

function spawn_branch(branch, ctrl_inits, into_elem, where, ref_elem) {
  var attr_ctrls = branch.$qix.attr_ctrl_defs.map(function(attr_ctrl_def) {
    return get_factory(attr_ctrl_def, branch.$qix.require);
  });

  // cicla attr_ctrls e se c'è un capture (solo il primo, credo ..)
  //   -> interrompi il nodo corrente e passsare al capture il in modo di poter "proseguire" lo spawn..
  //      proseguire poi col nodo successivo (sibling)
  // else
  //   -> prosegui attributi e nodo .. 

  var node_factory = get_factory(branch.$qix.node_ctrl_def, branch.$qix.require);
  var child = node_factory(branch.$qix.node, ctrl_inits);
  insert_child(child, into_elem, where, ref_elem);
  branch.map(function(sub_branch) { // forse reduce .. per popolare control 
    return spawn_branch(sub_branch, ctrl_inits, child);
  });

  return {}; // return control
  //?? control multilivello ?
  //in caso, come dare i nomi ai livelli?
}