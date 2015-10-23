  require(['qix!mod/templ.html', 'qix', 'require'], function(comp, qix, localrequire) {

    //spawn 2 components in target
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


    //spawn a custom components in other target
    var comp_str = '<div qix:a-lm="./mod/core/test-ctrl#y" a-lm:opt-a="zzzzz299">' +
      '<span qix:b="mod/core/test-ctrl#x" b:qq="zzzzpipi" qix:c="./mod/core/test-ctrl#x" c:qq="zzzzzc-pipi">' +
      '</span>' +
      '</div>';
    qix.make({
      text: comp_str,
      require: localrequire
    }, function(comp) {
      var custom_target = document.getElementById('custom');
      ctrl_cust = comp.spawn_into({
        xxc: 'xxx*****c',
        xxa_lm: 'xxx*****a',
        xxb: 'xxxx****b'
      }, custom_target)
    });
  });