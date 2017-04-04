'use strict';

exports.__esModule = true;
exports.default = factory;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _jsmicroTypeof = require('jsmicro-typeof');

var _jsmicroTypeof2 = _interopRequireDefault(_jsmicroTypeof);

var _the = require('./the');

var _getter = require('../object/getter');

var _getter2 = _interopRequireDefault(_getter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REGX_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
const REGX_ARGUMENT = /([^\s,]+)/g;

let Factory = class Factory {
  constructor(fn) {
    (0, _assert2.default)(typeof fn === 'function', 'Factory function should be a function.');

    this.fn = fn;
  }

  get args() {
    const { $require } = this.fn;

    if (Array.isArray($require)) {
      return $require;
    } else {
      let fnStr = this.fn.toString().replace(REGX_COMMENTS, '');
      let args = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(REGX_ARGUMENT);

      return args === null ? [] : args;
    }
  }

  parse(sources, inmodule = false) {
    (0, _assert2.default)((0, _the.the)(sources).is(['array', 'object']), 'Sources should be an array or an object.');

    let result = [];
    let { args } = this;

    if (Array.isArray(sources)) {
      for (let source of sources) {
        args.forEach((key, i) => {
          let value = (0, _getter2.default)(source, key);

          if (value) {
            result[i] = value;
          } else {
            if (!result[i]) {
              result[i] = undefined;
            }
          }
        });
      }
    } else if ((0, _jsmicroTypeof2.default)(sources) === 'object') {
      args.forEach((key, i) => {
        let value = (0, _getter2.default)(sources, key);

        if (value) {
          result[i] = value;
        } else {
          if (!result[i]) {
            result[i] = undefined;
          }
        }
      });
    }

    result.map(value => {
      if (typeof value === 'undefined' && inmodule) {
        try {
          return require(args[result.indexOf(value)]);
        } catch (err) {
          throw err;
        }
      } else {
        if (!value) {
          return undefined;
        }
      }
    });

    return result;
  }
};
function factory(fn) {
  return new Factory(fn);
}
module.exports = exports['default'];