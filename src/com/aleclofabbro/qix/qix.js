define('qix', [
  './compiler',
  './loaders/qix-loader'
], function(cpl, loader) {
  return {
    compile: cpl,
    load: loader.load
  };
});