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