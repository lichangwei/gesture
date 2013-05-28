module.exports = function(grunt) {

  var source = [
      './src/gesture.js',
      // './src/tap.js',
      // './src/doubletap.js',
      './src/tap-doubletap.js',
      // './src/extend/tap-doubletap.js',
      './src/taphold.js',
      //'./src/flick.js ',
      './src/swipe.js',
      // './src/zoom.js ',
      // './src/zoomin-zoomout.js ',
      // './src/rotate.js ',
      // './src/drag.js ',
      './src/dragdrop-delegatable.js',
      // './src/dragdrop-html5.js ',
      // './src/scroll.js',

      //'./src/plugin/touch-alink.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: source,
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> @version <%= pkg.version%> <%= grunt.template.today("yyyy-mm-dd") %> */\n' + 
          '/* @author: <%= pkg.author.name%> <<%= pkg.author.email%>> */\n' +
          '/* @see <%= pkg.repository.url%> */\n',
        sourceMap: 'dist/<%= pkg.name %>.min.js.map'
      },
      build: {
        src: source,
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      files: ['test/qunit.html']
    },
    jshint: {
      files: source,
      options: {
        globals: {
          jQuery: true,
          console: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('test', ['qunit']);

};