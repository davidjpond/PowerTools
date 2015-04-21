// Make sure code styles are up to par and there are no obvious mistakes in inline script. Uses jshint configuration.
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    html: [prefs.options.sourcePath + 'web_root/**/*.html', prefs.options.sourcePath + 'web_root/**/*.txt']
  };
};
