define('qix-flux', function (require, exports, module) {
  //ctrls
  exports.when = when;
  when.$qix = {
    spawn: true
  };

  function when(elem, binders, link) {
    var _placeholder = document.createComment('qix-flux#when(' + link.name + ') placeholder'),
      _controllers = true,
      _curr_elem = elem,
      _parent = elem.parentElement;
    _parent.insertBefore(_placeholder, _curr_elem);
    _when(false);

    function _when(bool, _binders) {
      if (neg_bool(bool) === neg_bool(_controllers))
        return _controllers;
      if (arguments.length === 1)
        _binders = binders;
      if (bool) {
        _controllers = link.spawn(_binders, _parent, 'after', _placeholder);
        _curr_elem = _controllers.$root_elems[0];
      } else {
        _curr_elem.remove();
        _curr_elem = null;
        _controllers = null;
        //link.destroy();
      }
      return _controllers;
    }
    return _when;
  }
});