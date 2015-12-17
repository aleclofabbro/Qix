define([],
  function () {
    "use strict";
    return function (elem, model, mainmodel, strip) {
      var seeder = strip();
      setTimeout(function () {
        seeder.spawn(mainmodel, seeder.placeholder, 'before');
      }, 2000);
      return function () {
        console.log('IF UNBIND');
      };
    };
  });