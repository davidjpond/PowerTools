// Check javascript for style guide adherence
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    src: prefs.options.sourcePath + 'web_root/**/*.js',
    options: {
      "requireCurlyBraces": [
        "if",
        "else",
        "for",
        "while",
        "do",
        "try",
        "catch",
        "case",
        "default"
      ],
      "requireSpaceAfterKeywords": [
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "return",
        "try",
        "catch"
      ],
      "requireParenthesesAroundIIFE": true,
      "requireSpacesInFunctionExpression": {
        "beforeOpeningCurlyBrace": true
      },
      "requireSpacesInAnonymousFunctionExpression": {
        "beforeOpeningCurlyBrace": true
      },
      "requireSpacesInNamedFunctionExpression": {
        "beforeOpeningCurlyBrace": true
      },
      "disallowSpacesInNamedFunctionExpression": {
        "beforeOpeningRoundBrace": true
      },
      "requireBlocksOnNewline": true,
      "disallowEmptyBlocks": true,
      "disallowSpacesInsideObjectBrackets": true,
      "disallowSpacesInsideArrayBrackets": true,
      "disallowSpacesInsideParentheses": true,
      "disallowSpaceAfterObjectKeys": true,
      "requireCommaBeforeLineBreak": true,
      "requireOperatorBeforeLineBreak": [
        "?",
        "+",
        "-",
        "/",
        "*",
        "=",
        "==",
        "===",
        "!=",
        "!==",
        ">",
        ">=",
        "<",
        "<="
      ],
      "disallowSpaceAfterBinaryOperators": ["!"],
      "disallowSpaceBeforeBinaryOperators": [","],
      "requireSpaceBeforeBinaryOperators": [
        "?",
        "+",
        "-",
        "/",
        "*",
        "=",
        "==",
        "===",
        "!=",
        "!==",
        ">",
        ">=",
        "<",
        "<="
      ],
      "requireSpaceAfterBinaryOperators": [
        "?",
        "+",
        "/",
        "*",
        ":",
        "=",
        "==",
        "===",
        "!=",
        "!==",
        ">",
        ">=",
        "<",
        "<="
      ],
      "disallowKeywords": ["with"],
      "disallowMultipleLineStrings": true,
      "disallowMultipleLineBreaks": true,
      "disallowTrailingWhitespace": true,
      "disallowKeywordsOnNewLine": ["else"],
      "requireLineFeedAtFileEnd": true,
      "maximumLineLength": 120,
      "disallowYodaConditions": true,
      "validateJSDoc": {
        "checkParamNames": true,
        "checkRedundantParams": true,
        "requireParamTypes": true
      },
      "excludeFiles": [
        "node_modules/**",
        prefs.options.sourcePath + 'web_root/scripts/pearsoncpt/' + prefs.options.lowerName + '/vendor/**/*.js',
        prefs.options.sourcePath + 'web_root/scripts/pearsoncpt/' + prefs.options.lowerName + '/cpt.min.js',
        prefs.options.sourcePath + 'web_root/admin/tech/PowerTools/js/yui/**/*.*'
      ]
    }
  };
};
