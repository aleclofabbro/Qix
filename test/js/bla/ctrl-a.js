define(['rx'],
  function(Rx) {
    "use strict";
    return {
      control: function(el, def) {
        var flux = Rx.Observable.interval(1000)
          .map(function(v) {
            return 'ctlaa:' + v;
          });
        return {
          flux1: flux
        };
      }
    };
  });