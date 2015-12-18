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
        var id = _x++;
        // console.log('X' + id, model.get());
        model.set(1);
        model.subscribe(function (val) {
          console.log('X val', val.value())
          elem.innerHTML += val.value();
        });
        elem.innerText = 'controller [x] was here';
        return function () {
          console.log('DEsTROY X', id);
        };
      },
      y: function (elem, model) {
        // model.onValue(function (val) {
        //   console.log('in Y:', val);
        // });
        var id = _y++;
        // console.log('Y' + id, model.get());
        // model.lens('Y').set(1);
        elem.style.color = 'blue';
        elem.title = 'controller [y] bound a click event here';

        var _alert = alert.bind(window, 'controller [y] rules!');
        elem.addEventListener('click', _alert);
        return function () {
          elem.removeEventListener('click', _alert);
          console.log('DEsTROY Y', id);
        };
      },
    };
  });