'use strict';

exports.__esModule = true;
exports.default = get;

var _the = require('../helpers/the');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(target, path, vdef) {
  (0, _assert2.default)((0, _the.the)(target).is(['array', 'object', 'arguments', 'function']), 'Target should be an object, an array, an arguments or a function.');
  (0, _assert2.default)(typeof path === 'string' || Array.isArray(path), 'Path should be a string or an array.');

  if (typeof path === 'string') {
    let current = target;
    let paths = path.split('.');
    let done, result;

    while (!done && paths.length > 0) {
      let [next] = paths;

      if (paths.length <= 1) {
        if (typeof current[next] !== 'undefined') {
          result = current[next];
        } else {
          result = undefined;
          done = true;
        }
      } else {
        if ((0, _the.the)(current[next]).is(['object', 'array', 'arguments', 'function'])) {
          current = current[next];
        } else {
          result = undefined;
          done = true;
        }
      }

      paths.shift();
    }

    if (typeof result === 'undefined' && typeof vdef !== 'undefined') {
      result = vdef;
    }

    return result;
  }
}
module.exports = exports['default'];