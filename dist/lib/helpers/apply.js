'use strict';

exports.__esModule = true;
exports.default = apply;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function apply(fn, ...params) {
  (0, _assert2.default)(typeof fn === 'function', 'Function to apply should be a function.');

  return new (Function.prototype.bind.apply(fn, [null, ...params]))();
}
module.exports = exports['default'];