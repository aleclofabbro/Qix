define(function() {
  var controllers = [];
  var temp_el = document.createElement('div');
  return {
    compile: function(root_elem, ctx) {
      controllers.forEach(function(ctl_def) {
        temp_el.appendChild(root_elem);
        var q_elems = temp_el
          .querySelectorAll(ctl_def.selector);
        temp_el.remove(root_elem);
        for (var i = 0; i < q_elems.length; i++) {
          var sub_elem = q_elems.item(i);
          sub_elem.$ctls = sub_elem.$ctls || [];
          var ctl = ctl_def.controller(sub_elem, ctx, root_elem);
          if ('object' === typeof ctl)
            sub_elem.$ctls.push(ctl);
        };
      });
    },
    register: function(selector, controller, pri) {
      controllers.push({
        selector: selector,
        controller: controller,
        pri: arguments.length === 3 ? pri : 100
      });
      controllers
        .sort(function(a, b) {
          return a.pri > b.pri;
        });
    }
  };
});