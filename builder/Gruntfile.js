var path = require('path');
module.exports = function(grunt) {

  var _target_opt = grunt.option('target');
  var _entry_opt = grunt.option('entry');
  if (!_target_opt)
    throw ('no_target_opt');
  if (!_entry_opt)
    throw ('no_entry_opt');

  // var target = path.resolve('../', _target_opt);
  // var entry = path.resolve('../src/', _entry_opt);
  var target = '../' + _target_opt;
  var entry = '../src/' + _entry_opt;
  console.log('target', target);
  console.log('entry', entry);
  var codebase = ['../src/**/*.js'];
  var watch_tasks = ['requirejs:compile'];

  grunt.initConfig({
    watch: {
      dev: {
        files: codebase,
        tasks: watch_tasks,
        options: {
          debounceDelay: 500,
          interval: 100
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: "../src/",
          // mainConfigFile: ,
          modules: [entry],
          // name: "path/to/almond", // assumes a production build using almond
          out: target,
          paths: {
            "tpl": "com/aleclofabbro/reflux/requirejs/plugins/template",
            "cpl": "com/aleclofabbro/reflux/requirejs/plugins/compile-template",
            // EXTERNALS
            "stomp": "lib/stomp/stomp.min",
            "ol3": "lib/ol3/ol.min",

            "rx": "lib/rxjs/dist/rx.min",
            // "rx.all": "lib/rxjs/dist/rx.all.min",
            "rx.async": "lib/rxjs/dist/rx.async.min",
            "rx.time": "lib/rxjs/dist/rx.time.min",
            "rx.backpressure": "lib/rxjs/dist/rx.backpressure.min",
            "rx.binding": "lib/rxjs/dist/rx.binding.min",
            "rx.aggregates": "lib/rxjs/dist/rx.aggregates.min",
            "rx.joinpatterns": "lib/rxjs/dist/rx.joinpatterns.min",
            "rx.coincidence": "lib/rxjs/dist/rx.coincidence.min",
            "rx.experimental": "lib/rxjs/dist/rx.experimental.min",
            "rx.dom": "lib/rx-dom/dist/rx.dom",

            "ramda": "lib/ramda/dist/ramda.min"
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');


  grunt.registerTask('default', ['watch:dev']);

};