define('qix-seed', function () {
  function make_master_element_from_text(text) {
    var master_el = document.createElement('div');
    // master_el.setAttribute('qix-tpl');
    master_el.innerHTML = text;
    return master_el;
  }

  // function path_relative_to(baseurl, path) {
  //   if (path.startsWith('.') && !path.startsWith('/'))
  //     return baseurl + path;
  //   else
  //     return path;
  // }
  var req_ctx = 0;
  var glob_conf_skip = ['deps'];

  function load(name, localrequire, onload /*, config*/ ) {
    // var path_resolver = path_relative_to.bind(null, baseurl);
    var resolved_name = localrequire.toUrl(name);
    var baseurl = resolved_name.substring(0, resolved_name.lastIndexOf('/') + 1);
    localrequire(['qix-text!' + name], function (text) {
      var master = make_master_element_from_text(text);
      // var seed_require = function (deps, cb, eb) {
      //   if (Array.prototype.isPrototypeOf(deps)) {
      //     deps = deps.map(path_resolver);
      //     return require(deps, cb, eb);
      //   } else {
      //     var _local_path = path_resolver(deps);
      //     return require(_local_path);
      //   }
      // };
      var glob_conf = require.s.contexts._.config;
      var req_config = Object.keys(glob_conf)
        .reduce(function (cnf, k) {
          if (glob_conf_skip.indexOf(k) === -1)
            cnf[k] = glob_conf[k];
          return cnf;
        }, {});
      req_config.baseUrl = baseurl;
      req_config.context = req_ctx++;
      var seed_require = require.config(req_config);
      make_template_seed(master, seed_require, onload);
      // onload(component_seed);
    });
  }
  return {
    load: load
  };
});