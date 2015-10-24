define([],
  function() {
    "use strict";
    return {
      x: function(elem, binders, link) {
        elem.innerText = 'controller [x] was here';
        console.log('CONTROLLER X..', binders);
        return function() {
          return link.get_attrs();
        };
      },
      y: function(elem, binders, link) {
        elem.style.color = 'blue';
        // elem.style.textDecoration = 'underline';
        elem.title = 'controller [y] bound a click event here';
        elem.addEventListener('click', alert.bind(window, 'controller [y] rules!'));
        console.log('CONTROLLER Y..', binders);
        return function() {
          return link.get_attrs();
        };
      },
    };
  });