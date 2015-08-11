define(['rx', 'ramda'],
  function(Rx, R) {
    window.R = R;
    var lens = function(path) {
      var root = this;
      var _set = R.assocPath(path);
      var _get = R.path(path);
      var _observers = [];
      var _root_ver = Rx.Observer.create(function(v) {
        lens_subj.value = v;
        for (var i = 0, os = _observers, len = os.length; i < len; i++) {
          os[i].onNext(v);
        }
      });

      var ver = Rx.Observer.create(function(v) {
        var _root_val = _set(v, root.value || {});
        root.onNext(_root_val);
      });
      var ble = Rx.Observable.create(function(obs) {
        _observers.push(obs);
        obs.onNext(lens_subj.value);
        return function() {
          _observers.splice(_observers.indexOf(obs), 1);
        };
      });

      var lens_subj = Rx.Subject.create(ver, ble);

      lens_subj.path = path;

      lens_subj.lens = function(_sub_path) {
        return root.lens(path.concat(_sub_path));
      };
      root
        .map(function() {
          return _get(root.value);
        })
        .subscribe(_root_ver);
      return lens_subj;
    };


    return function(v) {
      var _root = new Rx.BehaviorSubject(v);
      _root.lens = lens.bind(_root);
      return _root;
    };
  });