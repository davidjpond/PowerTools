// Validate html files with htmlhint
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    html: {
      src: [prefs.options.sourcePath + 'web_root/**/*.html','!**/*.json.html','!**/*.hbs.html'],
      options: {
        "attr-lowercase": true,
        "attr-value-double-quotes" : true,
        "doctype-first": false,
        "tag-pair" :false,
        "src-not-empty": true
      }
    },
    txt: {
      src: [prefs.options.sourcePath + 'web_root/**/*.txt'],
      options: {
        "attr-lowercase": true,
        "attr-value-double-quotes": true,
        "tag-pair": false,
        "id-unique": true,
        "src-not-empty": true
      }
    }
  };
};
