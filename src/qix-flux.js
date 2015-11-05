(function() {
  'use strict';
  define('qix-flux', function(require, exports, module) {
    //ctrls
    exports.when = when;
    when.$qix = {
      spawn: true
    };

    function when(elem, binders, link) {
      var _placeholder = document.createComment('qix-flux#when placeholder'),
        _controllers = null,
        _curr_elem = elem,
        _parent = elem.parentElement;
      _when(false);

      function _when(bool, inits) {
        // if (!bool === !_controllers)
        //   return _controllers;
        if (bool) {
          _controllers = link.spawn(inits);
          _controllers.$root_elems
            .forEach(function(_elem) {
              _parent.insertBefore(_elem, _placeholder);
            });
          _controllers.bind_all();
          _curr_elem = _controllers.$root_elems[0];
          _placeholder.remove();
        } else {
          _parent.insertBefore(_placeholder, _curr_elem);
          _curr_elem.remove();
          _controllers = null;
          //link.destroy();
        }
        return _controllers;
      };
      return _when;
    }
  });

})();