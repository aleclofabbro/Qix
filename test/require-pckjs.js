require.config({
  // baseUrl: '/',
  packages: [{
    name: 'qix',
    location: '/src',
    main: 'qix'
  }, {
    name: 'rx',
    location: '/node_modules/rx/dist',
    main: 'rx'
  }],
  paths: {
    "ramda": "/node_modules/ramda/dist/ramda",
    "rx-dom": "/node_modules/rx-dom/dist/rx.dom.min"
  }
});