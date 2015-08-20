define([], function() {
  return function(elem) {
    var s_value = new Rx.Subject();
    var r_value = Rx.Observer.create(
      function(val) {
        elem.innerHTML = val;
        s_value.onNext(val);
      },
      s_value.onError,
      s_value.onCompleted);
    return {
      r_value: r_value,
      l_value: s_value.asObservable()
    };
  };
});