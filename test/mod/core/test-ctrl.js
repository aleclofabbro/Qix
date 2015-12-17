define([],
  function () {
    "use strict";
    var _x = 0;
    var _y = 0;
    return {
      x: function (elem, model) {
        // model.onValue(function (val) {
        //   console.log('in X:', val);
        // });
        // model.lens('z.q').set(111);
        elem.innerText = 'controller [x] was here';
      },
      y: function (elem, model) {
        // model.lens('r.t').set(222);
        // model.onValue(function (val) {
        //   console.log('in Y:', val);
        // });
        elem.style.color = 'blue';
        elem.title = 'controller [y] bound a click event here';

        var _alert = alert.bind(window, 'controller [y] rules!');
        elem.addEventListener('click', _alert);
      },
    };
  });