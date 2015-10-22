define([],
  function() {
    "use strict";
    return {
      x: function $qix(elem, binders, link) {
        return {
          x: {
            elem: elem,
            binders: binders,
            link: link
          }
        };
      },
      y: function $qix(elem, binders, link) {
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