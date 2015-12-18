define('qix-map',
  function () {
    return function (elem, model, mainmodel, strip) {
      var seeder = strip();
      var currents = [];
      var _switch = false;
      var unsub = model.onValue(function (arr) {
        if (_switch)
          return;
        _switch = true;
        arr = as_array(arr);
        var delta = arr.length - currents.length;
        if (delta < 0)
          destroy_subs(delta);
        else if (delta > 0)
          add_subs(delta);
        _switch = false;
      });

      function add_subs(delta) {
        var to_spawn = [];
        var _l = currents.length;
        for (var i = _l; i < (delta + _l); i++) {
          var sub_model = model.lens('' + i);
          currents.push(sub_model);
          to_spawn.push(sub_model);
        }
        // setTimeout(function () {
        to_spawn.forEach(function (sub_model) {
          seeder.spawn(sub_model, seeder.placeholder, 'before');
        });
        // });
      }

      function destroy_subs(delta) {
        var to_destroy = currents.splice(delta);
        // setTimeout(function () {
        console.log('MAP DESTROY ', to_destroy.length);
        to_destroy.forEach(function (sub_model) {
          sub_model.$qix.destroy();
        });
        // });
      }
      // mainmodel.$qix.on_destroy(destroy);

      function destroy() {
        unsub();
        destroy_subs(-currents.length);
        model.set(void(0));
        console.log('MAP DESTROY', currents, model.get());
      }
      return destroy;
    };
  });