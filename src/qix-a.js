function invoke(fn) {
  return fn();
}

function flatten(a) {
  return a.reduce(function (acc, arr_el) {
    return acc.concat(arr_el);
  }, []);
}

function prop(prp, obj) {
  return obj ? obj[prp] : void(0);
}

function is_array_like(obj) { // TODO: improve ?
  return ('length' in obj) && ('number' === typeof obj.length);
}

function is_undefined(o) {
  return o === void(0);
}

function as_array(obj, strict) {
  if (!strict && is_undefined(obj))
    return [];
  return is_array_like(obj) ? Array.prototype.slice.call(obj) : [obj];
}

function query(elem, _query) {
  return elem.querySelector(_query);
}

function queryAll(elem, _query) {
  return as_array(elem.querySelectorAll(_query));
}

function select(_query, elem) {
  return query(elem, _query);
}

function selectAll(_query, elem) {
  return queryAll(elem, _query);
}

function attrOf(elem, attr_name) {
  return attr(attr_name, elem);
}

function attr(attr_name, elem) {
  return elem.getAttribute(attr_name);
}

function has_attr(elem, attr_name) {
  return elem.hasAttribute(attr_name);
}

function insert_child_nodes(holder_node, into_elem, where, ref_elem) {
  return insert_child_nodes_map(into_elem, where, ref_elem, holder_node);
}

function insert_child_nodes_map(into_elem, where, ref_elem, holder_node) {
  return as_array(holder_node.childNodes)
    .map(insert_child_map.bind(null, into_elem, where, ref_elem));
}

function replace_node(target, by) {
  insert_child(by, target.parentNode, 'before', target);
  target.remove();
  return by;
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
  return child_node;
}

function insert_child(child_node, into_elem, where, ref_elem) {
  return insert_child_map(into_elem, where, ref_elem, child_node);
}

function remove(els) {
  return as_array(els)
    .map(function (el) {
      el.remove();
      return el;
    });
}
/*
function as_bool(v) {
  return !!v;
}

function neg_bool(v) {
  return !v;
}

function noop() {}

function compose(fn1, fn2) {
  return function (x) {
    return fn1(fn2(x));
  }
}

function get_attribute(name, elem) {
  return elem.getAttribute(name);
}

function id(v) {
  return v;
}

function safe_string(str) {
  return (str === null || str === void(0)) ? '' : String(str);
}

function prop_setter(prop, obj, val) {
  return (obj[prop] = val);
}


function safe_string_prop_setter(prop, obj, str) {
  return (obj[prop] = safe_string(str));
}


*/