'use strict';

var util = require('util');
function loadConfig(path) {
  var glob = require('glob');
  var object = {};
  var key;

  glob.sync('*', {cwd: path}).forEach(function (option) {
    key = option.replace(/\.js$/, '');
    object[key] = require(path + '/' + option);
  });

  return object;
}


module.exports = function (grunt) {

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,
  };

  grunt.initConfig(config);
  grunt.config.merge(loadConfig('./tasks/publish'));

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

// only watch core scss
  grunt.registerTask('default', ['compass:publishdev','watch']);
  
// uglify and concat publish
  grunt.registerTask('concatpublish', ['uglify:publishprod', "concat:publishjs"]);
  
// core Prod process (CSS+JS)
  grunt.registerTask('prod', ['compass:publishdist', "concatpublish"]);
};