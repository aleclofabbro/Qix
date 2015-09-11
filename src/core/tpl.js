define(function() {
  "use strict";
  return {
    control: function(exports, el, opts, _ctx, _binder_def) {
      var tpl_path = _binder_def.attr.value;
      var _exp = {};
      require(['qix!' + tpl_path], function(tpl) {
        tpl.compileTo(el, _exp, function() {
          exports(_exp);
        });
      });
      return function() {
        console.log('dind !!');
      };

    }
  };
});