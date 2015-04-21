// Add vendor prefixed styles for css

module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    ps7: {
      options: {
        browser: [
          'Firefox >= 17', 'ie >= 8', 'last 2 Chrome versions', 'Safari >= 5.1'
        ]
      },
      files: [
        {
          expand: true,
          cwd: prefs.options.tempPath + 'web_root/',
          src: ['**/*.css'],
          dest: prefs.options.tempPath + 'web_root/'
        }
      ]
    },
    ps8: {
      options: {
        browser: [
          'last 2 Firefox versions', 'ie >= 10', 'last 2 Chrome versions', 'Safari >= 6'
        ]
      },
      files: [
        {
          expand: true,
          cwd: prefs.options.tempPath + 'web_root/',
          src: ['**/*.css'],
          dest: prefs.options.tempPath + 'web_root/'
        }
      ]
    }
  };
};
