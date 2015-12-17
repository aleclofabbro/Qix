define('qix-seed', function () {
  function make_master_element_from_text(text) {
    var master_el = document.createElement('div');
    master_el.innerHTML = text;
    return master_el;
  }

  function load(name, localrequire, onload /*, config*/ ) {
    var seed_require = require.s.contexts._.makeRequire({
      name: name
    }, {
      enableBuildCallback: true
    });
    localrequire(['qix-text!' + name + '.html' /*, name*/ ], function (text /*, def*/ ) {
      var master = make_master_element_from_text(text);
      var seed = make_template_seed(master, seed_require);
      onload(seed);
    });
  }
  return {
    load: load
  };
});