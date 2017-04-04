'use strict';

exports.__esModule = true;
exports.default = bind;

var _the = require('../helpers/the');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bind(target, name, value) {
  (0, _assert2.default)((0, _the.the)(target).is(['object', 'function']), 'Target should be an object or a function.');
  (0, _assert2.default)(typeof name === 'string', 'Property name should a string.');

  target[name] = value;

  Object.defineProperty(target, name, { enumerable: false, writable: false });

  return target;
}
module.exports = exports['default'];