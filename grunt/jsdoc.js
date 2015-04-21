// Produce developer documentation based on jsdoc notes in the source
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    dist: {
      src: [
          prefs.options.tempPath + 'web_root/**/*.js',
          'grunt/jsdoc-template/README.md'
      ],
      options: {
        destination: prefs.options.documentationPath,
        template: 'grunt/jsdoc-template',
        lenient: true,
        configure: 'grunt/jsdoc-template/jsdoc.conf.json'
      }
    }
  };
};
