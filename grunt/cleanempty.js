// Remove empty files and folders
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    dist: {
      options: {
        files: true,
        folders: true
      },
      src: [
          prefs.options.distributionPath + '**/*'
      ]
    },
    temp: {
      options: {
        files: true,
        folders: true
      },
      src: [
          prefs.options.tempPath + '**/*'
      ]
    }
  };
};