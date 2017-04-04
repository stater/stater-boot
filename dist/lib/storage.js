'use strict';

exports.__esModule = true;
exports.default = undefined;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _helpers = require('./helpers');

var _object = require('./object');

var _event = require('./event');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { magenta } = _helpers.logger.color;

// Storage Index Holder.
let StorageLibrary = class StorageLibrary {};

const slib = new StorageLibrary();

// Storage Remover Event Handler.
_event.event.on('storage-index.delete', id => {
  (0, _assert2.default)(typeof id === 'string', 'ERDELSR: Storage ID must be a string.');
  delete slib[id];
});

// Storage Class.
let Storage = class Storage {
  constructor(data = {}) {
    (0, _assert2.default)((0, _helpers.typeOf)(data) === 'object', `${magenta('data')} should be an object!`);

    let uuid = (0, _helpers.suid)();

    Object.defineProperty(this, 'id', { enumerable: false, writable: false, value: uuid });

    // Create data holder.
    slib[uuid] = createClass(`${this.constructor.name}Data`);

    // Assign the given data to the data holder.
    Object.assign(slib[uuid], data);
  }

  get(path, reversed) {
    if (typeof path !== 'undefined') {
      (0, _assert2.default)(typeof path === 'string', `${magenta('path')} should be a string!`);
      return (0, _object.get)(slib[this.id] || {}, path, reversed);
    } else {
      return slib[this.id] || {};
    }
  }

  set(path, value) {
    (0, _assert2.default)(typeof path === 'string', `${magenta('path')} should be a string!`);
    (0, _object.set)(slib[this.id] || {}, path, value);
    return this;
  }

  con(path, value) {
    (0, _assert2.default)(typeof path === 'string', `${magenta('path')} should be a string!`);
    (0, _object.bind)(slib[this.id] || {}, path, value);
    return this;
  }

  merge(...targets) {
    (0, _assert2.default)(targets.length > 0, `${magenta('targets')} cannot be blank and must be in equal types.`);
    (0, _object.merge)(slib[this.id] || {}, ...targets);
    return this;
  }

  list(exclude = true) {
    return (0, _object.list)(slib[this.id] || {}, exclude);
  }
};
exports.default = Storage;


function createClass(name) {
  return new (new Function(`return class ${name} {}`)())();
}
module.exports = exports['default'];