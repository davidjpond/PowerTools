// Relocate files to another directory
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    alltodist: {
      files: [
        {
          expand: true,
          cwd: prefs.options.tempPath,
          src: ['**/*.{css,html,js,png,jpg,jpeg,gif,xml,properties,txt}'],
          dest: prefs.options.distributionPath
        }
      ]
    },
    alltotemp: {
      files: [
        {
          expand: true,
          cwd: prefs.options.sourcePath,
          src: ['**/*.{css,html,js,png,jpg,jpeg,gif,xml,properties,txt,json}'],
          dest: prefs.options.tempPath
        }
      ]
    },
    cptminlib: {
      files: [
        {
          expand: true,
          cwd: 'node_modules/cpt-library/dist/web_root/scripts/pearsoncpt/cpt_library',
          src: ['cpt.min.js'],
          dest: prefs.options.sourcePath + 'web_root/scripts/pearsoncpt/' + prefs.options.lowerName
        }
      ]
    },
    htmljsontodist: {
      files: [
        {
          expand: true,
          cwd: prefs.options.tempPath + 'web_root/',
          src: ['**/*.json.html', '**/*.json'],
          dest: prefs.options.distributionPath + 'web_root/'
        }
      ]
    },
    jslibtotemp: {
      files: [
        {
          expand: true,
          cwd: prefs.options.sourcePath,
          src: ['**/*.js'],
          dest: prefs.options.tempPath,
          rename: function (dest, src) {
            return dest = prefs.options.tempPath + src.substring(0, src.indexOf('.js')) + '.min.js';
          }
        }
      ]
    },
    messagekeystodist: {
      files: [
        {
          expand: true,
          cwd: prefs.options.tempPath + 'MessageKeys/',
          src: ['**/*.properties'],
          dest: prefs.options.distributionPath + 'MessageKeys/'
        }
      ]
    },
    minjstodist: {
      files: [
        {
          expand: true,
          cwd: prefs.options.tempPath + 'web_root/',
          src: ['**/*.min.js'],
          dest: prefs.options.distributionPath + 'web_root/'
        }
      ]
    },
    schemaexttodist: {
      files: [
        {
          expand: true,
          cwd: prefs.options.tempPath + 'user_schema_root/',
          src: ['**/*.xml'],
          dest: prefs.options.distributionPath + 'user_schema_root/'
        }
      ]
    },
    sqltoroot: {
      files: [
        {
          expand: true,
          cwd: prefs.options.sourcePath + 'oracle/',
          src: ['**/*.*'],
          dest: prefs.options.oracleSQLPath
        }
      ]
    },
    vendorjstodist: {
      files: [
        {
          expand: true,
          cwd: prefs.options.sourcePath + 'web_root/scripts/pearsoncpt/cpt_library/vendor/**/*.*',
          src: ['**/*.*'],
          dest: prefs.options.distributionPath + 'web_root/scripts/pearsoncpt/cpt_library/vendor/**/*.*'
        }
      ]
    }
  };
};
