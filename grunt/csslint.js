// Verify CSS is valid
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    options: {
      'overqualified-elements': false,
      'duplicate-properties': true,
      'empty-rules': true,
      ids: false,
      floats: false,
      'box-model': false,
      'font-sizes': false
    },
    src: [
        prefs.options.sourcePath + 'web_root/**/*.css',
        '!**/bootstrap*.css',
        '!' + prefs.options.sourcePath + 'web_root/scripts/pearsoncpt/' + prefs.options.lowerName + '/vendor/**/*.css',
        '!' + prefs.options.sourcePath + 'web_root/admin/tech/PowerTools/js/yui/**/*.*'
    ]
  };
};
