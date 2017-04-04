'use strict';

exports.__esModule = true;
exports.merge = exports.list = exports.bind = exports.set = exports.get = undefined;

var _getter = require('./getter');

var _getter2 = _interopRequireDefault(_getter);

var _setter = require('./setter');

var _setter2 = _interopRequireDefault(_setter);

var _bind2 = require('./bind');

var _bind3 = _interopRequireDefault(_bind2);

var _list2 = require('./list');

var _list3 = _interopRequireDefault(_list2);

var _merge2 = require('./merge');

var _merge3 = _interopRequireDefault(_merge2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.get = _getter2.default;
exports.set = _setter2.default;
exports.bind = _bind3.default;
exports.list = _list3.default;
exports.merge = _merge3.default;