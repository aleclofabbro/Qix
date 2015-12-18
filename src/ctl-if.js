define('qix-if',
  function () {
    return function (elem, model, mainmodel, strip) {
      var seeder = strip();
      var _current = null;
      var _switch = false;
      var unsub = model.onValue(function (val) {
        if (_switch)
          return;
        _switch = true;
        if (!_current && val) {
          _current = model.lens('');
          seeder.spawn(_current, seeder.placeholder, 'before');
        } else if (_current && !val) {
          destroy_sub();
          _current = null;
        }
        _switch = false;
      });

      // mainmodel.$qix.on_destroy(destroy);

      function destroy_sub() {
        if (_current && _current.$qix) {
          console.log('IF DESTROY SUB');
          _current.$qix.destroy();
        }
        _current = null;

      }

      function destroy() {
        console.log('IF DESTROY');
        destroy_sub();
        unsub();
      }
      return destroy;
    };
  });