define(function() {
  "use strict";
  return function $qix(ctrlctx, resolve, reject, node_done) {
    var tpl_path = ctrlctx.opts().url;
    var _exp = {};
    require(['qix!' + tpl_path], function(tpl) {
      node_done
      .then(function(){	
      	tpl.compileTo(ctrlctx.elem,_exp);
      });
      resolve(_exp);
    });
  };
});