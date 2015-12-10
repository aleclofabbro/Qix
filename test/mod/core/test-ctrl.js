define([],
  function () {
    "use strict";
    var _x = 0;
    var _y = 0;
    return {
      x: function (elem) {
        elem.addEventListener('unbind', function _unbind(e) {
          console.log('UNBIND X', elem);
          elem.removeEventListener('unbind', _unbind);
        });
        elem.innerText = 'controller [x] was here';
        console.log('CONTROLLER X..', elem);
        return function () {
          console.log('X - this', arguments);
          return [arguments, _x++];
        };
      },
      y: function (elem) {
        elem.addEventListener('unbind', function _unbind(e) {
          console.log('UNBIND Y', elem);
          elem.removeEventListener('unbind', _unbind);
          elem.removeEventListener('click', _alert);
        });
        elem.style.color = 'blue';
        // elem.style.textDecoration = 'underline';
        elem.title = 'controller [y] bound a click event here';

        var _alert = alert.bind(window, 'controller [y] rules!');
        elem.addEventListener('click', _alert);
        console.log('CONTROLLER Y..', elem);
        return {
          yfn: function () {
            console.log('Y - yfn', arguments);
            return [arguments, _y++];
          }
        };
      },
    };
  });