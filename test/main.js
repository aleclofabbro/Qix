  require(['qix!mod/templ'], function (comp) {
    // console.log = function () {};
    model = Bacon.Model({});
    model.onValue(function (val) {
      console.log('in main:', val);
    });
    var target = document.getElementById('app-container');
    console.time(0)
    comp.spawn(model, target, null, function () {
      console.timeEnd(0)
      setTimeout(function () {
        console.time(0)
        comp.spawn(model, target, null, function () {
          console.timeEnd(0)
        });
      }, 1000)
    });
    //model.lens('$$.destroy').set(1);
  });