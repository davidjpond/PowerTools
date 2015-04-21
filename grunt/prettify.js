// Make sure code styles are up to par and there are no obvious mistakes
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    options: {
      "indent": 2,
      "indent_char": " ",
      "indent_scripts": "normal",
      "indent_inner_html": false,
      "brace_style": "collapse",
      "preserve_newlines": true,
      "max_preserve_newlines": 1,
      "unformatted": [
        "a",
        "code",
        "pre"
      ],
      "wrap_line_length": 120,
      padcomments: false
    },
    all: {
      expand: true,
      cwd: prefs.options.tempPath + 'web_root/',
      src: ['**/*.html'],
      dest: prefs.options.tempPath + 'web_root/'
    }
  };
};
