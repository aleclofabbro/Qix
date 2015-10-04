define(function() {
  "use strict";
  return function $qix(ctrlctx, resolve, reject) {
    var tpl_path = ctrlctx.args().url;
    var _exp = {};
    require(['qix!' + tpl_path], function(tpl) {
      tpl.appendTo(ctrlctx.elem, _exp);
      resolve(_exp);
    });
  };
});