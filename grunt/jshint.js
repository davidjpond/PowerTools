// Make sure code styles are up to par and there are no obvious mistakes
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    options: {
      "bitwise": true,
      "browser": true,
      "devel": true,
      "camelcase": true,
      "curly": true,
      "esnext": true,
      "eqeqeq": true,
      "freeze": true,
      "globalstrict": true,
      "immed": true,
      "indent": 2,
      "latedef": true,
      "newcap": true,
      "noarg": true,
      "nonbsp": true,
      "nonew": true,
      "node": true,
      "quotmark": "single",
      "regexp": true,
      "smarttabs": true,
      "trailing": true,
      "undef": true,
      "globals": prefs.options.globalVars,
      "ignores": [
          prefs.options.sourcePath + 'web_root/scripts/pearsoncpt/' + prefs.options.lowerName + '/vendor/**/*.js',
          prefs.options.sourcePath + 'web_root/scripts/pearsoncpt/' + prefs.options.lowerName + '/cpt.min.js',
          prefs.options.sourcePath + 'web_root/admin/tech/PowerTools/js/yui/**/*.*'
      ]
    },
    all: [
        prefs.options.sourcePath + 'web_root/**/*.js'
    ]
  };
};
