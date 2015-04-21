// Remove all console.logs from .html and .js files
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    dist: {
      expand: true,
      cwd: prefs.options.tempPath + 'web_root/',
      src: ['**/*.html', '**/*.js'],
      dest: prefs.options.tempPath + 'web_root/'
    }
  };
};
