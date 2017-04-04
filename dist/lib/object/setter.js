'use strict';

exports.__esModule = true;
exports.default = set;

var _the = require('../helpers/the');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function set(target, path, value) {
  (0, _assert2.default)((0, _the.the)(target).is(['array', 'object', 'arguments', 'function']), 'Target should be an array, an object, an arguments or a function.');
  (0, _assert2.default)(typeof path === 'string', 'Target path should be a string.');

  let current = target;
  let paths = path.split('.');

  while (paths.length > 0) {
    const [next] = paths;

    if (paths.length <= 1) {
      current[next] = value;
      current = current[next];
    } else {
      if ((0, _the.the)(current[next]).is(['array', 'object', 'arguments', 'function'])) {
        current = current[next];
      } else {
        current[next] = {};
        current = current[next];
      }
    }

    paths.shift();
  }

  return current;
}
module.exports = exports['default'];