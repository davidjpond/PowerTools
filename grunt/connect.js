// Start a connect web server.
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    default: {
      options: {
        port: 65135,
        protocol: 'http',
        hostname: 'localhost'
      }
    }
  };
};
