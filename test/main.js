  require(['qix!mod/templ'], function (comp) {
    console.log = function () {};
    // window.go = function () {

    var target = document.getElementById('app-container');
    console.time(0)
    comp.spawn({}, target);
    console.timeEnd(0)
    setTimeout(function () {
      // console.time(1)
      // comp.spawn({}, target);
      // console.timeEnd(1);
    }, 1000);
    console.time(1);
  });