// Display notifications about the grunt process (requires Snarl on Windows)
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    beginbuild: {
      options: {
        title: 'Grunt Build',
        message: prefs.options.projectName + ': Build process starting'
      }
    },
    cleanandbuild: {
      options: {
        title: 'Grunt Clean and Build',
        message: prefs.options.projectName + ': Cleaning files and building distribution files'
      }
    },
    codecheck: {
      options: {
        title: 'Grunt Code Check',
        message: prefs.options.projectName + ': Checking JavaScript and CSS for style and validity'
      }
    },
    complete: {
      options: {
        title: 'Grunt Build Complete',
        message: prefs.options.projectName + ': Plugin generated. Build completed'
      }
    },
    createplugin: {
      options: {
        title: 'Grunt Create Plugin',
        message: prefs.options.projectName + ': Generating plugin.xml and zip file'
      }
    },
    stage: {
      options: {
        title: 'Grunt Staging Files',
        message: prefs.options.projectName + ': Preparing files for clean and build process'
      }
    },
    test: {
      options: {
        title: 'Beginning Unit Tests',
        message: prefs.options.projectName + ': Performing jasmine tests.'
      }
    },
    watch: {
      options: {
        title: 'Grunt Watching Files',
        message: prefs.options.projectName + ': Watching files for changes'
      }
    }
  };
};
