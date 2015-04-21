// Checks XML for errors
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    dist: {
      src: [prefs.options.sourcePath + '**/*.xml']
    }
  };
};
