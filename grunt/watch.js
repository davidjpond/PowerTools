// Monitor files for changes and run tasks against changed files
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    scripts: {
      files: [prefs.options.sourcePath + 'web_root/**/*.js', prefs.options.sourcePath + 'web_root/**/*.html'],
      tasks: ['notify:watch', 'newer:jshint:all', 'newer:jscs', 'newer:inlinelint'],
      options: {
        spawn: false
      }
    },
    css: {
      files: [prefs.options.sourcePath + 'web_root/**/*.css'],
      tasks: ['newer:csslint'],
      options: {
        spawn: false
      }
    },
    html: {
      files: [prefs.options.sourcePath + 'web_root/**/*.html', prefs.options.sourcePath + 'web_root/**/*.txt'],
      tasks: ['newer:inlinelint', 'newer:htmlhint'],
      options: {
        spawn: false
      }
    },
    xml: {
      files: [prefs.options.sourcePath + '**/*.xml'],
      tasks: ['newer:xml_validator'],
      options: {
        spawn: false
      }
    }
  };
};
