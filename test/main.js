  require(['qix!mod/templ'], function (comp) {
    console.log = function () {};
    // window.go = function () {

    window.model = Bacon.Model({});
    model.onValue(function (val) {
      // console.log('in main:', val);
    });
    var target = document.getElementById('app-container');
    console.time(0)
    comp.spawn(model, target);
    console.timeEnd(0)
    setTimeout(function () {
      // console.time(1)
      // comp.spawn(model, target);
      // console.timeEnd(1);
    }, 1000);
    console.time(1);
    model.set({
      tm: Array.apply(null, Array(1))
    });
    console.timeEnd(1);
    // model.set({
    //   tm: [1]
    // });
    //model.lens('$$.destroy').set(1);
    // }
  });