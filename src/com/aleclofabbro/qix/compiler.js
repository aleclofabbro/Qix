define([
  'rx'
], function(Rx) {
  var _master_elems = new Rx.Subject(),
    _master_elems_obs = _master_elems.asObservable(),
    _master_qix = function(elem) {
      if (elem.$qix)
        throw new Error('qix : elem already mastered');
      var qix = new Rx.Subject();
      _master_elems.onNext(elem);
      Array.prototype.forEach.call(elem.children, _master_qix);

      qix.make = function(ctx) {
        var _new_elem = document.clone(elem);
        qix.onNext(_new_elem);
        Array.prototype.forEach.call(elem.children,
          function(sub_el) {
            var _new_sub_elem = sub_el.$qix.make(ctx);
            _new_elem.appendChild(_new_sub_elem);
          });
        return _new_elem;
      };
      elem.$qix = qix;
      return qix;
    };

  _master_elems_obs.master = _master_qix;
  return _master_elems_obs;
});