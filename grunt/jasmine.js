// Run jasmine specs headlessly through PhantomJS.
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    default: {
      src: [
          prefs.options.sourcePath + 'web_root/scripts/pearsoncpt/' + prefs.options.lowerName + '/' + prefs.options.lowerName + '.js'
      ],
      options: {
        specs: [
            prefs.options.sourcePath + 'web_root/admin/pearsoncpt/' + prefs.options.lowerName + '/unit_tests/' + prefs.options.lowerName + '_tests.js'
        ],
        host: 'http://localhost:65135',
        build: true,
        outfile: prefs.options.sourcePath + 'web_root/admin/pearsoncpt/' + prefs.options.lowerName + '/unit_tests/SpecRun.html',
        keepRunner: false,
        display: 'full',
        summary: true
      }
    }
  };
};
