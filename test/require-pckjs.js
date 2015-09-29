require.config({
  // baseUrl: '/',
  packages: [{
    name: 'qix',
    location: '/src',
    main: 'qix'
  }],
  paths: {
    "bluebird": "/lib/bluebird/js/browser/bluebird.min"
  }
});