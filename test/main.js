  require(['qix!mod/templ.html', 'qix', 'require'], function(comp, qix, localrequire) {
    function test_ctrls(name, ctrls) {
      console.log('-----\nController Test:' + name);
      Object.keys(ctrls)
        .filter(function(k) {
          return k[0] !== '$';
        })
        .forEach(function(k) {
          console.log(k, ctrls[k]());
        });
      console.log('-------\n');

    };
    //spawn 2 components in target
    var target = document.getElementById('app-container');
    ctrls1 = comp.spawn_into({
      b_lm: '*blm',
      a_lm: '*a',
      b: '*b'
    }, target);
    test_ctrls('ctrls1', ctrls1);
    ctrls2 = comp.spawn_into({
      b_lm: '*****blm',
      a_lm: '*****a',
      b: '****b'
    }, target);
    test_ctrls('ctrls2', ctrls2);


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
      test_ctrls('ctrl_cust', ctrl_cust);
    });

    //control an element
    var control_target = document.getElementById('control-this');
    var ctl_factory = require('mod/core/test-ctrl').y;
    var controlled = qix.control(ctl_factory, 'name', control_target, '*-*-*-* CONTROL-THIS');
    console.log('-- CONTROL-THIS', controlled.name());

    //overload an element
    var overload_target = document.getElementById('overload-this');
    var over_factory = require('mod/core/test-ctrl').y;
    var overloaded = qix.control(over_factory, 'b_lm', overload_target, '!!!!!! OVERLOAD-THIS');
    console.log('-- OVERLOAD-THIS', overloaded.b_lm());
    console.log('*** overloaded.$b_lm.elem === ctrls1.$b_lm.elem', overloaded.$b_lm.elem === ctrls1.$b_lm.elem);

  });