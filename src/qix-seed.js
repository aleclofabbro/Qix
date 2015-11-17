define('qix-seed', function () {
  function make_master_element_from_text(text) {
    var master_el = document.createElement('div');
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
    // var url = localrequire.toUrl(name);
    // get_remote_text(url, function(text) {
    localrequire(['text!' + name], function (text) {
      var master = make_master_element_from_text(text);
      var component_seed = {
        master: master,
        require: function (deps, cb, eb) {
          if (Array.prototype.isPrototypeOf(deps)) {
            deps = deps.map(path_resolver);
            return require(deps, cb, eb);
          } else {
            var _local_path = path_resolver(deps);
            return require(_local_path);
          }
        }
      };
      onload(component_seed);
    });
  }
  return {
    load: load
  };
});