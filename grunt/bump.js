// Bump package version, create tag, commit, push ...
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    options: {
      files: ['package.json', '.yo-rc.json'],
      updateConfigs: [],
      commit: false,
      createTag: false,
      push: false
    }
  };
};
