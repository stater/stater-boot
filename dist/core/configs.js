'use strict';

exports.__esModule = true;
exports.configs = exports.default = undefined;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _helpers = require('../lib/helpers');

var _object = require('../lib/object');

var _version = require('../lib/helpers/version');

var _store = require('../lib/store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let { yellow } = _helpers.logger.color;

const configurators = {};

let ConfigStore = class ConfigStore extends _store2.default {
  get type() {
    return 'object';
  }

  set(name_version, value) {
    (0, _assert2.default)(typeof name_version === 'string', this.errinfo.MSG_VER_NAME);
    (0, _assert2.default)((0, _helpers.typeOf)(value) === 'object', this.errinfo.MSG_VAL_TYPE);

    let { name, version } = (0, _version.split)(name_version);

    if (name && version) {
      let nv = `${name}#${version}`;

      if (!this.versions[name]) {
        this.versions[name] = {};
      }

      if (typeof value.reconfigure === 'function') {
        if (!configurators[nv]) {
          configurators[nv] = [];
        }

        configurators[nv].push(value.reconfigure);
      }

      if (!this.versions[name][version]) {
        Object.defineProperty(value, 'name', { enumerable: false, writable: false, value: name });
        Object.defineProperty(value, 'version', { enumerable: false, writable: false, value: version });

        this.versions[name][version] = value;
      } else {
        (0, _object.merge)(this.versions[name][version], value);
      }

      if (configurators[nv]) {
        this.versions[name][version].reconfigure = configurators[nv];
      }
    } else {
      throw new Error(`${this.name} name or version is invalid: ${name_version}.`);
    }

    return this;
  }

  reconfigure() {
    var _this = this;

    return _asyncToGenerator(function* () {
      let hash = (0, _helpers.suid)();

      for (let [name, versions] of (0, _helpers.entries)(_this.versions)) {
        for (let version in versions) {
          yield _this.configure(name, version, hash);
        }
      }

      return _this;
    })();
  }

  configure(name, version, hash) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      (0, _assert2.default)(typeof name === 'string', 'ConfigStore: configure: name must be a string.');
      (0, _assert2.default)(typeof hash === 'string', 'ConfigStore: configure: hash must be a string.');

      let config = _this2.get(typeof version === 'string' ? `${name}#${version}` : name);

      if (Array.isArray(config.reconfigure)) {
        for (let reconfigure of config.reconfigure) {
          if (typeof reconfigure === 'function') {
            if (reconfigure.hash && reconfigure.hash === hash) {
              return;
            }

            _helpers.logger.debug(`Reconfiguring config ${yellow(`${name}#${version || 'latest'}`)}...`);

            if (Array.isArray(reconfigure.require)) {
              for (let dname of reconfigure.require) {
                yield _this2.configure(dname, null, hash);
              }
            }

            yield reconfigure(config, _this2);

            config.reconfigure.hash = hash;

            _helpers.logger.debug(`Config ${yellow(`${name}#${version || 'latest'}`)} successfully reconfigured.`);
          }
        }
      }

      return _this2;
    })();
  }
};
exports.default = ConfigStore;
const configs = exports.configs = new ConfigStore();