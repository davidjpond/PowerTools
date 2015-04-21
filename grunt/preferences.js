// The overall preferences for the entire project
var prefs = {
  package: require('../package.json'),
  project: require('../.yo-rc.json'),
  options: {
    'globalVars': {
      'Handlebars': true,
      '$j': true,
      'jQuery': true,
      'ng': true,
      'pearsonCPT': true,
      'cpt': true,
      'beforeEach': true,
      'afterEach': true,
      'describe': true,
      'expect': true,
      'it': true,
      'spyOn': true,
      'xdescribe': true,
      'xit': true,
      'PowerTools' : true,
      'YAHOO': true
    },
    'sourcePath': 'src/',
    'distributionPath': 'dist/',
    'documentationPath': 'doc/',
    'tempPath': '.tmp/',
    'pluginPath': 'plugin/',
    'oracleSQLPath': 'oracle/',
    'lowerName': 'powertools',
    'projectName': 'PowerTools'
  }
};

module.exports = prefs;
