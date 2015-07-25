module.exports = function(grunt) {
  var debug = true,
    uglified_app = './__tmp/app.js',
    ng_templates_file = 'ng_templates.js',
    src_dir = '../src',
    js_src_dir = src_dir+'/js',
    tpl_src_dir = src_dir+'/tpls',
    dist_dir = '../www/js',
    dev_dist_dir = '../platforms/browser/www/js',
    ignore_files = [
      '!' + src_dir + '/**/__*',
      '!' + src_dir + '/**/__*/**'
    ],
    // .concat(debug ? [] : [
    //   '!' + src_dir + '/**/_*',
    //   '!' + src_dir + '/**/_*/**'
    // ]),
    js_src = [js_src_dir + '/**/*.js'].concat(ignore_files),
    tpl_src = [tpl_src_dir + '/**/*.html'].concat(ignore_files),
    watch_files = [src_dir + '/**/*.*', 'Gruntfile.js'].concat(ignore_files),
    base_tasks = ['clean:app', 'ngtemplates:ubnt-app-tpls', 'uglify:app', 'copy'];

  // console.log(' ** DEBUG **', debug);
  grunt.initConfig({
    copy: {
      dev: {
        files: [{
          expand: true,
          flatten: true,
          src: [uglified_app, uglified_app + '.map'],
          dest: dev_dist_dir
        }]
      },
      dist: {
        files: [{
          expand: true,
          flatten: true,
          src: [uglified_app, uglified_app + '.map'],
          dest: dist_dir
        }]
      }
    },
    watch: {
      dev: {
        files: watch_files,
        tasks: base_tasks,
        options: {
          debounceDelay: 500,
          interval: 100
        }
      }
    },
    clean: {
      app: {
        options: {
          force: true
        },
        src: [
          dist_dir,
          dev_dist_dir
        ]
      }
    },
    concat: {
      app: {
        src: [uglified_app, ng_templates_file],
        dest: uglified_app
      }
    },
    uglify: {
      app: {
        options: {
          sourceMap: debug,
          sourceMapIncludeSources: false, //debug,
          compress: !debug,
          mangle: !debug,
          preserveComments: debug ? 'all' : false
        },
        src: js_src,
        dest: uglified_app
      }
    },
    jshint: {
      options: {
        multistr: true
      },
      all: js_src
        /*,
              one: one_file*/
    },
    ngtemplates: {
      "ubnt-app-tpls": {
        src: tpl_src,
        dest: js_src_dir + '/tpls/' + ng_templates_file,
        options: {
          lint: true,
          standalone: true,
          prefix: '/tpls',
          collapseWhitespace: true,
          htmlmin: {
            collapseBooleanAttributes: false,
            collapseWhitespace: false,
            removeAttributeQuotes: false,
            removeComments: true, // Only if you don't use comment directives!
            removeEmptyAttributes: false,
            removeRedundantAttributes: false,
            removeScriptTypeAttributes: false,
            removeStyleLinkTypeAttributes: false
          },
          url: function(u) {
            var stripped = u.substring(u.lastIndexOf('/') + 1);
            return stripped;
          }
        }
      }
    }
  });
  // console.log(require('util').inspect(grunt.config(),{colors:1,depth:5}));
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');




  grunt.registerTask('default', ['watch']);

};