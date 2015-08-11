define(['rx'],
  function(Rx) {

    var JsonSubject = function(parent, path) {
      var _observers = [];

      var ver = Rx.Observer.create(function(v) {
        if (this.value === v)
          return;
        if (parent && this.value !== v) {
          this.value = v;
          parent.set(v, path);
        } else {
          for (var i = 0, os = _observers, len = os.length; i < len; i++) {
            os[i].onNext(v);
          }
        }
      });
      var ble = Rx.Observable.create(function(obs) {
        _observers.push(obs);
        return function() {
          _observers.splice(_observers.inndexOf(obs), 1);
        };
      });
      var jssubj = Rx.Subject.create(ver, ble);
      jssubj.set = function(v, sub_path) {
        if (parent)
          parent.set(v, (path || []).concat(sub_path));
        else {
          var _val = this.value = (this.value || {});
          for (var i = 0; i < sub_path.length - 1; i++) {
            _val[sub_path[i]] = _val = (_val[sub_path[i]] || {});
          }
          _val[sub_path[sub_path.length - 1]] = v;
          ver.onNext(this.value);
        }
      };
      // jssub.getPath = function() {
      //   if (this.parent)
      //     return this.parent.getPath().concat(path);
      //   else return [];
      // };
      jssubj.sub = function(sub_path) {
        var ssub = new JsonSubject(this, sub_path);
        this
          .map(function(v) {
            var _val = v;
            for (var i = 0; i < sub_path.length; i++) {
              if (_val === null || _val === undefined)
                break;
              _val = _val[sub_path[i]];
            }
            return _val;
          })
          .subscribe(ssub);
        return ssub;
      };
      return jssubj;
    };


    return JsonSubject;
  });