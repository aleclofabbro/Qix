  require(['qix!templ.html'], function(comp) {
    var target = document.body;
    ctrls = comp.spawn_into({

    }, target);
    // ctrls.a(true, {})
  });