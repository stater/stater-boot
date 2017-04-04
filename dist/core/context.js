'use strict';

exports.__esModule = true;
exports.default = undefined;

var _lib = require('../lib');

var _helpers = require('../lib/helpers');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const LoggerIndex = {};
let stater = null;

let Context = class Context extends _lib.Storage {
  constructor(s) {
    super();

    stater = s;

    LoggerIndex[this.id] = new _helpers.Logger({
      caller: `${this.id}`,
      write: true,
      signs: true
    });
  }

  get logs() {
    return LoggerIndex[this.id];
  }

  sign(name) {
    if (typeof name === 'string') {
      this.logs.config.caller = `${name}][${this.id}`;
    } else {
      this.logs.config.caller = `${this.id}`;
    }

    return this.logs;
  }

  start(...args) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (stater && stater.start) {
        try {
          return yield stater.start(...args);
        } catch (error) {
          throw error;
        }
      } else {
        throw new Error(`Context ${_this.id} not properly initialized.`);
      }
    })();
  }

  emit(...args) {
    stater.emit(...args);
    return this;
  }
};
exports.default = Context;
module.exports = exports['default'];