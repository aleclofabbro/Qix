define([],
  function() {
    "use strict";
    return {
      x: function(elem, ctrl_inits, link) {
        elem.innerText = 'controller [x] was here';
        console.log('CONTROLLER X..', ctrl_inits);
        return function() {
          return link.get_attrs();
        };
      },
      y: function(elem, ctrl_inits, link) {
        elem.style.color = 'blue';
        // elem.style.textDecoration = 'underline';
        elem.title = 'controller [y] bound a click event here';
        elem.addEventListener('click', alert.bind(window, 'controller [y] rules!'));
        console.log('CONTROLLER Y..', ctrl_inits);
        return function() {
          return link.get_attrs();
        };
      },
    };
  });