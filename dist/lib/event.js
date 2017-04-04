'use strict';

exports.__esModule = true;
exports.EventEmitter = exports.event = undefined;

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Creating default event emitter.
const event = new _events2.default();

exports.event = event;
exports.EventEmitter = _events2.default;