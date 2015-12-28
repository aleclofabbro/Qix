define([],
  function () {
    "use strict";
    var _x = 0;
    var _y = 0;
    return {
      x: function (elem, scope) {
        var id = _x++;
        elem.innerText = 'controller [x] was here';
        return function () {
          console.log('DEsTROY X', id);
        };
      },
      y: function (elem, scope) {
        var id = _y++;
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