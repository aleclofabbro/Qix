define([],
  function () {
    "use strict";
    return {
      x: function (elem) {
        elem.innerText = 'controller [x] was here';
        console.log('CONTROLLER X..');
        elem.addEventListener('unbind', function (e) {
          console.log('UNBIND X');
        });
        return function () {
          console.log('X - this', arguments);
        };
      },
      y: function (elem) {
        elem.style.color = 'blue';
        // elem.style.textDecoration = 'underline';
        elem.title = 'controller [y] bound a click event here';
        elem.addEventListener('click', alert.bind(window, 'controller [y] rules!'));
        elem.addEventListener('unbind', function (e) {
          console.log('UNBIND Y');
        });
        console.log('CONTROLLER Y..');
        return {
          yfn: function () {
            console.log('Y - yfn', arguments);
          }
        };
      },
    };
  });