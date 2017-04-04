'use strict';

exports.__esModule = true;
exports.absolute = absolute;

var _path = require('path');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function absolute(path, cwd) {
  (0, _assert2.default)(typeof path === 'string', 'Path must be a string.');

  if (/^\//.test(path) || /^[\w]:/.test(path)) {
    return path;
  } else {
    return (0, _path.join)(cwd || process.cwd(), path);
  }
}