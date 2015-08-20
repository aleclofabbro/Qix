define(['rx', 'ramda'],
  function(Rx, R) {
    window.R = R;
    var lens = function(path) {
      var root = this;
      var _lens_setter = R.assocPath(path);
      var _lens_getter = R.path(path);
      var _lens_observers = [];
      var _root_observer = Rx.Observer.create(function(v) {
        lens_subj.value = v;
        for (var i = 0, os = _lens_observers, len = os.length; i < len; i++) {
          os[i].onNext(v);
        }
      });

      var ver = Rx.Observer.create(function(v) {
        var _root_val = _lens_setter(v, root.value || {});
        root.onNext(_root_val);
      }, function(err) {}, function() {});
      var ble = Rx.Observable.create(function(obs) {
        _lens_observers.push(obs);
        obs.onNext(lens_subj.value);
        return function() {
          _lens_observers.splice(_lens_observers.indexOf(obs), 1);
        };
      });

      var lens_subj = Rx.Subject.create(ver, ble);

      lens_subj.path = path;

      lens_subj.lens = function(_sub_path) {
        return root.lens(path.concat(_sub_path));
      };
      root
        .map(function() {
          return _lens_getter(root.value);
        })
        .subscribe(_root_observer);
      return lens_subj;
    };


    return function(v) {
      var _root = new Rx.BehaviorSubject(v);
      _root.lens = lens.bind(_root);
      return _root;
    };
  });