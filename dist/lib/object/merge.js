'use strict';

exports.__esModule = true;
exports.default = merge;

var _jsmicroTypeof = require('jsmicro-typeof');

var _jsmicroTypeof2 = _interopRequireDefault(_jsmicroTypeof);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _the = require('../helpers/the');

var _entries = require('../helpers/entries');

var _entries2 = _interopRequireDefault(_entries);

var _setter = require('./setter');

var _setter2 = _interopRequireDefault(_setter);

var _list = require('./list');

var _list2 = _interopRequireDefault(_list);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function merge(source, ...targets) {
  (0, _assert2.default)((0, _the.the)(source).is(['array', 'object', 'arguments', 'function']), 'The source should be an array, an object, an arguments or a function.');

  const spaths = (0, _list2.default)(source);

  for (let target of targets) {
    (0, _assert2.default)((0, _the.the)(target).like(source), 'The target and the source should have an equal type.');

    if ((0, _jsmicroTypeof2.default)(target) === 'storage') {
      target = target.data;
    }

    let tpaths = (0, _list2.default)(target);

    for (let [path, value] of (0, _entries2.default)(tpaths)) {
      if ((0, _the.the)(value).is(['array', 'object', 'arguments', 'function'])) {
        if ((0, _the.the)(spaths[path]).unlike(value)) {
          (0, _setter2.default)(source, path, value);
        }
      } else {
        (0, _setter2.default)(source, path, value);
      }
    }
  }

  return source;
}
module.exports = exports['default'];