require.config({
  baseUrl: '/',
  packages: [{
    name: 'qix',
    location: '/src/qix', // default 'packagename'
    main: 'qix' // default 'main' 
  }],
  paths: {
    // "qix": "com/aleclofabbro/qix/qix",
    // EXTERNALS

    "rx": "/node_modules/rx/dist/rx",
    //      "rx.all": "/node_modules/rx/dist/rx.all",
    "rx.async": "/node_modules/rx/dist/rx.async",
    "rx.time": "/node_modules/rx/dist/rx.time",
    "rx.backpressure": "/node_modules/rx/dist/rx.backpressure",
    "rx.binding": "/node_modules/rx/dist/rx.binding",
    "rx.aggregates": "/node_modules/rx/dist/rx.aggregates",
    "rx.joinpatterns": "/node_modules/rx/dist/rx.joinpatterns",
    "rx.coincidence": "/node_modules/rx/dist/rx.coincidence",
    "rx.experimental": "/node_modules/rx/dist/rx.experimental",
    "rx.dom": "/node_modules/rx-dom/dist/rx.dom",

    "ramda": "/node_modules/ramda/dist/ramda"
  }
});