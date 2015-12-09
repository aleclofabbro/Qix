define('qix-seed', function() {
  function make_master_element_from_text(text) {
    var master_el = document.createElement('div');
    // master_el.setAttribute('qix-tpl');
    master_el.innerHTML = text;
    return master_el;
  }

  function path_relative_to(baseurl, path) {
    if (path.startsWith('.'))
      return baseurl + path;
    else
      return path;
  }

  function load(name, localrequire, onload, config) {
    var baseurl = name.substring(0, name.lastIndexOf('/') + 1);
    var path_resolver = path_relative_to.bind(null, baseurl);
    localrequire(['qix-text!' + name], function(text) {
      var master = make_master_element_from_text(text);
      var seed_require = function(deps, cb, eb) {
        if (Array.prototype.isPrototypeOf(deps)) {
          deps = deps.map(path_resolver);
          return require(deps, cb, eb);
        } else {
          var _local_path = path_resolver(deps);
          return require(_local_path);
        }
      };
      make_template_seed(master, seed_require, onload);
      // onload(component_seed);
    });
  }
  return {
    load: load
  };
});