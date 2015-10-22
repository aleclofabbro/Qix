define([],
  function() {
    "use strict";
    return {
      x: function $qix(elem, binders, link) {
        elem.innerText = 'controller [x] was here';
        return {
          x: {
            elem: elem,
            binders: binders,
            link: link
          }
        };
      },
      y: function $qix(elem, binders, link) {
        elem.style.color = 'blue';
        elem.title = 'controller [y] bound a click event here';
        elem.addEventListener('click', alert.bind(window, 'controller [y] rules!'));
        return {
          y: {
            elem: elem,
            binders: binders,
            link: link
          }
        };
      },
    };
  });