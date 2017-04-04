'use strict';

exports.__esModule = true;

exports.default = function (pattern = uqDate()) {
  (0, _assert2.default)(typeof pattern === 'string', 'Pattern should be a string.');
  return (0, _shorthash.unique)(pattern).toLowerCase();
};

var _shorthash = require('shorthash');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function uqDate() {
  return `${new Date().valueOf()}${Math.random()}`;
}
module.exports = exports['default'];