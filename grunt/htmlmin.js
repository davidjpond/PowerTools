// Clean html and minify. Relocate to dist directory
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    dist: {
      options: {
        removeComments: true,
        collapseWhitespace: false,
        removeEmptyAttributes: true,
        useShortDoctype: true,
        collapseBooleanAttributes: true,
        removeCommentsFromCDATA: true,
        lint: false
      },
      files: [
        {
          expand: true,
          cwd: prefs.options.tempPath + 'web_root/',
          src: ['**/*.html'],
          dest: prefs.options.tempPath + 'web_root/'
        }
      ]
    }
  };
};
