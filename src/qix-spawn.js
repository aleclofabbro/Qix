var qix_comps = {
  if: function (comp, opts, placeholder) {
    // console.log('if', arguments);
    var b;
    var int_id = setInterval(function () {
      if (b) {
        remove(b);
        b = null;
      } else {
        b = comp.spawn({}, placeholder.parentNode, 'before', placeholder);
      }
    }, 1000);
    // on destroy -> clearInterval(int_id);
  },
  map: function (comp, opts, placeholder) {
    // console.log('map', arguments);
    // comp.spawn({}, document.body);
  },
  expose: function (comp, opts, placeholder) {
      // console.log('expose', arguments);
      // comp.spawn({}, document.body);
    } //to context
};

function spawn_component(comp, options, target, where, ref_elem) {
  var master_clone = comp.master.cloneNode(true);
  var _comp_elem;
  while ((_comp_elem = get_one_qix_component_element(master_clone)) !== null) {
    var _ctrl_name = _comp_elem.attributes[0].name;
    var ctrl = qix_comps[_ctrl_name];
    var placeholder = document.createComment('qx:' + _ctrl_name);
    replace_node(_comp_elem, placeholder);
    var _sub_comp = seed_to_component({
      require: comp.require,
      master: _comp_elem
    });
    ctrl(_sub_comp, options, placeholder);
  }
  get_qix_controlled_elements(master_clone)
    .map(function (elem) {
      get_qix_attr_ctrl_defs_of(elem)
        .forEach(function (def) {
          var ctrl = get_controller_by_component_definition(comp.require, def);
          ctrl(elem, options);
        });
    });
  return insert_child_nodes(master_clone, target, where, ref_elem);
}