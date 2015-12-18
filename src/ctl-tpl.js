define('qix-tpl',
  function () {
    return function (elem, model, mainmodel, strip, ctrl_def) {
      var tpl_path = attr('qix-tpl', elem);
      var stripper = strip();
      if (!ctrl_def._my_seed)
        stripper.seed.require(['qix!' + tpl_path], function (seed) {
          ctrl_def._my_seed = seed;
          seed.spawn(model, stripper.placeholder, 'before');
        });
      else
        ctrl_def._my_seed.spawn(model, stripper.placeholder, 'before');

      // mainmodel.$qix.on_destroy(destroy);

      function destroy() {
        console.log('TPL DESTROY');
        if (model.$qix)
          model.$qix.destroy();
      }
      return destroy;
    };
  });