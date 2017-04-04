'use strict';

exports.__esModule = true;
exports.default = list;

var _the = require('../helpers/the');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function list(target, exclude) {
  (0, _assert2.default)((0, _the.the)(target).is(['array', 'object', 'arguments', 'function']), 'Target should be an array, an object, an arguments or a function.');

  let path = '';
  let maps = {};

  parse(path, maps, target, exclude);

  return maps;
}

function parse(path, maps, object, exclude) {
  for (let key in object) {
    const value = object[key];

    let last = path;
    let cpath = `${path}${!path ? '' : '.'}${key}`;

    if ((0, _the.the)(value).not(['array', 'object', 'arguments', 'function']) || !exclude) {
      maps[cpath] = value;
    }

    if ((0, _the.the)(value).is(['array', 'object', 'arguments', 'function'])) {
      path = cpath;
      parse(path, maps, value, exclude);
      path = last;
    }
  }
}
module.exports = exports['default'];