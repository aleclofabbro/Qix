  define('text', function () {
    function load(name, localrequire, onload, config) {
      var url = localrequire.toUrl(name);
      get_remote_text(url, onload);
    }
    return {
      load: load
    };
  });