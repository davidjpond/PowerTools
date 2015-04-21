// Minify files with UglifyJS
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    options: {
      'mangle': true,
      'compress': true,
      'beatify': false,
      'report': 'min',
      'sourceMap': false,
      'sourceMapName': '',
      'sourceMapIn': '',
      'sourceMapIncludeSources': false,
      'wrap': '',
      'exportAll': false,
      'preserveComments': false,
      'banner': '/*! ' + prefs.options.projectName + ' - ' + prefs.package.version +
        ' - (c) 2014 Pearson Education, Inc., or its affiliate(s). All rights reserved */'
    },
    all: {
      expand: true,
      cwd: prefs.options.tempPath + 'web_root/',
      src: ['**/*.js'],
      dest: prefs.options.tempPath + 'web_root/'
    }
  };
};
