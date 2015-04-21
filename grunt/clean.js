// Empties folders to start fresh
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    build: [
      prefs.options.distributionPath
    ],
    doc: [
      prefs.options.documentationPath
    ],
    examples: [
        prefs.options.tempPath + 'web_root/admin/pearsoncpt/reports/example_transcript/**/*.*'
    ],
    plugin: [
      prefs.options.pluginPath
    ],
    schemaextensions: [
        prefs.options.tempPath + 'user_schema_root'
    ],
    sql: [
      prefs.options.oracleSQLPath
    ],
    temp: [
      prefs.options.tempPath
    ],
    tempjs: [
        prefs.options.tempPath + 'web_root/**/*.js'
    ],
    templtk: [
        prefs.options.tempPath + 'MessageKeys'
    ],
    tempminjs: [
        prefs.options.tempPath + 'web_root/**/*.min.js'
    ],
    tempjson: [
        prefs.options.tempPath + 'web_root/**/*.json.html',
        prefs.options.tempPath + 'web_root/**/*.json'
    ],
    tempvendorjs: [
      prefs.options.tempPath + 'web_root/scripts/pearsoncpt/' + prefs.options.lowerName + '/vendor/**/*.*'
    ]
  };
};
