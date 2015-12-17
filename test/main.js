  require(['qix!mod/templ.html'], function (comp) {
    // console.log = function () {}
    var target = document.getElementById('app-container');
    console.time(0)
    ctrls1 = comp.spawn({
      A: '*A',
      B: '*B',
      C: '*C',
      tpl_scope: {
        Q: 'Q',
        X: 'X'
      }
    }, target);

    console.timeEnd(0)

  });