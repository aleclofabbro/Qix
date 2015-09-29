define(function() {
  "use strict";
  return function(resolve, reject, opts, el, all_done, _ctx, _binder_def) {
    var tpl_path = _binder_def.attr.value;
    var _exp = {};
    require(['qix!' + tpl_path], function(tpl) {
      tpl.compileTo(el, _exp, function() {
        resolve(_exp);
      });
    });

    all_done
      .then(function() {
        console.log('dind !!');
      });
  };
});