// Zip the final package
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    plugin: {
      options: {
        archive: 'plugin/' + prefs.options.lowerName + '_' + prefs.package.version + '.zip',
        mode: 'zip'
      },
      files: [
        {
          expand: true,
          cwd: prefs.options.distributionPath,
          src: ['**/*.*'],
          dest: '/'
        }
      ]
    },
    doc: {
      options: {
        archive: 'doc/' + prefs.options.lowerName + '_' + prefs.package.version + '_doc.zip',
        mode: 'zip'
      },
      files: [
        {
          expand: true,
          cwd: prefs.options.documentationPath,
          src: ['**/*.*', '!**.*.zip'],
          dest: '/'
        }
      ]
    }
  };
};
