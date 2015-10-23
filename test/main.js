  require(['qix!mod/templ.html'], function(comp) {
    var target = document.getElementById('app-container');
    ctrls = comp.spawn_into({
      b_lm: '*blm',
      a_lm: '*a',
      b: '*b'
    }, target);
    ctrls2 = comp.spawn_into({
      b_lm: '*****blm',
      a_lm: '*****a',
      b: '****b'
    }, target);
  });