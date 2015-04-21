// Reduce images for optimization. Relocate to dist directory
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    dynamic: {
      options: {
        cache: false
      },
      files: [
        {
          expand: true,
          cwd: prefs.options.tempPath + 'web_root/',
          src: ['**/*.{png,jpg,jpeg,gif}'],
          dest: prefs.options.tempPath + 'web_root/'
        }
      ]
    }
  };
};
