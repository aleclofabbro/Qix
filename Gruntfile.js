module.exports = function(grunt) {
  // var jshint_files = ['./src/**/qix-*.js'];
  var src_files = ['./src/**/*.js'];
  var dist_dir = './dist/';
  var dist = dist_dir + 'qix.js';
  var dist_min = dist_dir + 'qix.min.js';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        sourceMap: false,
        // sourceMapIncludeSources: false, //debug,
        compress: true,
        mangle: true,
        preserveComments: false
      },
      qix: {
        src: dist,
        dest: dist_min
      }
    },
    jshint: {
      options: {
        browser: true,
        strict: true,
        undef: true,
        unused: true,
        globals: {
          require: true,
          ActiveXObject: true,
          define: true,
          console: true,
          debugger: true
        }
      },
      sources: {
        files: {
          src: src_files.concat(['!./src/0-head.js', '!./src/z-tail.js'])
        },
        options: {
          unused: false,
          undef: false,
          strict: false
        }
      },
      dist: dist
    },
    concat: {
      qix: {
        src: src_files,
        dest: dist,
        options: {
          sourceMapStyle: 'link',
          sourceMap: true
        }
      }
    },
    clean: {
      dist: dist_dir
    },
    watch: {
      files: src_files,
      tasks: ['jshint:sources', 'clean:dist', 'concat:qix', 'uglify:qix', 'jshint:dist'],
      options: {
        spawn: false,
        debounceDelay: 500
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Default task(s).
  grunt.registerTask('default', ['watch']);

};